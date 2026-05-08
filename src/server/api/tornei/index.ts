import { createTRPCRouter } from '~/server/api/trpc'
import { listTorneiProcedure } from './procedures/list'
import { championsBracketProcedure } from './procedures/championsBracket'

export const torneiRouter = createTRPCRouter({
  list: listTorneiProcedure,
  championsBracket: championsBracketProcedure,
})
