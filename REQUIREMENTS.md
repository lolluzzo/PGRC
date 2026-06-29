# PGRC – Piattaforma per la Gestione di Ricette di Cucina
## Progetto PWM A.A. 2025/2026

---

## Stack Tecnico

- HTML5
- CSS3 (separazione struttura/presentazione obbligatoria)
- JavaScript (vanilla)
- Web Storage (localStorage/sessionStorage) in formato JSON
- API esterna: [TheMealDB](https://www.themealdb.com/)

---

## Dati & Storage

- Tutti i dati necessari all'avvio devono essere scaricati dalle API TheMealDB allo startup
- I dati vanno memorizzati nel Web Storage del browser in formato JSON
- Devono essere previste operazioni di lettura e modifica dei dati nel Web Storage

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

### Scheda Ricetta Completa
- [ ] Visualizzazione ingredienti, immagine, procedimento
- [ ] Visualizzazione recensioni degli altri utenti

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
- La specifica è volutamente incompleta: le scelte implementative vanno giustificate nella relazione
- Funzionalità extra sono ammesse e valutate positivamente