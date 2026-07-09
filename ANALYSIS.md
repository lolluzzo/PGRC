# PGRC — Analisi e To-Do (Progetto Full)

Piattaforma per la Gestione di Ricette di Cucina — A.A. 2025/2026.
Applicazione web frontend (HTML5 + CSS3 + JavaScript) che consuma le API di
[TheMealDB](https://www.themealdb.com/) e conserva i dati nel **web storage**
del browser in formato JSON/XML.

## Le cinque fasi del lavoro
- [ ] i) Analisi dei requisiti
- [ ] ii) Identificazione delle funzionalità da sviluppare
- [ ] iii) Progettazione della struttura e della presentazione delle pagine web
- [ ] iv) Progettazione della sorgente di informazioni (statica o dinamica)
- [ ] v) Implementazione dell'applicazione

---

## 0. Setup & vincoli tecnici
- [ ] **Inviare la mail a valerio.bellandi@unimi.it prima di iniziare** (obbligatorio)
- [ ] Struttura del progetto: separazione tra struttura (HTML5) e presentazione (CSS3)
- [ ] Solo HTML5, CSS3 e JavaScript (no framework backend richiesti)
- [ ] Dati memorizzati e acceduti nel **web storage** in formato JSON (o XML)
- [ ] Allo startup: scaricare tutti i dati necessari (JSON) da TheMealDB → salvarli in web storage → visualizzarli
- [ ] Definire il modello dati/schema JSON per: utenti, ricette, ricettari, note, recensioni

## 1. Gestione del profilo utente
- [ ] **Registrazione** utente (username, email, password, piatti preferiti)
- [ ] **Login** al sito
- [ ] **Logout**
- [ ] **Modifica** dei dati personali
- [ ] **Cancellazione** del profilo utente
- [ ] Distinzione di ruolo: utente finale vs **ristoratore** (menzionato nella spec Light)
- [ ] Creazione automatica di un ricettario personale vuoto alla registrazione
- [ ] Validazione dei form (email valida, password, campi obbligatori)
- [ ] Gestione della sessione (utente loggato) tramite web storage

## 2. Ricerca ricette (dati da TheMealDB)
- [ ] Ricerca sequenziale (sfoglia tutte le ricette)
- [ ] Ricerca **per titolo/nome del piatto**
- [ ] Ricerca **per ingredienti** (Full)
- [ ] Ricerca **per testo descrittivo** (Full)
- [ ] Ricerca per lettera iniziale della ricetta
- [ ] Visualizzazione dell'elenco risultati
- [ ] Integrazione con le API REST di TheMealDB (fetch + parsing JSON)

## 3. Scheda dettagliata della ricetta
- [ ] Visualizzazione informazioni principali: ingredienti, immagini, procedimento
- [ ] Pulsante per **aggiungere / rimuovere** la ricetta dal ricettario personale
- [ ] Sezione **note personali** (private) sulla ricetta
- [ ] Visualizzazione delle **recensioni** presenti per quella ricetta

## 4. Ricettario personale
- [ ] Creazione e popolamento del ricettario personale
- [ ] **Aggiunta** di una ricetta al ricettario
- [ ] **Rimozione** di una ricetta dal ricettario
- [ ] **Modifica** delle ricette / del ricettario
- [ ] **Inserimento** di una nota testuale privata su una ricetta
- [ ] **Rimozione** di una nota
- [ ] Le note restano private (non visibili agli altri utenti)
- [ ] Persistenza del ricettario nel web storage

## 5. Recensioni delle ricette
- [ ] **Inserimento** di una recensione con:
  - [ ] data di preparazione del piatto
  - [ ] voto difficoltà (1–5)
  - [ ] voto gusto (1–5)
- [ ] **Rimozione** di una recensione
- [ ] Visualizzazione delle recensioni nella scheda della ricetta
- [ ] Persistenza delle recensioni nel web storage

## 6. UI / UX (pagine web)
- [ ] Home / landing page
- [ ] Pagina/registrazione e login
- [ ] Pagina profilo utente
- [ ] Pagina ricerca + risultati
- [ ] Pagina dettaglio ricetta
- [ ] Pagina ricettario personale
- [ ] Layout responsive e stile CSS coerente
- [ ] Navigazione tra le pagine

## 7. Consegna (upload.di.unimi.it)
- [ ] Codice sorgente
- [ ] **Relazione dettagliata (PDF)**: struttura, presentazione, operazioni realizzate, scelte implementative
- [ ] **Prove di funzionamento**: schermate dimostrative delle operazioni previste

---

### Note
- Voto massimo progetto Light: 25/30. Il progetto **Full** punta al voto pieno.
- Ultimo appello utile per la consegna: **Settembre 2027**.
- Contatto per chiarimenti: valerio.bellandi@unimi.it
