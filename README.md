# PGRC — Piattaforma per la Gestione di Ricette di Cucina

Progetto per il corso **Programmazione Web e Mobile** (A.A. 2025/2026).

PGRC è un portale web per la gestione di ricette culinarie: un utente
registrato può cercare ricette (dati forniti dalle API di
[TheMealDB](https://www.themealdb.com/)), salvarle e personalizzarle nel
proprio **ricettario personale**, aggiungere **note private** e pubblicare
**recensioni** visibili a tutti gli utenti.

## Stack tecnico

- **HTML5** — applicazione multi-pagina (una pagina per vista)
- **CSS3** — presentazione interamente in `css/style.css`
- **Bootstrap 5** (via CDN) — reset, griglia e componenti di base; l'aspetto
  è definito dal tema personalizzato in `css/style.css`
- **JavaScript vanilla** — nessun framework JS
- **Web Storage** (`localStorage` + `sessionStorage`) in formato JSON
- **TheMealDB API** — sorgente dei dati delle ricette

## Come si avvia

Non serve alcuna build: è sufficiente servire la cartella con un web server
statico e aprire `index.html` (serve la connessione a Internet al primo
avvio per scaricare le ricette e Bootstrap dal CDN).

```bash
# una qualunque delle due
python3 -m http.server 8080
npx serve .
```

Poi visitare <http://localhost:8080/>.

> Al primo avvio l'app scarica l'intero dataset di TheMealDB (una richiesta
> per lettera a–z) e lo salva nel Web Storage: le visite successive e tutte
> le ricerche lavorano sui dati locali.

## Struttura del progetto

```
PGRC/
├── index.html          # Home: ricerca rapida, lettere, ricette in evidenza
├── search.html         # Ricerca (titolo, ingrediente, testo, lettera, tutti i campi)
├── recipe.html         # Scheda ricetta (?id=…): ingredienti, procedimento,
│                       #   note private e recensioni
├── cookbook.html       # Ricettario personale (richiede login)
├── profile.html        # Profilo utente (richiede login)
├── login.html          # Accesso
├── register.html       # Registrazione (crea anche il ricettario vuoto)
├── reset.html          # Recupero password (domanda di sicurezza)
├── css/
│   └── style.css       # Tema del progetto + livello di compatibilità Bootstrap
└── js/
    ├── storage.js      # Persistenza su Web Storage (oggetti Storage e DB)
    ├── api.js          # Integrazione TheMealDB + ricerche sui dati locali
    ├── auth.js         # Registrazione, login, profilo, recupero password
    ├── ui.js           # Utility, componenti condivisi, rendering, azioni globali
    └── pages/          # Uno script per pagina: definisce l'oggetto `Page`
        ├── home.js     ├── search.js   ├── recipe.js   ├── cookbook.js
        ├── profile.js  ├── login.js    ├── register.js └── reset.js
```

Ogni pagina HTML condivide la stessa struttura (header, footer, toast) e
carica gli script comuni più il proprio script di pagina, che definisce un
oggetto globale `Page` con `render(params)` / `bind(params)` (ed
eventualmente `requiresAuth: true`). `js/ui.js` si occupa dell'avvio: guardia
di autenticazione, seeding dei dati e rendering della vista.

La documentazione dettagliata di **tutti i metodi** è in [DOCS.md](DOCS.md).

## Funzionalità

### Progetto Light
- Registrazione (username, email, password, piatti preferiti) con creazione
  automatica del ricettario personale vuoto
- Login / logout, gestione della sessione nel Web Storage
- Visualizzazione, modifica e cancellazione del profilo
- Ricerca per titolo e visualizzazione della scheda ricetta
- Aggiunta / modifica (titolo e procedimento personalizzati) / rimozione
  delle ricette del ricettario

### Progetto Full
- Ricerca per ingrediente e per testo descrittivo (+ per lettera iniziale e
  combinata su tutti i campi)
- Scheda ricetta completa con recensioni degli altri utenti e medie dei voti
- Note private per ricetta (aggiunta e rimozione, visibili solo all'utente)
- Recensioni con data di preparazione, voto difficoltà e voto gusto (1–5),
  con rimozione da parte dell'autore

### Extra
- Recupero password tramite domanda di sicurezza
- Password mai salvate in chiaro (hash SHA-256 con salt per utente)
- Paginazione dei risultati ("Mostra altri")
- Toast di feedback per tutte le operazioni

## Dati nel Web Storage

| Chiave | Contenuto |
|---|---|
| `pgrc_users` | array degli utenti (credenziali, preferiti, ricettario con note) |
| `pgrc_session` | sessione corrente `{ userId, loginAt }` |
| `pgrc_recipes` | mappa `id → ricetta` normalizzata da TheMealDB |
| `pgrc_reviews` | array delle recensioni pubbliche |
| `pgrc_seeded_at` | timestamp dell'ultimo download completo |

Lo schema completo dei dati è documentato in testa a `js/storage.js` e in
[DOCS.md](DOCS.md).
