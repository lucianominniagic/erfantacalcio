# ADR 007 — Migrazione da tRPC a oRPC

**Status:** ✅ Accepted  
**Date:** 2026-05-21  
**Supersedes:** ADR-002

tRPC v11 viene sostituito da **oRPC** come layer di comunicazione client-server. Il driver principale è la generazione automatica di spec OpenAPI per testing con Postman/Swagger. La migrazione avviene per fasi (router per router) per minimizzare il rischio su un sistema in produzione.

---

## Considered Options

| Opzione | Descrizione | Esito |
|---|---|---|
| `trpc-openapi` | Plugin che aggiunge OpenAPI a tRPC senza migrare | ❌ Scartato — integrazione superficiale, non offre la DX di oRPC nativo |
| **oRPC (scelto)** | Sostituzione completa, OpenAPI first-class | ✅ |

---

## Decisioni vincolanti

| Aspetto | Decisione |
|---|---|
| **Serializer** | SuperJSON mantenuto — le colonne `Date` di TypeORM sono pervasive e rimuoverlo introdurrebbe bug sottili |
| **Transport** | HTTP handler su `/api/orpc` — stessa forma mentale di tRPC, niente Server Actions per ora |
| **Swagger UI** | Esposto solo in `NODE_ENV === 'development'` — il sistema è chiuso, nessun consumatore esterno |
| **Strategia** | Phased — tRPC e oRPC coesistono durante la migrazione; ogni router viene migrato e verificato prima del successivo |
| **Client** | `@trpc/react-query` sostituito da `@orpc/tanstack-query` |

---

## Conseguenze

- ADR-002 è superseded da questo documento.
- Durante la fase di migrazione esisteranno due handler paralleli (`/api/trpc` e `/api/orpc`); rimosso `/api/trpc` solo quando tutti i router sono migrati.
- I test esistenti che mockano `~/server/api/trpc` dovranno essere aggiornati router per router contestualmente alla migrazione.
- Il pattern client cambia da `api.<router>.<proc>.useQuery()` a `useQuery(orpc.<router>.<proc>.queryOptions())`.

---

## Architettura degli endpoint (`src/app/api/`)

La migrazione introduce **tre route files** con scopi distinti:

| File | Endpoint | Usato da | Ambiente |
|---|---|---|---|
| `api/orpc/[...rest]/route.ts` | `/api/orpc` | Web app (React via `RPCLink`) | Dev + Prod |
| `api/rest/[...rest]/route.ts` | `/api/rest` | Swagger, Postman, curl | Dev only |
| `api/docs/route.ts` | `/api/docs` | Swagger UI (HTML) | Dev only |

### `/api/orpc` — Protocollo nativo oRPC
Equivalente di `/api/trpc`. Parla il protocollo oRPC: body `{"json": input}`, supporta SuperJSON per la serializzazione di `Date` e tipi complessi. È l'unico endpoint usato dal client React in produzione.

### `/api/rest` — REST/OpenAPI
Accetta JSON plain standard (es. `{"idTorneo": 2}`) ed espone la specifica OpenAPI. Usato da Swagger e Postman per testare le procedure senza dover conoscere il protocollo oRPC. **Attivo solo in `NODE_ENV === 'development'`**.

### `/api/docs` — Swagger UI
Serve la pagina HTML di Swagger all'URL `http://localhost:8080/api/docs`. Punta a `/api/rest` per eseguire le chiamate di test. Accetta `?format=json` per ottenere la specifica OpenAPI grezza. **Attivo solo in `NODE_ENV === 'development'`**.

### In produzione
Solo `/api/trpc` (router ancora su tRPC) e `/api/orpc` (router migrati) sono attivi. I file `/api/rest` e `/api/docs` non vengono deployati.

---

## Setup del client oRPC (`src/utils/orpc.ts`)

### ⚠️ URL assoluto obbligatorio per RPCLink

`RPCLink` di oRPC costruisce internamente un oggetto `URL` (tramite `new URL(...)`), che **richiede un URL assoluto**. Al contrario, tRPC usa `fetch(relativeString)` che accetta URL relative senza base.

```typescript
// ✅ CORRETTO — usa window.location.origin nel browser
const getBaseUrl = () => {
  if (typeof window !== 'undefined') return window.location.origin
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return `http://localhost:${process.env.PORT ?? 8080}`
}

// ❌ SBAGLIATO — stringa vuota provoca "TypeError: Failed to construct 'URL': Invalid URL"
const getBaseUrl = () => {
  if (typeof window !== 'undefined') return ''  // NON funziona con oRPC
  ...
}
```

### `'use client'` e boundary server→client

`'use client'` va dichiarato solo sul componente che **attraversa il boundary** server→client (tipicamente la pagina o il layout genitore). I componenti figli importati all'interno di un Client Component ereditano automaticamente il contesto client e **non** hanno bisogno di ripetere la direttiva.

Esempio: se `HomePage` (la pagina) ha `'use client'`, allora `<Classifica>` — pur usando `useQuery` — funziona correttamente senza `'use client'`.

### ⚠️ `.route()` obbligatorio per la visibilità in Swagger

`OpenAPIGenerator` include una procedura nello spec Swagger **solo se ha metadati `.route()`**. Senza di essi la procedura è accessibile via `/api/orpc` (RPCLink client) ma è **invisibile a Swagger e Postman**.

Ogni procedura oRPC **deve** dichiarare `.route()`:

```typescript
// ✅ CORRETTO — appare in Swagger
publicProcedure
  .route({ method: 'GET', path: '/classifica/list', summary: 'Classifica torneo' })
  .input(z.object({ idTorneo: z.number() }))
  .handler(...)

// ❌ SBAGLIATO — invisibile in Swagger
publicProcedure
  .input(z.object({ idTorneo: z.number() }))
  .handler(...)
```

**Convenzione path/method:**
- Procedure con input → `GET` con params come query string (`?idTorneo=2`) oppure `POST` con body JSON
- Procedure senza input → `GET`
- Path: `/<router>/<procedureName>` (es. `/classifica/list`, `/economia/getSaldoSquadre`)

---

## Piano di migrazione — Router per complessità

| # | Router | Procedure | Complessità | Stato |
|---|--------|-----------|-------------|-------|
| 1 | `classifica` | 1 | 🟢 Bassa | ✅ Migrato |
| 2 | `economia` | 1 | 🟢 Bassa | ✅ Migrato |
| 3 | `squadreSerieA` | 1 | 🟢 Bassa | ✅ Migrato |
| 4 | `albo` | 2 | 🟢 Bassa | ✅ Migrato |
| 5 | `partita` | 2 | 🟢 Bassa | ✅ Migrato |
| 6 | `tornei` | 2 | 🟡 Media | ✅ Migrato |
| 7 | `risultati` | 3 | 🟡 Media | ⏳ |
| 8 | `statisticheSquadre` | 3 | 🟡 Media | ⏳ |
| 9 | `auth` | 2 | 🟡 Media | ⏳ |
| 10 | `formazione` | 4 | 🟠 Alta | ⏳ |
| 11 | `squadre` | 6 | 🟡 Media | ⏳ |
| 12 | `trasferimenti` | 6 | 🟡 Media | ⏳ |
| 13 | `nuovaStagione` | 6 | 🔴 Alta | ⏳ |
| 14 | `profilo` | 5 | 🟡 Media | ⏳ |
| 15 | `giocatori` | 7 | 🟡 Media | ⏳ |
| 16 | `mercato` | 8 | 🔴 Alta | ⏳ |
| 17 | `calendario` | 11 | 🟠 Alta | ⏳ |
| 18 | `voti` | 9 | 🔴 Alta | ⏳ |

> **Strategia consigliata:** iniziare dal pilota `classifica` (1 procedura, solo lettura) per validare il setup oRPC end-to-end prima di toccare router critici.
