/**
 * oRPC infrastructure — equivalente di src/server/api/trpc.ts
 *
 * Definisce il context tipato (session + dataSource), i tre livelli di
 * procedura (public / protected / admin) e la funzione createORPCContext
 * usata dall'HTTP handler di Next.js.
 *
 * NOTA: tRPC rimane invariato su /api/trpc — questo file è parallelo, NON
 * sostitutivo.
 */
import { os, ORPCError } from '@orpc/server'
import type { Session } from 'next-auth'
import type { DataSource } from 'typeorm'

import { auth } from '~/server/auth.config'
import { initializeDBConnection } from '~/data-source'
import { RuoloUtente } from '~/utils/enums'

// ---------------------------------------------------------------------------
// 1. CONTEXT
// ---------------------------------------------------------------------------

export interface ORPCContext {
  session: Session | null
  dataSource: DataSource
}

/**
 * Crea il context oRPC: autentica la sessione e inizializza il DB.
 * Viene chiamato dal route handler per ogni richiesta.
 */
export async function createORPCContext(): Promise<ORPCContext> {
  const [session, dataSource] = await Promise.all([
    auth(),
    initializeDBConnection(),
  ])
  return { session, dataSource }
}

// ---------------------------------------------------------------------------
// 2. BASE BUILDER
// ---------------------------------------------------------------------------

/**
 * Builder radice con context tipato.
 * Le procedure lo ricevono come initial context passato dall'handler.
 */
/**
 * Middleware globale: converte `Error` nativi in `ORPCError` così il messaggio
 * arriva al client (come avveniva con tRPC). Solo `ORPCError` viene lasciato
 * passare invariato.
 */
const base = os.$context<ORPCContext>().use(async ({ next }) => {
  try {
    return await next()
  } catch (error) {
    if (error instanceof ORPCError) throw error
    if (error instanceof Error) {
      throw new ORPCError('INTERNAL_SERVER_ERROR', { message: error.message })
    }
    throw error
  }
})

// ---------------------------------------------------------------------------
// 3. PROCEDURE GUARDS
// ---------------------------------------------------------------------------

/**
 * Procedura pubblica — nessuna autenticazione richiesta.
 * Equivalente di `publicProcedure` in tRPC.
 */
export const publicProcedure = base

/**
 * Procedura protetta — richiede sessione autenticata.
 * Il middleware garantisce che `context.session.user` sia non-null.
 * Equivalente di `protectedProcedure` in tRPC.
 */
export const protectedProcedure = base.use(({ context, next }) => {
  if (!context.session?.user) {
    throw new ORPCError('UNAUTHORIZED')
  }
  return next({
    context: {
      session: context.session as Session & { user: NonNullable<Session['user']> },
      dataSource: context.dataSource,
    },
  })
})

/**
 * Procedura admin — richiede ruolo `admin`.
 * Equivalente di `adminProcedure` in tRPC.
 */
export const adminProcedure = base.use(({ context, next }) => {
  if (context.session?.user?.ruolo !== RuoloUtente.admin) {
    throw new ORPCError('UNAUTHORIZED')
  }
  return next({
    context: {
      session: context.session as Session & { user: NonNullable<Session['user']> },
      dataSource: context.dataSource,
    },
  })
})
