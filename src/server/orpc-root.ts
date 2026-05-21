/**
 * oRPC root router — equivalente di src/server/api/root.ts (tRPC)
 *
 * Aggiungi qui nuovi router oRPC man mano che la migrazione avanza.
 * Ogni entry corrisponde a un dominio (es. classifica, formazione, …).
 *
 * NON usare createTRPCRouter — questo oggetto è un plain TypeScript object.
 */
import { listClassificaORPCProcedure } from '~/server/api/classifica/procedures/list.orpc'
import { getRisultatiStagioneORPCProcedure } from '~/server/api/economia/procedures/getRisultatiStagione.orpc'
import { listSquadreSerieAORPCProcedure } from '~/server/api/squadreSerieA/procedures/list.orpc'

export const orpcRouter = {
  classifica: {
    list: listClassificaORPCProcedure,
  },
  economia: {
    getRisultatiStagione: getRisultatiStagioneORPCProcedure,
  },
  squadreSerieA: {
    list: listSquadreSerieAORPCProcedure,
  },
}

/** Tipo del router, utile per il client oRPC type-safe. */
export type ORPCRouter = typeof orpcRouter
