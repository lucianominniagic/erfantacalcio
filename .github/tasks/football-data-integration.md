Implementa un'integrazione con football-data.org API v4 per recuperare dati della Serie A italiana.

Obiettivo:
Creare un modulo server-side che esponga:

1. Classifica Serie A corrente
2. Ultimi risultati disputati
3. Prossime partite
4. Classifica marcatori

API utilizzata:
Base URL:
https://api.football-data.org/v4

Competition:
SA

Season:
dinamica (default stagione corrente)

Authentication:
usare header:
X-Auth-Token: process.env.FOOTBALL_DATA_API_KEY


Flusso dati:

Step 1:
Chiamare:

GET /competitions/SA/standings?season={/sseason}

Dal risultato estrarre:

competition
season.currentMatchday
standings[type=TOTAL].table


Step 2:
Usare season.currentMatchday per recuperare gli ultimi risultati:

GET /competitions/SA/matches?matchday={currentMatchday}

Filtrare:
- status FINISHED

Ordinare per data decrescente

Restituire gli ultimi N risultati.


Step 3:
Recuperare prossime partite:

GET /competitions/SA/matches?matchday={currentMatchday + 1}

Filtrare:
- status SCHEDULED

Ordinare per data crescente.


Step 4:
Recuperare marcatori:

GET /competitions/SA/scorers?season={season}

Restituire:
- player.name
- player.photo se disponibile
- team.name
- goals
- assists se disponibile


Architettura richiesta:

Creare:

src/
 ├─ server/
 │   └─ football/
 │       ├─ football.client.ts
 │       ├─ football.service.ts
 │       ├─ football.types.ts
 │       └─ football.mapper.ts


football.client.ts:
- wrapper Axios/fetch
- gestione token
- gestione errori API
- timeout


football.service.ts:
esporre:

getSerieAStandings()
getLatestMatches()
getNextMatches()
getTopScorers()
getSerieAOverview()


getSerieAOverview deve fare:

1. recupera standings
2. prende currentMatchday
3. in parallelo recupera:
   - risultati giornata corrente
   - prossima giornata
   - marcatori

usare Promise.all quando possibile.


Tipizzare completamente le response.
Non usare any.


Aggiungere:
.env.example

FOOTBALL_DATA_API_KEY=


Creare endpoint server:

GET /api/football/serie-a

response:

{
 standings: [],
 latestMatches: [],
 nextMatches: [],
 scorers: [],
 metadata:{
   currentMatchday,
   season
 }
}


Aggiungere gestione cache Next.js:

usare:
unstable_cache

con durata configurabile:

export const revalidate = 3600


Non salvare dati nel database.
I dati devono essere sempre letti dall'API esterna.


Creare inoltre componenti React:

components/football/

SerieAStandings.tsx
LatestMatches.tsx
NextMatches.tsx
TopScorers.tsx


Usare Material UI.

Seguire:
- TypeScript strict
- App Router
- Server Components dove possibile
- nessun client component se non necessario.