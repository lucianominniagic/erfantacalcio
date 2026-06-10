import { z } from 'zod'
import { publicProcedure } from '~/server/orpc'
import { getCalendario, mapCalendario } from '~/server/utils/common'
import { In } from 'typeorm'

export const listByTorneoORPCProcedure = publicProcedure
  .route({ method: 'POST', path: '/calendario/listByTorneo', summary: 'Lista partite del calendario per torneo (array di id)' })
  .input(z.number().array())
  .handler(async ({ input }) => {
    try {
      const result = await getCalendario({
        Torneo: { idTorneo: In(input) },
      })
      return await mapCalendario(result)
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
