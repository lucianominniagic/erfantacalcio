import { createTRPCRouter } from '~/server/api/trpc'
import { riepilogoProcedure } from './procedures/riepilogo'
import { headToHeadProcedure } from './procedures/headToHead'
import { topGiocatoriProcedure } from './procedures/topGiocatori'

export const statisticheSquadreRouter = createTRPCRouter({
  riepilogo: riepilogoProcedure,
  headToHead: headToHeadProcedure,
  topGiocatori: topGiocatoriProcedure,
})
