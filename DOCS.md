# PGRC — Documentazione del codice

Riferimento di studio: tutti i metodi e le funzioni del progetto, file per
file, con firma, parametri, valore di ritorno e ruolo nell'applicazione.

## Come funziona l'applicazione (visione d'insieme)

1. Ogni pagina HTML carica, nell'ordine: Bootstrap, `storage.js`, `api.js`,
   `auth.js`, `ui.js` e il proprio script in `js/pages/`.
2. Lo script di pagina definisce un oggetto globale **`Page`**:
   - `render(params)` → ritorna la stringa HTML della vista
     (`params` è un `URLSearchParams` con la query string della pagina);
   - `bind(params)` → (facoltativo) aggancia gli eventi ai form appena inseriti;
   - `requiresAuth: true` → (facoltativo) la pagina richiede il login.
3. All'evento `DOMContentLoaded`, `ui.js`:
   - applica la **guardia di autenticazione** (redirect a `login.html` se serve);
   - esegue il **seeding** (`API.seedIfNeeded`): al primo avvio scarica tutte
     le ricette da TheMealDB e le salva nel Web Storage;
   - chiama `render()`, che inserisce `Page.render(params)` dentro
     `<main id="view">` e poi invoca `Page.bind(params)`.
4. Le azioni "trasversali" (aggiungi/rimuovi dal ricettario, elimina nota,
   ecc.) sono bottoni con attributo `data-action`, gestiti da un unico
   listener globale in `ui.js` (event delegation). Dopo ogni azione i dati
   vengono salvati nel Web Storage e la vista viene ridisegnata con `render()`.

Flusso dei dati: **pagina → `Auth`/`API` (logica) → `DB` (persistenza) →
`Storage` (localStorage)**.

---

## js/storage.js — Persistenza su Web Storage

### Oggetto `Storage` (wrapper di basso livello su `localStorage`)

| Metodo | Descrizione |
|---|---|
| `read(key, fallback = null)` | Legge `key` da `localStorage` e ne fa il parse JSON. Ritorna `fallback` se la chiave non esiste o il JSON è corrotto (l'errore viene loggato, mai propagato). |
| `write(key, value)` | Serializza `value` in JSON e lo salva in `localStorage`. |
| `remove(key)` | Elimina la chiave da `localStorage`. |

### Oggetto `DB` (accesso ai dati applicativi)

`DB.KEYS` contiene i nomi delle chiavi usate nel Web Storage
(`pgrc_users`, `pgrc_session`, `pgrc_recipes`, `pgrc_reviews`, `pgrc_seeded_at`).

**Utenti**

| Metodo | Descrizione |
|---|---|
| `getUsers()` | Ritorna l'array di tutti gli utenti registrati (`[]` se nessuno). |
| `saveUsers(users)` | Sovrascrive l'intero array utenti. |
| `getUserById(id)` | Ritorna l'utente con quell'`id`, oppure `null`. |
| `findUserByEmail(email)` | Cerca per email (case-insensitive). Ritorna utente o `null`. |
| `findUserByUsername(username)` | Cerca per username (case-insensitive). Ritorna utente o `null`. |
| `addUser(user)` | Aggiunge un nuovo utente all'array e salva. |
| `updateUser(updated)` | Sostituisce l'utente con lo stesso `id` (usato per ogni modifica: profilo, ricettario, note). |
| `deleteUser(id)` | Rimuove l'utente **e tutte le sue recensioni**. |

**Sessione**

| Metodo | Descrizione |
|---|---|
| `getSession()` | Ritorna `{ userId, loginAt }` oppure `null`. |
| `setSession(userId)` | Crea la sessione per l'utente (login/registrazione). |
| `clearSession()` | Elimina la sessione (logout / cancellazione account). |
| `currentUser()` | Comodo: ritorna l'oggetto utente della sessione corrente, o `null` se ospite. È la funzione usata ovunque per sapere "chi è loggato". |

**Ricette (cache locale di TheMealDB)**

| Metodo | Descrizione |
|---|---|
| `getRecipeMap()` | Ritorna la mappa `{ id → ricetta }` (`{}` se vuota). |
| `saveRecipeMap(map)` | Sovrascrive la mappa delle ricette. |
| `getRecipeList()` | Ritorna tutte le ricette come **array ordinato per nome**. |
| `getRecipe(id)` | Ritorna la ricetta con quell'id, oppure `null`. |
| `upsertRecipes(recipes)` | Inserisce/aggiorna un array di ricette nella mappa (usata dal seeding). |
| `getSeededAt()` | Timestamp dell'ultimo download completo, o `null`. |
| `markSeeded()` | Registra che il seeding è stato completato ora. |

**Recensioni**

| Metodo | Descrizione |
|---|---|
| `getReviews()` | Ritorna l'array di tutte le recensioni. |
| `saveReviews(reviews)` | Sovrascrive l'array delle recensioni. |
| `getReviewsForRecipe(recipeId)` | Recensioni di una ricetta, dalla più recente. |
| `addReview(review)` | Aggiunge una recensione e salva. |
| `deleteReview(reviewId, userId)` | Rimuove la recensione **solo se** `userId` ne è l'autore. |

### Funzioni globali

| Funzione | Descrizione |
|---|---|
| `uid()` | Genera un id univoco: usa `crypto.randomUUID()` se disponibile, altrimenti un fallback basato su timestamp + numero casuale. Usata per id di utenti, note e recensioni. |

### Modello dati (JSON nel Web Storage)

```
pgrc_users    : [{ id, username, email, passwordHash, salt, favoriteDishes[],
                   security: { question, answerHash },
                   cookbook: [{ recipeId, addedAt,
                                custom: { name?, instructions? } | null,
                                notes: [{ id, text, createdAt }] }],
                   createdAt }]
pgrc_session  : { userId, loginAt } | null
pgrc_recipes  : { "<idMeal>": { id, name, category, area, instructions, thumb,
                                tags[], youtube, ingredients: [{name, measure}] } }
pgrc_reviews  : [{ id, recipeId, userId, username, prepDate,
                   difficulty (1-5), taste (1-5), comment, createdAt }]
pgrc_seeded_at: timestamp dell'ultimo download completo
```

---

## js/api.js — Integrazione con TheMealDB

### Oggetto `API`

`API.BASE` è l'endpoint base (`https://www.themealdb.com/api/json/v1/1`).

| Metodo | Descrizione |
|---|---|
| `normalizeMeal(meal)` | Converte il formato di TheMealDB (campi `strIngredient1..20`, `strMeasure1..20`, ecc.) nel modello interno compatto: `{ id, name, category, area, instructions, thumb, tags[], youtube, ingredients[] }`. |
| `fetchJson(url)` | `fetch` + controllo `response.ok` + parse JSON. Lancia `Error` in caso di stato HTTP non 2xx. *(async)* |
| `fetchByLetter(letter)` | Scarica da TheMealDB tutte le ricette che iniziano con `letter` e le normalizza. Ritorna un array (vuoto se nessun risultato). *(async)* |
| `fetchByName(query)` | Ricerca remota per nome (disponibile come fallback; l'app di norma cerca in locale). *(async)* |
| `seedIfNeeded(onProgress)` | **Cuore dello startup.** Se il Web Storage contiene già le ricette non fa nulla (`{ok:true, fromCache:true, count}`). Altrimenti scarica in parallelo le 26 lettere a–z (`Promise.allSettled`, quindi il fallimento di una lettera non blocca le altre), salva tutto con `DB.upsertRecipes` e marca il seeding. `onProgress(done, total)` aggiorna il messaggio di caricamento. Ritorna `{ ok, fromCache, count, error? }`; `ok:false` solo se non c'è né rete né cache. *(async)* |

**Ricerche sui dati locali** (operano su `DB.getRecipeList()`, nessuna richiesta di rete):

| Metodo | Descrizione |
|---|---|
| `searchByName(query)` | Ricette il cui **nome** contiene `query` (case-insensitive). Query vuota → tutte. |
| `searchByIngredient(query)` | Ricette con almeno un **ingrediente** che contiene `query`. Query vuota → nessuna. |
| `searchByText(query)` | Ricerca "descrittiva": confronta `query` con procedimento, categoria, cucina (area) e tag. |
| `searchAll(query)` | Ricerca combinata su **tutti i campi**: nome, ingredienti, procedimento, categoria, cucina (area) e tag. Query vuota → tutte (modalità "sfoglia"). |
| `searchByLetter(letter)` | Ricette il cui nome **inizia** con la lettera data. |

---

## js/auth.js — Autenticazione e profilo

### Oggetto `Auth`

Costanti: `EMAIL_RE` (regex di validazione email), `MIN_PASSWORD` (6),
`MIN_USERNAME` (3), `SECURITY_QUESTIONS` (domande di recupero disponibili).

| Metodo | Descrizione |
|---|---|
| `hash(text)` | Ritorna l'hash **SHA-256** esadecimale di `text` tramite Web Crypto API; in contesti non sicuri (es. `file://`) usa un fallback deterministico non crittografico. Le password sono sempre salvate come `hash(salt + password)`. *(async)* |
| `normalizeAnswer(answer)` | Normalizza la risposta di sicurezza (trim + minuscole) prima dell'hash, così il confronto non è sensibile a maiuscole/spazi. |
| `register(data)` | Valida tutti i campi (lunghezze minime, email, password coincidenti, domanda di sicurezza, unicità di username ed email), crea l'utente con `salt` casuale, hash della password e della risposta, **ricettario vuoto** (`cookbook: []`, requisito della specifica), lo salva e apre la sessione. Ritorna l'utente. Lancia `Error` con messaggio leggibile se la validazione fallisce. *(async)* |
| `parseDishes(raw)` | Converte la stringa "piatti preferiti" separata da virgole in array pulito (trim, elementi vuoti scartati). |
| `login(identifier, password)` | Cerca l'utente per email **o** username, confronta l'hash della password e apre la sessione. Ritorna l'utente; `Error` se credenziali errate. *(async)* |
| `logout()` | Chiude la sessione (`DB.clearSession`). |
| `getSecurityQuestion(email)` | Passo 1 del recupero password: ritorna la domanda di sicurezza dell'account con quella email. `Error` se l'email non esiste. |
| `resetPassword(email, answer, newPassword, newPasswordConfirm)` | Passo 2: verifica l'hash della risposta, valida la nuova password e la sostituisce. *(async)* |
| `updateProfile(userId, data)` | Modifica dei dati personali: valida username/email (inclusa l'unicità rispetto agli **altri** account), aggiorna i piatti preferiti e, se richiesto, cambia la password previa verifica di quella attuale. Se lo username cambia, aggiorna anche il nome mostrato nelle recensioni già pubblicate. *(async)* |
| `deleteAccount(userId)` | Cancella l'utente (con le sue recensioni, via `DB.deleteUser`) e chiude la sessione. |

---

## js/ui.js — Livello di interfaccia condiviso

Caricato da tutte le pagine. Espone lo stato globale `App.state`
(`shown` = card visibili per la paginazione, `resetEmail`/`resetQuestion` =
stato del recupero password) e la costante `PAGE_SIZE` (24).

### Utility

| Funzione | Descrizione |
|---|---|
| `esc(value)` | Escape dei caratteri HTML (`& < > " '`). **Va applicata a ogni dato dinamico** interpolato nei template per evitare injection/XSS. |
| `toast(message, type)` | Mostra il toast in basso per 3,5 s. `type` ∈ `info` (default), `success`, `error` e determina il colore. |
| `flash(message, type)` | Salva in `sessionStorage` un messaggio da mostrare **dopo la prossima navigazione** (in un'app multi-pagina un toast mostrato prima di un redirect andrebbe perso col ricaricamento). |
| `showFlash()` | Se esiste un messaggio flash lo mostra con `toast()` e lo rimuove. Chiamata all'avvio di ogni pagina. |
| `stars(n)` | Ritorna la valutazione come stringa di 5 stelle, es. `stars(3)` → `"★★★☆☆"` (n forzato in 1–5). |
| `fmtDate(value)` | Formatta timestamp o stringa data in italiano esteso (es. "7 luglio 2026"). |
| `todayISO()` | Data odierna in formato `YYYY-MM-DD` (usata come `max` del campo data delle recensioni). |
| `navigate(url)` | Cambia pagina (`location.href = url`). |

### Componenti riusabili (ritornano stringhe HTML)

| Funzione | Descrizione |
|---|---|
| `recipeCard(recipe)` | Card cliccabile di una ricetta (immagine, nome, categoria · cucina) che porta a `recipe.html?id=…`. |
| `recipeGrid(recipes, {paginate})` | Griglia di card. Con `paginate: true` mostra solo le prime `App.state.shown` e aggiunge il bottone "Mostra altri". Messaggio dedicato se l'array è vuoto. |
| `letterBar(active)` | Barra dei link a–z verso `search.html?type=letter&q=…`; `active` evidenzia la lettera corrente. |
| `searchForm(type, query)` | Form di ricerca (select del tipo + campo testo) precompilato con i valori correnti. |
| `bindSearchForm()` | Aggancia il submit del form di ricerca (naviga a `search.html` con i parametri) e rende il campo testo non obbligatorio quando il tipo è "Tutti i campi" (query vuota = sfoglia tutte). |

### Navigazione e rendering

| Funzione | Descrizione |
|---|---|
| `updateNav()` | Sincronizza l'header: mostra/nasconde le voci con `data-auth="user"` / `data-auth="guest"` a seconda della sessione, scrive lo username e evidenzia la voce attiva confrontando `data-nav` con `document.body.dataset.page`. |
| `render(keepPagination = false)` | (Ri)disegna la vista: azzera la paginazione (salvo `keepPagination`), aggiorna la nav, inserisce `Page.render(params)` in `<main id="view">`, chiama `Page.bind(params)` e scrolla in cima. Richiamata dopo ogni azione che modifica i dati. |

### Azioni globali (event delegation)

Un solo listener `click` sul `document` intercetta i bottoni con
`data-action` (funziona anche per l'HTML rigenerato dopo un `render()`):

| `data-action` | Effetto |
|---|---|
| `load-more` | Aumenta `App.state.shown` di `PAGE_SIZE` e ridisegna mantenendo la paginazione. |
| `add-to-cookbook` | Aggiunge la ricetta (`data-recipe`) al ricettario dell'utente; se ospite, porta al login. |
| `remove-from-cookbook` | Rimuove la ricetta dal ricettario (con `confirm`, si perdono le note). |
| `delete-note` | Elimina la nota privata `data-note` dalla ricetta `data-recipe`. |
| `remove-review` | Elimina la recensione `data-review` (con `confirm`, solo l'autore). |
| `toggle-edit` | Mostra/nasconde il form di personalizzazione di una voce del ricettario. |
| `reset-custom` | Rimuove titolo/procedimento personalizzati ripristinando l'originale. |
| `delete-account` | Cancella definitivamente il profilo (con `confirm`) e torna alla home. |
| `reset-restart` | Riparte dal passo 1 del recupero password. |

### Avvio della pagina (`DOMContentLoaded`)

1. aggancia il bottone **Esci** (logout + flash + redirect alla home);
2. **guardia di autenticazione**: se `Page.requiresAuth` e nessun utente è
   loggato → flash di avviso e `location.replace('login.html')`;
3. **seeding**: `API.seedIfNeeded(onProgress)` mentre la pagina mostra lo
   spinner di caricamento; in caso di fallimento senza cache mostra la
   schermata di errore con "Riprova";
4. `render()` della vista e `showFlash()` per l'eventuale messaggio
   proveniente dalla pagina precedente.

---

## js/pages/ — Script di pagina

Ogni file definisce l'oggetto `Page` della propria pagina HTML.

### home.js (`index.html`)
- `render()` — hero con messaggio personalizzato per l'utente loggato,
  `searchForm()`, `letterBar()` e anteprima delle prime 8 ricette.
- `bind()` — `bindSearchForm()`.

### search.js (`search.html?type=…&q=…`)
- `render(params)` — legge `type` (`name` | `ingredient` | `text` | `letter`
  | `all`) e `q` dalla query string, chiama la ricerca corrispondente di
  `API` (`searchAll` per `all`) e mostra i risultati con
  `recipeGrid(..., { paginate: true })` e il conteggio.
- `bind()` — `bindSearchForm()`.

### recipe.js (`recipe.html?id=…`)
- `render(params)` — scheda completa: immagine, categoria/cucina, tag, medie
  delle recensioni (gusto e difficoltà), bottone aggiungi/rimuovi dal
  ricettario, ingredienti con dosi, procedimento, sezione note private e
  sezione recensioni. Gestisce il caso "ricetta non trovata".
- `bind(params)` — submit del form **nota privata** (crea `{id, text,
  createdAt}` nella voce di ricettario) e del form **recensione** (crea la
  recensione con data di preparazione, voti 1–5 e commento facoltativo).
- Helper: `renderNotesSection(user, entry, recipeId)` — sezione note: vuota
  per gli ospiti, invito ad aggiungere la ricetta se non è nel ricettario,
  altrimenti elenco note + form. `renderReviewsSection(user, reviews,
  recipeId)` — elenco recensioni (con "Rimuovi" solo sulle proprie) + form
  per i loggati.

### cookbook.js (`cookbook.html`, `requiresAuth`)
- `render()` — elenco delle voci del ricettario (ricette eliminate dalla
  cache vengono filtrate), con stato vuoto dedicato.
- `bind()` — submit dei form di personalizzazione: salva `entry.custom =
  { name, instructions }` oppure `null` se entrambi vuoti.
- Helper: `renderCookbookEntry(entry, recipe)` — voce del ricettario con
  titolo personalizzato, badge "personalizzata", procedimento proprio,
  conteggio note e form di modifica nascosto (aperto da `toggle-edit`).

### profile.js (`profile.html`, `requiresAuth`)
- `render()` — riepilogo dei dati, form di modifica (con cambio password
  facoltativo protetto dalla password attuale) e "zona pericolosa" con la
  cancellazione dell'account.
- `bind()` — submit del form → `Auth.updateProfile(...)`; errori mostrati
  come toast.

### login.js (`login.html`)
- `render()` — form di accesso (username o email + password) con link a
  registrazione e recupero password.
- `bind()` — submit → `Auth.login(...)`; successo → flash di benvenuto e
  redirect alla home.

### register.js (`register.html`)
- `render()` — form di registrazione completo (credenziali, piatti
  preferiti, domanda e risposta di sicurezza).
- `bind()` — submit → `Auth.register(...)`; successo → flash e redirect
  alla home (già autenticato).

### reset.js (`reset.html`)
- `render()` — due passi alternati in base ad `App.state.resetQuestion`:
  passo 1 (inserisci email) o passo 2 (domanda di sicurezza + nuova
  password).
- `bind()` — passo 1 → `Auth.getSecurityQuestion(email)` e ridisegno in
  pagina; passo 2 → `Auth.resetPassword(...)`, poi flash e redirect al login.

---

## css/style.css — Presentazione

Unico foglio di stile del progetto, caricato **dopo** Bootstrap:

1. **Variabili** (`:root`) — palette (brand arancio, inchiostro, carta),
   raggio, ombra e font di sistema.
2. **Tema dei componenti** — header/nav, hero, form di ricerca, barra
   lettere, card e griglia, bottoni, scheda ricetta, note, recensioni,
   ricettario, profilo, toast, breakpoint responsive (720px e 420px).
   Le classi con lo stesso nome di Bootstrap (`.btn`, `.btn-primary`,
   `.card`, `.form-control`, `.toast`…) *ridefiniscono* il componente
   Bootstrap corrispondente.
3. **Livello di compatibilità Bootstrap** (in fondo al file) — ripristina i
   margini tipografici azzerati dal reboot, normalizza `legend`, campi form
   (bordo, raggio, focus senza ombra, freccia nativa dei `select`) e stati
   focus/active dei bottoni, così la resa resta identica al design originale.
