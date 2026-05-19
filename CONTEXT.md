# ErFantacalcio — Contesto di progetto

> Documento di riferimento per capire il dominio, lo stack e la struttura del progetto prima di contribuire.
> Per l'architettura tecnica dettagliata vedi [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
> Per le decisioni architetturali vedi [`docs/ADR/`](docs/ADR/).

---

## 1. Descrizione del progetto

**ErFantacalcio** è una piattaforma web per la gestione di campionati di fantacalcio **privati** (lega chiusa tra amici/colleghi). Permette a un gruppo di presidenti di:

- schierare formazioni settimanali e calcolare i fantapunti partita per partita;
- gestire il mercato dei giocatori (acquisto/cessione) con un budget in fanta-milioni;
- seguire classifiche, tabellini e statistiche in tempo reale;
- conservare la storia delle stagioni nell'albo d'oro.

Esistono due livelli di accesso: **admin** (gestisce la lega) e **presidente** (utente normale, proprietario di una squadra fantasy).

---

## 2. Glossario di dominio

| Termine | Significato |
|---|---|
| **giornata** | Turno del campionato fantasy. Ogni giornata corrisponde a una o più giornate reali di Serie A ed è contenuta in un torneo. |
| **partita** | Singola sfida fantasy tra due squadre (home/away). Una giornata contiene N partite (una per coppia di squadre). |
| **formazione** | Lineup settimanale inviata da un presidente per una partita: 11 titolari + riserve, con un modulo scelto (es. 4-3-3). |
| **voto** | Pagella assegnata a un giocatore reale per una giornata di Serie A, comprensiva di bonus (gol, assist) e malus (ammonizione, espulsione). |
| **presidente** | Proprietario di una squadra fantasy; corrisponde al ruolo `contributor` nel sistema di autenticazione. |
| **squadra** | Team fantasy associato a un presidente (tabella `utente` — l'entità presidente e squadra coincidono nel DB). |
| **torneo** | Competizione all'interno della stagione (es. Campionato, Champions League fantasy). Ogni torneo ha giornate, partite e una classifica propria. |
| **giornata_calcistica** | Giornata del campionato reale (Serie A) a cui è agganciata una giornata fantasy (`giornata_serie_a` nella tabella `calendario`). |
| **trasferimento** | Operazione di mercato: acquisto o cessione di un giocatore reale da/per una squadra fantasy, con costo in fanta-milioni e data. |
| **modulo** | Schema tattico della formazione (es. 4-3-3, 3-5-2). Influenza il calcolo dei fantapunti tramite un bonus/malus configurabile per schema. |
| **tabellino** | Riepilogo dettagliato di una partita fantasy: voti di ogni titolare/riserva, bonus/malus applicati, gol fantasy segnati, punteggio finale. |
| **albo** | Hall of fame delle stagioni passate: per ogni stagione vengono registrati il vincitore del campionato, il vincitore della champions e i piazzamenti. |
| **maglia** | Configurazione grafica della divisa della squadra fantasy (colori, stile), salvata come stringa nella colonna `utente.maglia`. |
| **montepremi** | Totale dei versamenti dei presidenti (quote + multe + mercato), al netto della detrazione sito. Rappresenta il fondo premi distribuibile. |
| **premio** | Quota del montepremi spettante a una squadra in base alla posizione finale in campionato (1°/2°/3°) e/o alla vittoria della Champions fantasy. |
| **saldo** | Differenza tra il premio ricevuto e il totale versato da un presidente (quote + multe + mercato). Positivo = credito, negativo = debito. |
| **caricamento voti** | Processo admin che importa i voti da CSV FantaGazzetta per una giornata: parsing del file → lookup/creazione giocatori → auto-trasferimento se mancante → upsert voti su DB. |
| **punteggioPartita** | Punti classifica assegnati a una squadra per una partita: vittoria = 3, pareggio = 1, sconfitta = 0, multa = 0. Regola applicata solo ai tornei con `hasClassifica = true`. |

---

## 3. Stack tecnico

| Layer | Tecnologia | Note |
|---|---|---|
| Framework | Next.js 16 (App Router) | Turbopack in dev |
| Linguaggio | TypeScript 5.8 | Strict mode |
| UI | MUI v5 | Tema custom dark/light |
| API | tRPC 11 | HTTP batch link, SuperJSON |
| Data fetching | TanStack Query 5 | Gestito via tRPC |
| Auth | NextAuth v5 (beta) | Credentials provider, JWT |
| ORM | TypeORM | Active Record, PostgreSQL |
| Database | PostgreSQL ≥ 14 | snake_case columns |
| Validazione | Zod | Schemi in `src/schemas/` e `src/config/` |
| Storage | Vercel Blob | Immagini profilo, loghi maglie |
| Email | Resend | Email transazionali |

---

## 4. Struttura directory

```
src/
├── app/                  # Next.js App Router — pagine e layout
│   ├── (admin)/          # Route group admin (adminProcedure)
│   │   ├── avvioStagione/    # Setup nuova stagione
│   │   ├── calendario/       # Gestione giornate e turni
│   │   ├── giocatori/        # CRUD giocatori Serie A
│   │   ├── presidenti/       # Gestione utenti/presidenti
│   │   ├── risultati/        # Inserimento risultati partite
│   │   ├── uploadVoti/       # Caricamento voti da CSV
│   │   └── voti/             # Correzione manuale voti
│   ├── (user)/           # Route group utenti autenticati (protectedProcedure)
│   │   ├── albo/             # Albo d'oro stagioni passate
│   │   ├── economia/         # Budget e trasferimenti
│   │   ├── formazione/       # Crea/modifica formazione settimanale
│   │   ├── formazioni/       # Visualizza formazioni di tutte le squadre
│   │   ├── maglia/           # Editor grafico maglia
│   │   ├── squadra/          # Rosa giocatori della propria squadra
│   │   ├── statistiche_giocatore/  # Stats di un singolo giocatore
│   │   ├── statistiche_giocatori/  # Stats aggregate di tutti i giocatori
│   │   └── tabellini/        # Tabellini partite
│   ├── login/            # Pagina di autenticazione (pubblica)
│   ├── layout.tsx        # Root layout (Server Component)
│   └── page.tsx          # Homepage con classifica e risultati recenti
│
├── server/               # Tutta la logica server-side
│   ├── api/              # tRPC routers e procedure
│   │   ├── <dominio>/    # Un folder per router (es. formazione/, risultati/)
│   │   │   ├── index.ts          # Crea il router e registra le procedure
│   │   │   ├── procedures/       # Una procedura per file
│   │   │   └── services/         # Logica di business condivisa tra procedure
│   │   ├── root.ts       # appRouter — registra tutti i sub-router
│   │   └── trpc.ts       # Inizializzazione tRPC, context, middleware procedure
│   ├── db/
│   │   └── entities/     # Entità TypeORM (Active Record, snake_case DB)
│   └── auth.config.ts    # NextAuth — Credentials provider, JWT callbacks
│
├── schemas/              # Zod schemas per input/output tRPC (per dominio)
├── config/               # Configurazione runtime validata con Zod
│   ├── bonus.ts          # Bonus/malus e modificatori di voto
│   ├── dates.ts          # Date di stagione (inizio mercato, ecc.)
│   ├── pf.ts             # Colonne file CSV FantaGazzetta
│   ├── season.ts         # Stagione corrente, record count, locale
│   ├── urls.ts           # URL risorse esterne (immagini campioncini)
│   └── index.ts          # Esporta `Configurazione` (backward compat)
│
├── theme/                # MUI theme e overrides
│   ├── index.ts          # Dark theme
│   ├── lightTheme.ts     # Light theme
│   ├── themeContext.tsx  # Context per toggle dark/light
│   └── overrides/        # Override componenti MUI (Button, Card, DataGrid…)
│
├── components/           # Componenti React riutilizzabili
├── types/                # TypeScript types e interfaces condivisi
├── utils/                # Utility functions (date, hash, enums…)
├── styles/               # Stili CSS globali
├── data-source.ts        # Configurazione TypeORM DataSource
├── env.mjs               # Validazione env vars con @t3-oss/env-nextjs
└── ProvidersWrapper.tsx  # Wrapper globale: TRPCReactProvider + SessionProvider + ThemeProvider
```

---

## 5. Flusso richiesta

```
Browser (React component)
  │
  │  api.<router>.<procedure>(input)   ← generato da tRPC client in ~/utils/api
  ▼
tRPC HTTP batch link  →  POST /api/trpc/<procedure>
  │
  ▼
createTRPCContext  (src/server/api/trpc.ts)
  ├─ auth()              ← legge la sessione JWT NextAuth
  └─ initializeDBConnection()  ← apre connessione TypeORM (singleton)
  │
  ▼
Middleware procedure
  ├─ publicProcedure     → nessun controllo
  ├─ protectedProcedure  → verifica ctx.session.user != null
  └─ adminProcedure      → verifica ctx.session.user.ruolo === 'admin'
  │
  ▼
Procedura (src/server/api/<dominio>/procedures/<nome>.ts)
  ├─ Input validato con Zod schema
  ├─ Logica di business (diretta o tramite service)
  └─ TypeORM Active Record  (Entity.find / Entity.save / trx.update…)
  │
  ▼
PostgreSQL
```

---

## 6. Ruoli utente

### `admin`

Corrisponde a `utente.admin_level = true` nel DB e al valore `RuoloUtente.admin` nell'enum TypeScript.

**Può fare tutto**, incluso:
- Setup nuova stagione (giocatori, tornei, calendario)
- Caricamento voti da CSV (upload su Vercel Blob + parsing)
- Inserimento e modifica risultati partite
- CRUD completo giocatori Serie A
- Gestione presidenti (creazione, reset password, blocco)
- Esecuzione migrations DB in produzione

Le pagine `(admin)/*` e le `adminProcedure` tRPC sono accessibili **solo** agli admin.

### `contributor` (presidente)

Corrisponde a `utente.admin_level = false` e al valore `RuoloUtente.contributor`.

**Può fare**:
- Visualizzare classifiche, risultati, tabellini, albo d'oro
- Creare e modificare la propria formazione settimanale (entro il termine)
- Personalizzare la maglia della propria squadra
- Consultare economia (budget, trasferimenti)
- Aggiornare la propria foto profilo e password

Le pagine `(user)/*` e le `protectedProcedure` tRPC richiedono solo autenticazione.
