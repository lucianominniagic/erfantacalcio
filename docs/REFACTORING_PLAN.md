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

### FASE 1 — Fondamenta tipi & config ✅ COMPLETATA

**Owner:** `ishiguro` (lead) + `mccarthy`
**Branch:** `refactor/fase-1` | **Commits:** `af767ee`, `37ad700`
**Review:** 2 problemi trovati e fixati (commit `37ad700`)

Obiettivo: ridurre cast/any e centralizzare config.

1. ✅ **`src/config.ts`** → spezzato in 5 moduli (`config/bonus.ts`, `config/pf.ts`, `config/dates.ts`, `config/urls.ts`, `config/season.ts`) con schema Zod per gruppo; 2 bug fix al parsing env (Date invalide, Number con virgola).
2. ✅ **Tipi da Zod**: `iVotoGiocatore` convertito a `z.infer`; altri 2 skippati (shape divergente, documentati).
3. ✅ **Eliminare `any`** in `src/components/squadra/utils.ts` — `getOpponent`/`getMatch` tipati con `z.infer<giornataSchema>` e `Pick<GiocatoreType>`; `as ShirtTemplate` sostituito con `toShirtTemplate()` type-safe in 4 file.
4. ✅ **Sostituire `JSON.parse(...) as X`** — nuovo `src/schemas/maglia/index.ts` con `parseMaglia()` safe; 4 file aggiornati.
5. ✅ **Review fix**: `interface magliaType` duplicata rimossa da `selectColors/index.tsx`, ora re-esporta `MagliaType` da `~/schemas/maglia`; `toShirtTemplate()` ora logga `console.warn` su valori non riconosciuti.

**Done quando:** `tsc --noEmit` zero errori, ricerca `as any` ridotta del 80%.

---

### FASE 2 — Auth & route group hardening ✅ COMPLETATA

**Owner:** `gibson` + `dostojevskij`
**Branch:** `refactor/fase-2` | **Commits:** 5 atomici

1. ✅ `src/app/(admin)/layout.tsx` — Server Component guard: `!session || !session.user || session.user.ruolo !== 'admin'` → `redirect('/login')`
2. ✅ `src/app/(user)/layout.tsx` — Server Component guard: `!session` → `redirect('/login')`
3. ✅ Audit pagine — nessun check manuale ridondante trovato nelle 18 pagine `(admin)`/`(user)`
4. ✅ **Bcrypt lazy migration** (decisione presa: bcrypt con lazy migration):
   - `hashPassword.ts`: `hashPassword()` bcrypt + `verifyPassword()` auto-detect MD5/bcrypt + `hashMD5()` legacy
   - `auth.config.ts`: al login MD5 match → re-hash bcrypt → aggiorna DB best-effort
   - `changePassword.ts`: nuove password sempre bcrypt
   - 14 test verdi
5. ✅ `docs/ADR/001-password-hashing.md` — decisione documentata
6. ✅ `Utente.pwd` varchar(50) → varchar(100); migration `AlterUtentePwdLength` generata (applicare al prossimo deploy)

**Nota:** pattern corretto per guard: `!session || !session.user || session.user.ruolo !== 'admin'`
**Deploy:** eseguire `npm run migration:run:prod` prima di deployare in produzione.

**Done quando:** un utente non admin che apre `/giocatori` viene redirectato lato server; nessun flicker client-side.

---

### FASE 3 — Service layer backend (procedure grandi) ✅ COMPLETATA

**Owner:** `mccarthy` + `dick`
**Branch:** `refactor/fase-3` | **Commits:** 4 atomici (mccarthy) + test caratterizzanti (dick)
**Review:** ✅ Zero problemi — logica identica verificata line-by-line

- ✅ **332 test caratterizzanti** scritti da dick prima del refactor (18+51+64+46+74+74)
- ✅ **5 service creati** in `src/server/services/`:
  1. `votiService.ts` — `calcBonusVoto()`: -20 righe da `processVoti.ts`
  2. `tabelliniService.ts` — `mapVotoToTabellinoEntry()`: -60 righe da `getTabellini.ts` + ottimizzazione 3 `.find()` → 1
  3. `statisticheService.ts` — `initStats()`, `accumulate()`, `round2()`: -100 righe da `riepilogo.ts`
  4. `formazioneService.ts` — `buildFormazioneInsertData()`, `buildVotiInsertData()`: condiviso tra `create` + `confirmPrecedente`
  5. `mailTemplates.ts` — 3 template HTML estratti: -60 righe inline
- ✅ 332/332 test verdi post-refactor
- ✅ Build TypeScript zero errori
- ✅ Tutti i service sono pure functions (zero `ctx` tRPC, zero TypeORM diretto)

**Done quando:** ogni procedure target sotto le ~80 righe, logica pura testata.

---

### FASE 4 — Componenti grandi: split & extract hook ✅ COMPLETATA

**Owner:** `coe` + `asimov`
**Branch:** `refactor/fase-4` | **Commits:** 6 atomici (coe) + token tema (asimov) + review fix
**Review:** 1 bug critico trovato e fixato — `TottenhamShirt` mancante dal `TEMPLATE_MAP` (commit `ebaa5e3`)

| Componente | Prima | Dopo | Sub-componenti |
|---|---|---|---|
| `shirtSVG.tsx` | 934 | 85 | 4 file template (basic/pattern/gradient) + `TEMPLATE_MAP` |
| `ViewTabellini.tsx` | 538 | 116 | `TabellinoCard`, `TabellinoVotiList`, `tabellinoHelpers` |
| `ViewFormazioni.tsx` | 459 | 138 | `FormazioneSquadra` |
| `Sidebar.tsx` | 501 | 243 | `SidebarNavItem`, `SidebarSection`, `sidebarConfig` |
| `Giocatore.tsx` | 384 | 63 | `GiocatoreProfile`, `GiocatoreStats`, `GiocatoreStorico` |
| `selectColors/index.tsx` | 356 | 234 | `useShirtSelector` hook |
| `useFormazioneState.ts` | 330 | 75 | `useFormazioneData`, `useFormazioneActions`, `useFormazionePrecedente` |
| `Formazione.tsx` | 382 | 255 | `FormazioneRosaSection`, `FormazioneDisabilitata` |

**asimov:** `palette.ruolo` token semantici (P/D/C/A) + `mui.d.ts` augmentato + `docs/DESIGN_SYSTEM.md` (340 righe, base per FASE 6)

**Output target:** nessun file UI > ~250 righe.

---

### FASE 5 — Pagine admin pesanti ✅ COMPLETATA

**Owner:** `coe`
**Branch:** `refactor/fase-5` | **Commits:** 5 atomici (`61842dc`, `1456618`, `9add224`, `7583057`, `54ebb97`)

| Pagina | Prima | Dopo | Sub-componenti |
|---|---|---|---|
| `giocatori/page.tsx` | 897 | 99 | `GiocatoriTable`, `GiocatoreFormModal`, `GiocatoriFilters`, `useGiocatoriAdmin` |
| `voti/page.tsx` | 515 | 56 | `VotiUploadForm`, `VotiList`, `useVotiAdmin` |
| `calendario/page.tsx` | 452 | 149 | `CalendarioForm`, `useCalendarioAdmin` |
| `presidenti/page.tsx` | 353 | 39 | `PresidentiTable`, `PresidenteFormModal` |
| `uploadVoti/page.tsx` | 305 | 54 | logica parsing in service condiviso |

**Output target:** nessuna pagina > ~200 righe (solo composizione). ✅

---

### FASE 6 — Theme & styling consistency ✅ COMPLETATA

**Owner:** `asimov`
**Branch:** `refactor/fase-6` | **Commits:** 4 atomici (`4ccde95`, `eba5000`, `d05694e`, `86872d5`)

1. ✅ **Overrides tokenizzati** — `Button`, `Card`, `CardHeader`, `DataGrid`, `TableHead`: tutti i colori hex sostituiti con token palette (`primary.*`, `divider`, `alpha()`, `darken()`)
2. ✅ **Colori hardcoded in app/ e components/** — `login/page.tsx`, `foto/page.tsx`, `documenti/page.tsx`, `HeadToHeadMatrix.tsx`, `Sidebar.tsx` bonificati
3. ✅ **`palette.ruolo` adottato ovunque** — `tabellinoHelpers.tsx` (bug fix: C usava `action.hover`!), `Rosa.tsx` migrati a `theme.palette.ruolo[ruolo]`
4. ✅ **`docs/DESIGN_SYSTEM.md`** aggiornato: stato "FASE 6", sezione 9 chiusa, tabella colori residui intenzionali documentata

**Colori residui intenzionali (non toccati):** `theme/index.ts` + `lightTheme.ts` (fonte verità), colori maglietta in `useShirtSelector`, fallback maglia in `Squadra.tsx`.

**Done quando:** ricerca grep `sx={{` ridotta significativamente; nessun colore hex sparso fuori da `theme/`. ✅

---

### FASE 7 — Testing coverage ✅ COMPLETATA

**Owner:** `dick`
**Branch:** `refactor/fase-7` | **Commits:** 1 atomico (dick) + 1 review fix (`373b23c`)
**Review:** 1 bug critico trovato e fixato — `sortPlayersByRoleDescThenRiserva` mutava oggetti nella cache TanStack Query

| Area | Test | File |
|---|---|---|
| `votiService` — calcolo fantapunti | 10 | `votiService.test.ts` |
| `formazioneService` — builder | 13 | `formazioneService.test.ts` |
| `statisticheService` — aggregazione | 19 | `statisticheService.test.ts` |
| `tabelliniService` — mapping | 7 | `tabelliniService.test.ts` |
| `schemas/maglia` — Zod validation | 15 | `maglia/index.test.ts` |
| `schemas/calendario` — Zod validation | 15 | `calendario/index.test.ts` |
| `utils.ts` — 3 bug fix TDD | 26 | `utils.test.ts` |
| **Totale** | **413** | **7 file** |

**Bug fixati via TDD:** `formatModulo` (split('-')), `sortPlayersByRoleDescThenRiserva` (P>D>C>A + no mutation), `checkDataFormazione` (timezone-safe).

**Target:** coverage >40% sulle aree business-critical. ✅

---

### FASE 8 — Documentazione & DX

**Owner:** Murakami (orchestrazione) + tutti

1. `CONTEXT.md` (root) con glossario domain (giornata, partita, formazione, voto, ...).
2. `docs/ARCHITECTURE.md` con diagramma flussi (request flow, scoring flow).
3. ADR (`docs/adr/`) per decisioni storiche (MD5, MUI, NamingStrategy, JWT only).
4. Aggiornare `README.md` con sezione "How to contribute".

---

## Decisioni aperte (da concordare con Luciano)

- [x] **Password hashing**: ✅ Migrazione a bcrypt con lazy migration (FASE 2). `docs/ADR/001-password-hashing.md`.
- [x] **Branch strategy**: ✅ Una branch per fase (`refactor/fase-N`)

---

## Tracking

Lo stato di ogni fase è tracciato nel database della sessione (tabella `todos`).
Status values: `pending` → `in_progress` → `done` (o `blocked` con descrizione).
