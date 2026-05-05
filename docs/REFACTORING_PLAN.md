# ErFantacalcio — Piano di Review & Refactoring

> **Obiettivo principale:** migliorare manutenibilità e leggibilità di tutto il codice (file grossi, separazione concerns, naming, riduzione `any`/cast), introducendo test Vitest sulle aree critiche in parallelo.
>
> **Vincoli:** nessuna regressione funzionale, nessuna modifica al DB schema senza migrazione esplicita, deploy continuo possibile (non big-bang).
>
> **Approccio:** fasi incrementali, ognuna self-contained e mergiabile in autonomia. Ogni fase parte da un'analisi (audit dell'area) e termina con build pulita + test (dove introdotti).

---

## Stato attuale (audit sintetico)

### File più grandi / più critici

**Pagine (`src/app/`)**

- `app/(admin)/giocatori/page.tsx` — **897 righe** ⚠️
- `app/(admin)/voti/page.tsx` — 515
- `app/(admin)/calendario/page.tsx` — 452
- `app/(user)/foto/page.tsx` — 424
- `app/(admin)/presidenti/page.tsx` — 353
- `app/(admin)/uploadVoti/page.tsx` — 305

**Componenti (`src/components/`)**

- `selectColors/shirtSVG.tsx` — 879 ⚠️
- `cardPartite/ViewTabellini.tsx` — 531
- `cardPartite/ViewFormazioni.tsx` — 445
- `sidebar/Sidebar.tsx` — 389
- `giocatori/Giocatore.tsx` — 384
- `selectColors/index.tsx` — 351
- `squadra/Formazione.tsx` — 340
- `squadra/useFormazioneState.ts` — 319

**Procedure tRPC (`src/server/api/`)** — 70 procedure totali

- `voti/procedures/processVoti.ts` — 323 ⚠️
- `partita/procedures/getTabellini.ts` — 275
- `statisticheSquadre/procedures/riepilogo.ts` — 183
- `formazione/procedures/confirmPrecedente.ts` — 180
- `formazione/procedures/create.ts` — 165

### Smell / problemi trasversali

1. **Logica di business dentro componenti UI** (parsing, mapping, calcoli nel render).
2. **Cast forzati e `any`** (`as ShirtTemplate`, `JSON.parse(...) as ...`, `getOpponent` con `any` in `components/squadra/utils.ts`).
3. **Naming incoerente** in entità TypeORM (es. `Utente.Campionato`, `Champions`, `Secondo`, `Terzo` capitalizzati).
4. **`Utente.pwd` `varchar(50)`** sospetto per hash password (verifica algoritmo: oggi MD5).
5. **Schemi Zod localizzati**: shape simili (giornata/calendario) duplicate tra schemi diversi.
6. **Tipi non derivati da Zod**: tipi e cast a mano invece di `z.infer`.
7. **`config.ts` denso**: parsing env disseminato, `new Date(env as string) ?? new Date()` debole.
8. **`mailSender.ts`**: parametri `cc` obbligatori anche quando logici opzionali, side-effect/log inline.
9. **No layout guard auth** per route group `(admin)`/`(user)` — la protezione è affidata a tRPC + singole pagine.
10. **`sx` inline e colori hardcoded** invece di token del tema MUI.
11. **Nessun test** (Vitest configurato ma vuoto).

---

## Principi guida

- **Una fase = una PR mergiabile.** Non si accumulano refactor pendenti.
- **Refactor first, feature second.** Nessun cambio di comportamento durante il refactor (eccetto bug latenti evidenti, segnalati esplicitamente).
- **Test prima di toccare logica critica.** Per scoring/voti/formazione: scrivere test caratterizzanti PRIMA di refactorare.
- **Tipi derivati da Zod** dove possibile, per allineare client/server.
- **Theme-first**: stili nuovi in `src/theme/overrides/`, non in `sx`.
- **Naming coerente**: camelCase per props TS, snake_case in DB (gestito da NamingStrategy).

---

## Roadmap a fasi

> Ogni fase ha owner consigliato (sub-agent), file impattati, criteri di completamento.

### FASE 0 — Baseline e safety net ✅ COMPLETATA

**Owner:** `dick` + `pasolini`
**Branch:** `refactor/fase-0` | **Commits:** `d89877c`, `9eecc6d`

- ✅ `npm run build` — PASS
- ✅ `npm run format -- --check` — PASS (285 file formattati)
- ✅ `npm run lint` — funzionante; 360 problemi pre-esistenti documentati come baseline per FASE 1
  - Fix: `next lint` rimosso in Next.js 16 → script aggiornato a `eslint .`
  - Fix: `eslint.config.js` → `eslint.config.mjs` (ESM flat config)
  - Fix: `eslint-config-next` → `@next/eslint-plugin-next` (flatConfig API)
  - Fix: installato `typescript-eslint` (mancante da devDeps)
  - 133 problemi auto-fixati con `eslint --fix`
- ✅ Vitest v2.1.9 configurato — 25 test verdi su `src/components/squadra/utils.ts`
  - 3 bug documentati nei test (non fixati): `formatModulo`, `sortPlayersByRoleDescThenRiserva`, `checkDataFormazione`
- ✅ `docs/TESTING.md` creato con guida completa

**Done quando:** `npm test` runna almeno 1 file con N test verdi; CI baseline documentata.

---

### FASE 1 — Fondamenta tipi & config

**Owner:** `ishiguro` (lead) + `mccarthy`
**Branch:** `refactor/fase-1` | **Commit:** `af767ee`

Obiettivo: ridurre cast/any e centralizzare config.

1. ✅ **`src/config.ts`** → spezzato in 5 moduli (`config/bonus.ts`, `config/pf.ts`, `config/dates.ts`, `config/urls.ts`, `config/season.ts`) con schema Zod per gruppo; 2 bug fix al parsing env (Date invalide, Number con virgola).
2. ✅ **Tipi da Zod**: `iVotoGiocatore` convertito a `z.infer`; altri 2 skippati (shape divergente, documentati).
3. ✅ **Eliminare `any`** in `src/components/squadra/utils.ts` — `getOpponent`/`getMatch` tipati con `z.infer<giornataSchema>` e `Pick<GiocatoreType>`; `as ShirtTemplate` sostituito con `toShirtTemplate()` type-safe in 4 file.
4. ✅ **Sostituire `JSON.parse(...) as X`** — nuovo `src/schemas/maglia/index.ts` con `parseMaglia()` safe; 4 file aggiornati.

**Done quando:** `tsc --noEmit` zero errori, ricerca `as any` ridotta del 80%.

---

### FASE 2 — Auth & route group hardening

**Owner:** `gibson`

1. Creare `src/app/(admin)/layout.tsx` con server-side guard (`auth()` → redirect se `!adminLevel`).
2. Creare `src/app/(user)/layout.tsx` con server-side guard (`auth()` → redirect se non autenticato).
3. Audit di ogni pagina admin/user per rimuovere check duplicati ora coperti dal layout.
4. Verifica `Utente.pwd varchar(50)`: confermare che MD5 è una scelta consapevole o pianificare migrazione a bcrypt (richiede migration + reset password flow).

**Done quando:** un utente non admin che apre `/giocatori` viene redirectato lato server; nessun flicker client-side.

---

### FASE 3 — Service layer backend (procedure grandi)

**Owner:** `mccarthy` + `dick` (test caratterizzanti prima)

Target principali (in ordine):

1. **`voti/procedures/processVoti.ts` (323 righe)**
   - Test caratterizzanti: input/output reali su giornata storica.
   - Estrarre in `src/server/services/votiService.ts`: `parseVotiCsv`, `applicaModificatori`, `calcolaBonusModulo`, `calcolaFantapunti`.
   - Procedure resta solo orchestrazione + persistence.
2. **`partita/procedures/getTabellini.ts` (275 righe)** → `tabelliniService.ts` con mapper puri.
3. **`statisticheSquadre/procedures/riepilogo.ts` (183 righe)** → `statisticheService.ts`.
4. **`formazione/procedures/{create,confirmPrecedente}.ts`** → estrarre `formazioneService.ts` con `cloneFormazione`, `validateFormazione`, mail templating in `service/mailTemplates.ts`.

**Done quando:** ogni procedure target sotto le ~80 righe, logica pura testata.

---

### FASE 4 — Componenti grandi: split & extract hook

**Owner:** `coe` + `asimov` (per token tema)

Per ciascun componente >300 righe:

1. **`selectColors/shirtSVG.tsx` (879 righe)** — è probabilmente un asset SVG: valutare estrazione in file `.svg` + import oppure split per template.
2. **`cardPartite/ViewTabellini.tsx` (531)** — split: header / lista voti / footer; estrarre mapper in hook `useTabellinoView`.
3. **`cardPartite/ViewFormazioni.tsx` (445)** — analogo.
4. **`sidebar/Sidebar.tsx` (389)** — estrarre menu items in config + sub-components.
5. **`giocatori/Giocatore.tsx` (384)** — separare profile/stats/storico in tab components.
6. **`selectColors/index.tsx` (351)** — split form/preview/persist.
7. **`squadra/Formazione.tsx` (340)** + **`useFormazioneState.ts` (319)** — già hook-driven, ma il file hook è grande: spezzare in `useFormazioneData`, `useFormazioneActions`, `useFormazionePrecedente`.

**Output target:** nessun file UI > ~250 righe.

---

### FASE 5 — Pagine admin pesanti

**Owner:** `coe` (con `mccarthy` per procedure se servono)

1. **`(admin)/giocatori/page.tsx` (897 righe)** ⚠️ — split in:
   - `GiocatoriTable.tsx` (data grid)
   - `GiocatoreFormModal.tsx` (form crea/modifica)
   - `GiocatoriFilters.tsx`
   - `useGiocatoriAdmin.ts` (data fetching + mutations)
2. **`(admin)/voti/page.tsx` (515)** — split form upload / lista / preview.
3. **`(admin)/calendario/page.tsx` (452)** — già parzialmente modulare; estrarre `CalendarioForm.tsx` modale.
4. **`(admin)/presidenti/page.tsx` (353)** — split tabella / form.
5. **`(admin)/uploadVoti/page.tsx` (305)** — estrarre logica parsing in service condiviso con processVoti.

**Output target:** nessuna pagina > ~200 righe (solo composizione).

---

### FASE 6 — Theme & styling consistency

**Owner:** `asimov`

1. Audit `sx={{ ... }}` ricorrenti: spostare in `theme/overrides/` o creare componenti `Styled*`.
2. Audit colori hardcoded (es. `#1a1a2e`, `#E65100`): consolidare in `palette` semantica.
3. Verificare contrast ratio light/dark.
4. Documentare design tokens in `docs/DESIGN_SYSTEM.md`.

**Done quando:** ricerca grep `sx={{` ridotta significativamente; nessun colore hex sparso fuori da `theme/`.

---

### FASE 7 — Entità & DB hygiene

**Owner:** `dostojevskij`

1. **`Utente`**: rinominare `Campionato`/`Champions`/`Secondo`/`Terzo` in camelCase (campionato, champions, secondo, terzo) → migrazione TypeORM con rename column.
2. **`Voto`**: chiarire `Formazione?: Relation<Formazione | null>`; rimuovere duplicazione tra FK e relations.
3. **`Partita.SquadraHome/Away`** che puntano a `Utente`: rinominare relazioni (`UtenteHome/Away`) o creare entità `Squadra` separata se semanticamente diversa (decisione architetturale, vedi nota in calce).
4. Verifica indici su FK frequenti (`idPartita`, `idCalendario`, `idSquadra`).

**Done quando:** migration generata, `npm run migration:show:local` clean, build verde.

---

### FASE 8 — Testing coverage

**Owner:** `dick` (in parallelo alle fasi 3-5 dove possibile)

Aree critiche prioritarie:

1. **Calcolo fantapunti** (`votiService` post fase 3) — test su giornata storica.
2. **Logica formazione** (`utils.ts`, `formazioneService`) — moduli ammessi, calcolo codice formazione.
3. **`confirmPrecedente`** — clone + esistenza + giornate correnti.
4. **Schemi Zod** — happy path + edge case (date invalide, formazioni incomplete).

**Target:** coverage >40% sulle aree business-critical (non vincolante per PR).

---

### FASE 9 — Documentazione & DX

**Owner:** Murakami (orchestrazione) + tutti

1. `CONTEXT.md` (root) con glossario domain (giornata, partita, formazione, voto, ...).
2. `docs/ARCHITECTURE.md` con diagramma flussi (request flow, scoring flow).
3. ADR (`docs/adr/`) per decisioni storiche (MD5, MUI, NamingStrategy, JWT only).
4. Aggiornare `README.md` con sezione "How to contribute".

---

## Decisioni aperte (da concordare con Luciano)

- [ ] **Password hashing**: tenere MD5 o migrare a bcrypt? (impatta fase 2 e fase 7)
- [ ] **Entità Squadra separata**: oggi `Partita` punta a `Utente` per home/away. Estraiamo `Squadra`? (impatta fase 7, refactor pesante)
- [ ] **Branch strategy**: una PR per fase o sotto-PR per file?
- [ ] **Ordine reale di esecuzione**: l'ordine attuale è "rischio crescente". Si può anticipare la fase 5 (giocatori 897 righe) se urgente.

---

## Tracking

Lo stato di ogni fase è tracciato nel database della sessione (tabella `todos`).
Status values: `pending` → `in_progress` → `done` (o `blocked` con descrizione).
