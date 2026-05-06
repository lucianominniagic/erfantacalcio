# ADR 003 — TypeORM with Active Record Pattern

**Status:** ✅ Accepted  
**Date:** 2025-07-14  
**Author:** dostojevskij (Database Engineer)

---

## Context

ErFantacalcio uses PostgreSQL as its database. An ORM is required to interact with the DB from TypeScript without writing raw SQL everywhere. The primary alternatives evaluated were:

1. **TypeORM — Data Mapper** (explicit `Repository` / `EntityManager` injection)
2. **TypeORM — Active Record** (entities extend `BaseEntity`, call static methods)
3. **Prisma** (schema-first, generated client, no decorators)

---

## Decision

Use **TypeORM** with the **Active Record** pattern: all entities extend `BaseEntity`, enabling `Entity.find()`, `Entity.findOne()`, `Entity.save()`, etc. directly on the class.

---

## Reasons for not choosing Prisma

| Concern | Prisma approach |
|---|---|
| Schema ownership | Prisma owns the schema (`prisma/schema.prisma`); TypeORM keeps schema inside TypeScript decorators (single source) |
| Migrations | Prisma generates migrations from its DSL; TypeORM generates migrations from entity changes via CLI, which is more transparent |
| Decorator style | The project already used TypeORM decorators; migrating would require rewriting all entity definitions |
| Runtime | Prisma bundles a Rust query engine; TypeORM uses the native `pg` driver directly — smaller footprint |

---

## Reasons for choosing Active Record over Data Mapper

| Concern | Active Record | Data Mapper |
|---|---|---|
| Boilerplate | Low: no repository injection needed | Higher: must inject `Repository<Entity>` in every service |
| Testability | Slightly harder to mock (static methods) | Easier to inject mocks |
| Team size | Active Record is simpler for a single-developer project | Preferred for larger teams with DI containers |
| Consistency | All procedure files use the same pattern; easy to onboard | Requires a DI container or manual wiring |

The testability trade-off is acceptable given the small team size and the fact that business logic is tested at the procedure/service level.

---

## Consequences

### Positive

- **Less boilerplate**: `Utenti.findOne({ where: { username } })` instead of `userRepository.findOne(...)`.
- **Transactions**: `AppDataSource.transaction(async trx => { ... })` with explicit `EntityManager` for transactional operations.
- **NamingStrategy**: a custom `NamingStrategy` (`src/server/db/utils/namingStrategy`) maps camelCase TypeScript fields to snake_case DB columns automatically (e.g., `nomeSquadra` → `nome_squadra`).
- **Type-safe numeric columns**: `pg.types.setTypeParser` in `data-source.ts` parses PostgreSQL `numeric`/`decimal` columns to JS `number` (avoids the default string output).

### Negative / Trade-offs

- **Static methods are hard to mock**: unit tests that exercise entity methods need either a real DB or a custom mock of `BaseEntity`. Existing tests work around this.
- **`synchronize: false`**: the `synchronize` option is permanently disabled to prevent accidental schema changes in production. **All schema changes must go through TypeORM migrations.**
- **Migration workflow**: requires compiling TypeScript first (`npm run build:ts`) before running `migration:generate` or `migration:run`.

---

## Migration workflow

```bash
npm run build:ts                       # Compile TS (required by TypeORM CLI)
npm run migration:generate:local       # Generate migration from entity changes
npm run migration:run:local            # Apply pending migrations (local)
npm run migration:run:prod             # Apply pending migrations (production)
```

---

## Naming conventions

| TypeScript (entity field) | PostgreSQL column |
|---|---|
| `idUtente` | `id_utente` |
| `nomeSquadra` | `nome_squadra` |
| `adminLevel` | `admin_level` |
| `hasGiocata` | `has_giocata` |
| `dataAcquisto` | `data_acquisto` |

Entity plural aliases are exported from `src/server/db/entities/index.ts`:

```typescript
export { Utente as Utenti } from './Utente'
export { Giocatore as Giocatori } from './Giocatore'
// ...
```

This allows procedure files to import `Utenti` (plural) for consistency with the domain language.

---

## Files involved

- `src/data-source.ts` — TypeORM `DataSource` configuration
- `src/server/db/entities/` — All entity definitions
- `src/server/db/entities/index.ts` — Barrel with plural aliases
- `src/server/db/utils/namingStrategy.ts` — Custom camelCase → snake_case mapping
- `tsconfig.typeorm.json` — TypeScript config for TypeORM CLI
