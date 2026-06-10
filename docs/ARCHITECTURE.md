# ErFantacalcio — Architettura tecnica

> Documento di riferimento per l'architettura del sistema.
> Per il dominio e il glossario vedi [`CONTEXT.md`](../CONTEXT.md).
> Per le decisioni architetturali vedi [`ADR/`](ADR/).

---

## 1. Request flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Browser (React Client Component)                               │
│                                                                 │
│  const { data } = api.formazione.show.useQuery({ idPartita })  │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTP POST /api/trpc/formazione.show
                            │ (TanStack Query + tRPC HTTP batch link)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Next.js API Route Handler  (src/app/api/trpc/[trpc]/route.ts) │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  createTRPCContext  (src/server/api/trpc.ts)                    │
│  ├─ auth()                → NextAuth: legge JWT dal cookie      │
│  └─ initializeDBConnection() → TypeORM singleton DataSource     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Middleware procedure                                           │
│  ├─ publicProcedure      → nessun controllo autenticazione      │
│  ├─ protectedProcedure   → ctx.session.user != null             │
│  └─ adminProcedure       → user.ruolo === RuoloUtente.admin     │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  Procedura  (src/server/api/<router>/procedures/<name>.ts)     │
│  ├─ Input validato con schema Zod                               │
│  ├─ Logica di business (diretta o tramite service layer)        │
│  └─ TypeORM: Entity.find / Entity.save / AppDataSource.trx      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
                     PostgreSQL (DB)
```

---

## 2. Scoring flow

Come viene calcolato il punteggio fantasy di una formazione per una partita:

```
Formazione (11 titolari + riserve, modulo scelto)
  │
  ▼
Per ogni giocatore titolare:
  ┌─────────────────────────────────────────────────────┐
  │  Recupera Voto dalla tabella `voto`                  │
  │  (join: idCalendario + idGiocatore)                  │
  │                                                     │
  │  Se il giocatore ha voto reale:                     │
  │    fantapunti = voto                                │
  │      + (gol     × bonusGol)       [default: +3]    │
  │      + (assist  × bonusAssist)    [default: +1]    │
  │      + (autogol × bonusAutogol)   [default: -2]    │
  │      + (ammo    × bonusAmmo)      [default: -0.5]  │
  │      + (espu    × bonusEspu)      [default: -1]    │
  │      + (rigPar  × bonusRigPar)    [default: +3]    │
  │      + (rigErr  × bonusRigErr)    [default: -3]    │
  │                                                     │
  │  Se il giocatore NON ha voto (non ha giocato):      │
  │    → entra la prima riserva disponibile con voto    │
  │    → se nessuna riserva disponibile:                │
  │        fantapunti = bonusSenzaVoto  [default: 0]   │
  └─────────────────────────────────────────────────────┘
  │
  ▼
Somma fantapunti di tutti i giocatori in campo
  │
  ▼
Applicazione bonus modulo (se bonusModulo = true):
  ├─ 5-4-1 → +1.5
  ├─ 4-5-1 → +1.0
  ├─ 5-3-2 → +0.5
  ├─ 4-4-2 →  0.0
  ├─ 3-5-2 → -0.5
  ├─ 4-3-3 → -1.0
  └─ 3-4-3 → -1.5
  │
  ▼
Applicazione fattore casalingo (se abilitato):
  bonusFattoreCasalingo punti aggiuntivi alla squadra Home
  │
  ▼
Punteggio finale (punteggioH / punteggioA in tabella `partita`)
  │
  ▼
Calcolo gol fantasy:
  gol = floor(punteggio / 6)   ← ogni 6 fantapunti = 1 gol fantasy
  │
  ▼
Determinazione vincitore e punti classifica:
  ├─ Vittoria:  3 punti
  ├─ Pareggio:  1 punto
  ├─ Sconfitta: 0 punti
  └─ Multa (formazione non inviata): 0 punti + penale economica
```

> Tutti i valori di bonus/malus sono configurabili tramite variabili d'ambiente
> e centralizzati in `src/config/bonus.ts` nell'oggetto `Configurazione`.

---

## 3. Routers tRPC

Tutti i router sono registrati in `src/server/api/root.ts` e accessibili via `api.<nome>.*`.

| Router | Responsabilità |
|---|---|
| `albo` | Legge l'albo d'oro delle stagioni passate (`albo_trofei`) |
| `calendario` | CRUD giornate, recupera il calendario del torneo corrente |
| `classifica` | Legge classifiche per torneo, genera tabelle punti/gol/differenza |
| `economia` | Calcola il saldo economico del presidente (budget – trasferimenti – multe) |
| `formazione` | Crea/mostra/blocca la formazione settimanale di una squadra per una partita |
| `giocatori` | CRUD giocatori Serie A, import CSV, ricerca e statistiche |
| `nuovaStagione` | Setup stagione: reset dati, import giocatori, generazione calendario Berger |
| `partita` | Legge i dettagli di una singola partita (formazioni, voti, gol) |
| `profilo` | Aggiorna foto profilo, cambia password del presidente loggato |
| `risultati` | Inserisce/aggiorna risultati partita (punteggi, gol, multe) e aggiorna classifica |
| `squadre` | Legge la rosa completa di una squadra fantasy e i trasferimenti |
| `squadreSerieA` | Legge le squadre reali di Serie A (lookup per form giocatori) |
| `statisticheSquadre` | Statistiche aggregate per squadra fantasy (medie, presenze, ecc.) |
| `tornei` | CRUD tornei, lista tornei della stagione corrente |
| `trasferimenti` | Gestisce acquisti/cessioni giocatori tra squadre fantasy |
| `voti` | Carica, aggiorna e legge i voti dei giocatori per giornata |

---

## 4. Auth flow

```
1. Utente compila il form /login (username + password)
   │
   ▼
2. NextAuth Credentials Provider → authorize()
   │  ├─ initializeDBConnection()
   │  ├─ Utenti.findOne({ where: { username } })
   │  ├─ verifyPassword(input.password, utente.pwd)
   │  │    ├─ Tenta bcrypt.compare()
   │  │    └─ Fallback MD5 (legacy — lazy migration)
   │  └─ Se MD5 valido → re-hash bcrypt in background (lazy migration)
   │
   ▼
3. NextAuth crea token JWT con payload:
   { id, ruolo, idSquadra, squadra, presidente, email, image }
   │
   ▼
4. Token salvato in cookie httpOnly (session strategy: 'jwt')
   │
   ▼
5. Ogni richiesta tRPC:
   └─ createTRPCContext → auth() → legge e valida il JWT
      │
      ▼
6. Middleware procedure:
   ├─ protectedProcedure: verifica session.user != null
   └─ adminProcedure:     verifica session.user.ruolo === 'admin'
```

**Ruoli nel JWT:**
- `RuoloUtente.admin` → `utente.admin_level = true`
- `RuoloUtente.contributor` → `utente.admin_level = false` (presidente normale)

Per dettagli sulla strategia di hashing password vedi [`ADR/001-password-hashing.md`](ADR/001-password-hashing.md).

---

## 5. Service layer

I service non sono una cartella dedicata a livello di `src/server/services/` ma vivono **dentro ogni router**, in `src/server/api/<dominio>/services/`. Ogni service incapsula logica di business riutilizzabile tra procedure dello stesso dominio.

| Service | Posizione | Responsabilità |
|---|---|---|
| `UpdateClassifica` | `risultati/services/classifica.ts` | Ricalcola la classifica di torneo per una squadra dopo l'inserimento del risultato (punti, vittorie, pareggi, sconfitte, gol fatti/subiti, multe). Eseguito in transazione. |
| `partiteMapping` | `risultati/services/partiteMapping.ts` | Trasforma le righe raw di `partita` in DTO per la lista partite della giornata (arricchisce con nomi squadre, punteggi, stato multa). |

> La logica di calcolo dei fantapunti (scoring flow) è attualmente inline nelle procedure
> di `risultati/procedures/update.ts` e `formazione/procedures/create.ts`, senza
> un service dedicato. Questo è un punto di miglioramento identificato.

---

## 6. Entità TypeORM principali

Tutte le entità estendono `BaseEntity` (Active Record pattern) e sono registrate in `src/data-source.ts`.

```
Utente (= squadra fantasy)
  ├── idUtente         PK
  ├── username, pwd, adminLevel
  ├── presidente, nomeSquadra, mail, foto, maglia
  ├── importoBase, importoMulte, importoMercato, fantaMilioni
  ├── Formazioni[]     → Formazione
  ├── PartiteHome[]    → Partita
  ├── PartiteAway[]    → Partita
  ├── Classifiche[]    → Classifica
  └── Trasferimenti[]  → Trasferimento

Torneo
  ├── idTorneo, nome, gruppoFase, hasClassifica
  ├── Calendari[]      → Calendario
  └── Classifiche[]    → Classifica

Calendario  (= giornata fantasy)
  ├── idCalendario, giornata, giornataSerieA, ordine
  ├── hasGiocata, hasSovrapposta, hasDaRecuperare
  ├── data, dataFine, girone
  ├── Torneo           → Torneo
  ├── Partite[]        → Partita
  └── Voti[]           → Voto

Partita
  ├── idPartita, idCalendario
  ├── idSquadraH, idSquadraA
  ├── puntiH, puntiA (punti classifica)
  ├── golH, golA (gol fantasy)
  ├── punteggioH, punteggioA (fantapunti)
  ├── hasMultaH, hasMultaA, fattoreCasalingo
  ├── Formazioni[]     → Formazione
  ├── SquadraHome      → Utente
  ├── SquadraAway      → Utente
  └── Calendario       → Calendario

Formazione  (= lineup per una partita)
  ├── idFormazione, idSquadra, idPartita
  ├── modulo (es. "433"), dataOra, hasBloccata
  ├── Voti[]           → Voto
  ├── Utente           → Utente
  └── Partita          → Partita

Giocatore  (= giocatore reale Serie A)
  ├── idGiocatore, ruolo, nome, nomeFantaGazzetta, id_pf
  ├── Voti[]           → Voto
  └── Trasferimenti[]  → Trasferimento

Voto  (= pagella giocatore per giornata)
  ├── idVoto, idGiocatore, idCalendario, idFormazione (nullable)
  ├── voto, gol, assist, autogol, ammonizione, espulsione, altriBonus
  ├── titolare, riserva (ordine riserva)
  ├── Giocatore        → Giocatore
  ├── Calendario       → Calendario
  └── Formazione?      → Formazione

Trasferimento
  ├── idTrasferimento, idGiocatore, idSquadra, idSquadraSerieA
  ├── costo, stagione, dataAcquisto, dataCessione
  ├── hasRitirato, media, gol, assist, giocate
  ├── Giocatore        → Giocatore
  ├── Utente?          → Utente
  └── SquadraSerieA?   → SquadraSerieA

AlboTrofei  (= storico vincitori stagione)
  └── stagione, campionato, champions, secondo, terzo
```
