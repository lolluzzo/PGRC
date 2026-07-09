Progetto di Programmazione Web e Mobile - A.A. 2025/2026
Piattaforma per la Gestione di Ricette di
Cucina
1 Premessa
La specifica del problema che deve essere affrontato `e per sua natura incompleta e pu`o essere ambigua. Il candidato deve essere in grado di valutare eventuali soluzioni alternative e giustificare le scelte implementative
adottate. Le motivazioni delle scelte fatte vanno inoltre documentate nel
progetto. Il lavoro consiste di cinque fasi principali: i) analisi dei requisiti; ii) identificazione delle funzionalit`a da sviluppare; iii) progettazione
della struttura e della presentazione delle pagine web; iv) progettazione
della sorgente di informazioni statica o dinamica; v) implementazione
dell’applicazione stessa. Lo svolgimento del progetto `e una prova d’esame
da svolgere individualmente.
2 Requisiti
Il progetto si pone l’obiettivo di sviluppare l’applicazione web Piattaforma per la Gestione di Ricette di Cucina (PGRC).
PGRC implementa un portale web per la gestione di ricette culinarie
dove un utente registrato pu`o gestire il suo ricettario personale partendo
da un vasto insieme di piatti predefiniti. PGRC `e composto dai seguenti
quattro macro-scenari principali:
– gestione del profilo dell’utente (registrazione, modifica dei dati personali, rimozione del profilo, etc.);
– ricerca di ricette culinarie;
– gestione di un ricettario personale;
– recensioni delle ricette.
Di seguito sono analizzate in dettaglio le caratteristiche dei quattro
macro-scenari introdotti.
Il primo macro-scenario (gestione del profilo dell’utente) consiste nella
gestione classica di un profilo utente, con l’acquisizione dei dati principali, la loro modifica ed eventualmente anche la rimozione del profilo
1
Progetto di Programmazione Web e Mobile - A.A. 2025/2026
stesso. L’applicazione deve prevedere una fase di registrazione utente dove
verranno collezionate informazioni quali ad esempio nome utente, indirizzo email, password, piatti preferiti. Una volta registrato, l’utente pu`o
collegarsi all’applicazione e generare un ricettario personale inizialmente
vuoto.
Il secondo macro-scenario (ricerca di ricette culinarie) consiste nella
ricerca di ricette presenti nella piattaforma, attraverso una ricerca sequenziale o tramite una ricerca per parole chiave, ad esempio nome del piatto,
ingredienti principali o lettera iniziale della ricetta. L’elenco delle ricette,
degli ingredienti e tutte le altre informazioni vengono acquisite tramite
le API REST del portale TheMealDB (https://www.themealdb.com/).
Per ogni ricetta dovranno essere gestite le informazioni principali quali
ingredienti, immagini del piatto e procedimento della preparazione. Se
presenti dovranno esssere mostrate anche le recensioni degli utenti (specificate successivamente).
Il terzo macro-scenario (gestione di un ricettario personale) consiste
nella creazione e gestione di un ricettario personale. L’utente deve avere
la possibilit`a di aggiungere al proprio ricettario personale (creato in automatico durante la fase di registrazione) le ricette ricercate nello scenario
precedente. Nella scheda dettagliata della ricetta, vi sar`a dunque la possibilit`a di inserire o rimuovere una ricetta dal proprio ricettario (ad esempio
tramite l’ausilio di un pulsante). E’ facolt`a dell’utente inserire per
cias-cuna ricetta un’eventuale nota testuale, che per`o rester`a privata e
quindi non visible agli altri utenti.
L’ultimo scenario (recensioni delle ricette) prevede che la piattaforma
consenta all’utente di recensire le ricette presenti nel sistema in base a
difficolt`a e gu sto. In pa rticolare og ni ut ente in fa se di re censione deve
specificare l a d ata d i p reparazione d el p iatto, u n v oto d a 1 a 5 p er la
difficolt`a e un vo to da 1 a 5 pe r il gusto.
2.1 Progetto Light
Da quest’anno `e permesso sviluppare in modo singolo (no gruppi) un
progetto definito ”Light”. In questa modalit`a `e p ermesso s viluppare solo
le funzionalit`a ”core” sotto elencate per poter accedere all’esame orale.
Con il solo sviluppo di queste il voto massimo raggiungibile `e di 25 su 30.
Le funzionalit`a previste per un progetto light sono:
– Registrazione e login al sito
– Gestione dei dati dell’utente con modifica e cancellazione dell’utente
stesso (sia utente finale sia ristoratore)
2
Progetto di Programmazione Web e Mobile - A.A. 2025/2026
– Aggiunta/Modifica/Cancellazione del ricettario e delle sue ricette
– Ricerca delle ricette per titolo.
– Visualizzazione di informazioni relative alle ricette
2.2 Progetto Full
Per il progetto completo oltre alle richieste del progetto Light sopra descritto si devono svolgere le seguenti funzonalit`a:
– ricerca delle ricette per ingredienti e per testo descrittivo.
– scheda di ogni ricetta, comprensiva delle eventuali recensioni;
– creazione e popolamento del proprio ricettario;
– inserimento e rimozione di recensioni.
– inserimento e rimozione delle note.
Allo startup dell’applicazione, tutti i dati necessari per l’avvio devono essere disponibili, memorizzati nel web storage e visualizzati
nell’applicazione web.
Operazioni e funzionalit`a aggiuntive possono essere implementate a
piacere. Le pagine web devono essere implementate utilizzando HTML5,
CSS3 e JavaScript, e devono seguire un paradigma di separazione tra la
struttura (HTML5) e la rappresentazione (CSS3) della pagina web.
Le informazioni visualizzate all’interno delle pagine dell’applicazione
web devono essere memorizzate e accedute nel web storage del browser
in formato JSON o XML. Devono perci`o essere previste operazioni per la
presentazione e modifica d elle informazioni.
Allo startup dell’applicazione, tutti i dati necessari (in formato JSON)
devono essere scaricati dalle API di TheMealDB, memorizzati nel web
storage, e visualizzati nell’applicazione web.
3 Informazioni Generali
Il progetto `e valido per l’anno accademico 2025/2026 (L’ultimo appello
utile per la consegna `e quello di Settembre 2027). Prima di iniziare il
progetto bisogna inviare una mail a valerio.bellandi@unimi.it.
Una volta terminato, il progetto deve essere caricato all’indirizzo
upload.di.unimi.it E' necessario presentare:
1. Il codice sorgente.
2. Una relazione dettagliata (in formato pdf) che illustra la struttura e
presentazione del sito web, come sono state realizzate le operazioni
richieste e le scelte implementative che sono state fatte.
3
Progetto di Programmazione Web e Mobile - A.A. 2025/2026
3. Delle prove di funzionamento, consistenti in una serie di schermate
dimostrative comprovanti la corretta esecuzione delle operazioni previste.
Per ogni ulteriore chiarimento: valerio.bellandi@unimi.it
4
