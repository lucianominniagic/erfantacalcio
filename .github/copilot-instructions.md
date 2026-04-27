# Copilot Instructions — ErFantacalcio

## Build, Lint & Format

```bash
npm run dev          # Dev server on http://localhost:8080 (Turbopack)
npm run build        # Production build
npm run lint         # ESLint
npm run format       # Prettier
```

There are no automated tests in this project.

### Database migrations

Always compile TypeScript first; migrations are run via TypeORM CLI against the compiled output:

```bash
npm run migration:generate:local   # Generate migration from entity changes
npm run migration:run:local        # Apply pending migrations
npm run migration:revert:local     # Revert last migration
npm run migration:show:local       # Show migration status
```

Use `:prod` variants (e.g. `migration:run:prod`) when targeting production with `.env.prod`.

---

## Architecture Overview

**ErFantacalcio** is a Next.js 16 App Router app for managing private fantasy football leagues. It uses:

- **tRPC** for type-safe client↔server communication
- **TypeORM** (DataPattern: `BaseEntity` / Active Record) against **PostgreSQL**
- **NextAuth v5 (beta)** for credentials-based authentication
- **MUI v5** for all UI components
- **TanStack Query** (managed via tRPC) for data fetching and caching

### Request flow

```
Browser component
  → api.<router>.<procedure>()       (from ~/utils/api or ~/components/TRPCReactProvider)
  → tRPC HTTP batch link → /api/trpc
  → createTRPCContext (initializes DB, reads session)
  → procedure middleware (public / protected / admin)
  → individual procedure in src/server/api/<router>/procedures/
  → TypeORM entity (BaseEntity.save / find / etc.)
  → PostgreSQL
```

### Route groups

| Group | Path | Access |
|---|---|---|
| `(admin)` | `src/app/(admin)/` | `adminProcedure` only |
| `(user)` | `src/app/(user)/` | `protectedProcedure` |
| Public | `src/app/login`, `src/app/page.tsx` | `publicProcedure` |

### Auth & session

- Credentials provider only; password hashed via MD5 (`~/utils/hashPassword`).
- JWT session carries: `id`, `ruolo` (`admin` | `contributor`), `idSquadra`, `squadra`, `presidente`.
- Server-side auth check: `import { auth } from '~/server/auth.config'`.
- Procedure guards: `publicProcedure` / `protectedProcedure` / `adminProcedure` from `~/server/api/trpc`.

---

## Key Conventions

### Path alias

`~/*` maps to `src/*`. Always use `~/` for imports within the project.

### tRPC router structure

Each domain router lives in `src/server/api/<domain>/`:
- `index.ts` — creates the router and wires procedures
- `procedures/` — one file per procedure (query or mutation)

When adding a new router, register it in `src/server/api/root.ts`.

### TypeORM entities

- Extend `BaseEntity` (Active Record pattern) — use `Entity.save()`, `Entity.findOne()`, etc.
- All entities are registered in `src/data-source.ts` and re-exported from `src/server/db/entities/index.ts`.
- **Never set `synchronize: true`** — always use migrations.
- A custom `NamingStrategy` is applied (`src/server/db/utils/namingStrategy`); column names use snake_case in the DB, camelCase in TypeScript.
- Postgres `numeric`/`decimal` columns are auto-parsed to JS `number` via a global `pg.types.setTypeParser` in `data-source.ts`.
- Entity plural aliases are exported from `index.ts` (e.g. `Giocatore` → `Giocatori`).

### Environment variables

- Validated at startup via `@t3-oss/env-nextjs` in `src/env.mjs`.
- Runtime game configuration (bonuses, modifiers, season strings) is centralized in `src/config.ts` as the `Configurazione` object — read from there, not directly from `process.env`.
- Optional env vars not in `env.mjs` are in `optionalEnv` (also in `env.mjs`).

### Client vs Server components

- `src/app/layout.tsx` is a **Server Component**; it delegates client-side setup to `ClientLayout`.
- `src/ProvidersWrapper.tsx` wraps `TRPCReactProvider` + `SessionProvider` + MUI `ThemeProvider` — add new global providers here.
- Pages under `(user)/` and `(admin)/` that use hooks/session must declare `'use client'` at the top.

### MUI theme

Custom theme defined in `src/theme/` and component overrides in `src/theme/overrides/`. Apply global style changes there, not inline.

### Zod schemas

Input validation schemas for tRPC procedures live in `src/schemas/` (grouped by domain). Reuse them across procedures and share inferred types with the frontend.

### Fantacalcio-specific domain terms

| Term | Meaning |
|---|---|
| `giornata` | Matchday (round) |
| `partita` | Individual match |
| `formazione` | Weekly lineup submitted by a president |
| `voto` | Player grade for a matchday |
| `presidente` | Fantasy team owner (regular user) |
| `tornei` | Tournaments within a season |
| `trasferimento` | Transfer / market transaction |
| `modulo` | Formation scheme (e.g. 4-3-3) — affects scoring bonus |
