import { publicProcedure } from '~/server/orpc'
import { SquadreSerieA } from '~/server/db/entities'

export const listSquadreSerieAORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/squadreSerieA/list', summary: 'Lista squadre Serie A' })
  .handler(async () => {
    try {
      return await SquadreSerieA.find({
        select: { idSquadraSerieA: true, nome: true, maglia: true },
      })
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
