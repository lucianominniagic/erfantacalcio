# ADR 002 — tRPC + TanStack Query for Client-Server Communication

**Status:** ⛔ Superseded by ADR-007  
**Date:** 2025-07-14  
**Author:** mccarthy (Backend / API Engineer)

---

## Context

ErFantacalcio is a Next.js App Router application that needs typed, reliable communication between React client components and server-side business logic. The primary alternatives evaluated were:

1. **Traditional REST API** (Next.js Route Handlers returning JSON)
2. **GraphQL** (e.g., Apollo Server + Apollo Client)
3. **tRPC + TanStack Query** (end-to-end type-safe RPC)

The team is small (one principal developer), the data model is well-defined and stable, and developer experience and correctness matter more than API discoverability by external consumers.

---

## Decision

Use **tRPC v11** as the transport layer with **TanStack Query v5** (via `@trpc/react-query`) as the client-side cache.

---

## Reasons for not choosing REST

| Concern | REST approach |
|---|---|
| Type safety | Manual: shared DTO types drift over time; no compile-time check that the client sends what the server expects |
| Validation | Duplicated: Zod on server, manual checks or a separate library on the client |
| Boilerplate | High: define route, parse body, handle errors, type response in two places |
| Refactoring | Risky: renaming a field requires updating both sides independently |

tRPC generates the client types directly from the server router definition — a single source of truth.

---

## Reasons for not choosing GraphQL

| Concern | GraphQL approach |
|---|---|
| Complexity | Schema definition language, resolvers, code generation pipeline |
| Bundle size | Apollo Client adds ~30 KB gzipped |
| Overkill | GraphQL shines for flexible queries across many clients; ErFantacalcio has one client consuming its own API |
| Team size | One developer; the overhead of maintaining a separate schema is not justified |

---

## Consequences

### Positive

- **End-to-end type safety**: procedure input/output types flow from the router to the React component with no extra code generation step.
- **Automatic cache**: TanStack Query handles caching, background refetch, stale-while-revalidate, and optimistic updates out of the box.
- **Cache invalidation**: `utils.invalidate()` allows precise or broad invalidation after mutations.
- **Unified error handling**: Zod validation errors are forwarded to the client as structured `zodError` objects via the `errorFormatter` in `src/server/api/trpc.ts`.
- **SuperJSON transformer**: supports `Date`, `Map`, `Set`, and `undefined` serialization without manual conversion.
- **HTTP batch link**: multiple procedure calls within the same render cycle are batched into a single HTTP request.

### Negative / Trade-offs

- **No public API**: tRPC procedures are not accessible to external consumers without a wrapper. Acceptable since ErFantacalcio is a closed system.
- **Next.js App Router coupling**: the tRPC fetch adapter is required; the older `createTRPCNext` pattern is incompatible and has been replaced with `createTRPCReact` + `TRPCReactProvider`.
- **Learning curve**: developers unfamiliar with tRPC need to understand the context, middleware chain, and procedure types.

---

## Implementation notes

- Router entry point: `src/server/api/root.ts` — `appRouter`
- Context creation: `src/server/api/trpc.ts` — `createTRPCContext`
- Client hook factory: `src/utils/api.ts` — `api` object (generated from `AppRouter` type)
- Provider: `src/components/TRPCReactProvider.tsx` — wraps `QueryClientProvider` + `TRPCReactProvider`

### Procedure guards

```typescript
publicProcedure    // No auth required
protectedProcedure // Requires valid session (any role)
adminProcedure     // Requires ruolo === RuoloUtente.admin
```

---

## Files involved

- `src/server/api/trpc.ts`
- `src/server/api/root.ts`
- `src/utils/api.ts`
- `src/components/TRPCReactProvider.tsx`
