/**
 * oRPC root router — equivalente di src/server/api/root.ts (tRPC)
 *
 * Aggiungi qui nuovi router oRPC man mano che la migrazione avanza.
 * Ogni entry corrisponde a un dominio (es. classifica, formazione, …).
 *
 * NON usare createTRPCRouter — questo oggetto è un plain TypeScript object.
 */
import { listAlboORPCProcedure } from '~/server/api/albo/procedures/list.orpc'
import { getAlboORPCProcedure } from '~/server/api/albo/procedures/get.orpc'
import { listClassificaORPCProcedure } from '~/server/api/classifica/procedures/list.orpc'
import { getRisultatiStagioneORPCProcedure } from '~/server/api/economia/procedures/getRisultatiStagione.orpc'
import { listSquadreSerieAORPCProcedure } from '~/server/api/squadreSerieA/procedures/list.orpc'
import { getTabelliniORPCProcedure } from '~/server/api/partita/procedures/getTabellini.orpc'
import { getFormazioniORPCProcedure } from '~/server/api/partita/procedures/getFormazioni.orpc'
import { listTorneiORPCProcedure } from '~/server/api/tornei/procedures/list.orpc'
import { championsBracketORPCProcedure } from '~/server/api/tornei/procedures/championsBracket.orpc'

export const orpcRouter = {
  albo: {
    list: listAlboORPCProcedure,
    get: getAlboORPCProcedure,
  },
  classifica: {
    list: listClassificaORPCProcedure,
  },
  economia: {
    getRisultatiStagione: getRisultatiStagioneORPCProcedure,
  },
  partita: {
    getTabellini: getTabelliniORPCProcedure,
    getFormazioni: getFormazioniORPCProcedure,
  },
  squadreSerieA: {
    list: listSquadreSerieAORPCProcedure,
  },
  tornei: {
    list: listTorneiORPCProcedure,
    championsBracket: championsBracketORPCProcedure,
  },
}

/** Tipo del router, utile per il client oRPC type-safe. */
export type ORPCRouter = typeof orpcRouter
