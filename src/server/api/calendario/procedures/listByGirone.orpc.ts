import { z } from 'zod'
import { publicProcedure } from '~/server/orpc'
import { getCalendario, mapCalendario } from '~/server/utils/common'

export const listByGironeORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/calendario/listByGirone', summary: 'Lista partite del calendario per girone' })
  .input(z.number())
  .handler(async ({ input }) => {
    try {
      const result = await getCalendario({ girone: input })
      return await mapCalendario(result)
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
