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

## Piano di migrazione — Router per complessità

| # | Router | Procedure | Complessità | Note |
|---|--------|-----------|-------------|------|
| 1 | `classifica` | 1 | 🟢 Bassa | Solo lettura |
| 2 | `economia` | 1 | 🟢 Bassa | Solo lettura |
| 3 | `squadreSerieA` | 1 | 🟢 Bassa | Solo lettura |
| 4 | `albo` | 2 | 🟢 Bassa | Solo lettura |
| 5 | `partita` | 2 | 🟢 Bassa | Solo lettura |
| 6 | `tornei` | 2 | 🟡 Media | ChampionsBracket ha logica |
| 7 | `risultati` | 3 | 🟡 Media | Admin, scrittura |
| 8 | `statisticheSquadre` | 3 | 🟡 Media | Solo lettura |
| 9 | `auth` | 2 | 🟡 Media | Email, token reset |
| 10 | `formazione` | 4 | 🟠 Alta | Logica critica, deadline |
| 11 | `squadre` | 6 | 🟡 Media | Maglia, Vercel Blob |
| 12 | `trasferimenti` | 6 | 🟡 Media | Scrittura con transazioni |
| 13 | `nuovaStagione` | 6 | 🔴 Alta | Admin, operazioni distruttive |
| 14 | `profilo` | 5 | 🟡 Media | Upload foto Vercel Blob |
| 15 | `giocatori` | 7 | 🟡 Media | CRUD + statistiche |
| 16 | `mercato` | 8 | 🔴 Alta | Logica business critica |
| 17 | `calendario` | 11 | 🟠 Alta | Router più grande |
| 18 | `voti` | 9 | 🔴 Alta | Upload CSV, admin, file parsing |

> **Strategia consigliata:** iniziare dal pilota `classifica` (1 procedura, solo lettura) per validare il setup oRPC end-to-end prima di toccare router critici.
