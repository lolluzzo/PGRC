# PGRC – Piattaforma per la Gestione di Ricette di Cucina
## Progetto PWM A.A. 2025/2026

---

## Fasi del Lavoro (richieste dalla specifica)

1. Analisi dei requisiti
2. Identificazione delle funzionalità da sviluppare
3. Progettazione della struttura e della presentazione delle pagine web
4. Progettazione della sorgente di informazioni (statica o dinamica)
5. Implementazione dell'applicazione

---

## Stack Tecnico

- HTML5 — applicazione **multi-pagina** (una pagina HTML per vista)
- CSS3 (separazione struttura/presentazione obbligatoria)
- **Bootstrap 5** (via CDN) per reset, griglia e componenti di base, con tema personalizzato in `css/style.css`
- JavaScript (vanilla)
- Web Storage (localStorage/sessionStorage) in formato JSON
- API esterna: [TheMealDB](https://www.themealdb.com/)

---

## Dati & Storage

- L'elenco delle ricette, degli ingredienti e tutte le altre informazioni vengono acquisite tramite le **API REST** del portale TheMealDB
- Tutti i dati necessari all'avvio devono essere scaricati dalle API allo startup dell'applicazione (in formato JSON)
- I dati vanno memorizzati e acceduti nel **Web Storage** del browser, in formato JSON o XML
- Devono essere previste operazioni per la **presentazione e la modifica** delle informazioni nel Web Storage
- I dati memorizzati devono essere visualizzati nell'applicazione web

---

## Funzionalità – Progetto Light (max 25/30)

### 1. Autenticazione
- [ ] Registrazione utente (username, email, password, piatti preferiti)
- [ ] Login / Logout
- [ ] Creazione automatica del ricettario personale (vuoto) alla registrazione

### 2. Gestione Profilo Utente
- [ ] Visualizzazione dati personali
- [ ] Modifica dati personali
- [ ] Cancellazione account

### 3. Ricerca Ricette
- [ ] Ricerca per titolo (ricerca sequenziale o per parola chiave)
- [ ] Ricerca per lettera iniziale della ricetta
- [ ] Visualizzazione informazioni della ricetta (ingredienti, immagine, procedimento)

### 4. Ricettario Personale
- [ ] Aggiunta ricetta al ricettario
- [ ] Modifica ricetta nel ricettario
- [ ] Rimozione ricetta dal ricettario

---

## Funzionalità Aggiuntive – Progetto Full (per voto > 25/30)

### Ricerca Estesa
- [ ] Ricerca per ingredienti
- [ ] Ricerca per testo descrittivo

### Ricettario
- [ ] Creazione e popolamento del proprio ricettario

### Scheda Ricetta Completa
- [ ] Visualizzazione ingredienti, immagine, procedimento
- [ ] Visualizzazione delle eventuali recensioni degli utenti (se presenti)

### Note Private
- [ ] Aggiunta nota testuale per ricetta (visibile solo all'utente)
- [ ] Rimozione nota

### Recensioni
- [ ] Aggiunta recensione con:
  - Data di preparazione
  - Voto difficoltà (1–5)
  - Voto gusto (1–5)
- [ ] Rimozione recensione

---

## Consegna

| Elemento | Dettaglio |
|---|---|
| Codice sorgente | Completo e funzionante |
| Relazione PDF | Struttura, scelte implementative, motivazioni |
| Screenshot | Serie di schermate dimostrative delle funzionalità |
| Upload | [upload.di.unimi.it](https://upload.di.unimi.it) |
| Contatto pre-inizio | valerio.bellandi@unimi.it |
| Scadenza | Sessione di Settembre 2027 (ultimo appello utile) |

---

## Note

- Il progetto è **individuale** (nessun gruppo)
- La specifica è volutamente incompleta: le scelte implementative vanno giustificate e **documentate nella relazione**
- Funzionalità extra sono ammesse e valutate positivamente
- La specifica del progetto Light cita la gestione dati «sia utente finale sia ristoratore»: probabile refuso da un'altra traccia (in PGRC esiste solo l'utente registrato); la scelta va motivata nella relazione