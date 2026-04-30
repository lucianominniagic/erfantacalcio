import { createTRPCRouter } from '~/server/api/trpc'
import { getSaldoSquadreProcedure } from './procedures/getSaldoSquadre'

export const economiaRouter = createTRPCRouter({
  getSaldoSquadre: getSaldoSquadreProcedure,
})
