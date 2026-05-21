import { z } from 'zod'
import { publicProcedure } from '~/server/orpc'
import { getCalendario, mapCalendario } from '~/server/utils/common'

export const listPartiteBySquadraORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/calendario/listPartiteBySquadra', summary: 'Lista partite del calendario per squadra' })
  .input(z.object({ idSquadra: z.number() }))
  .handler(async ({ input }) => {
    const idUtente = +input.idSquadra
    try {
      const result = await getCalendario([
        { Partite: { idSquadraH: idUtente } },
        { Partite: { idSquadraA: idUtente } },
      ])
      return await mapCalendario(result)
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
