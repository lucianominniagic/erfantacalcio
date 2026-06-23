import { z } from 'zod'
import { publicProcedure } from '~/server/orpc'
import { getCalendario, mapCalendario } from '~/server/api/calendario/repository'

export const getByIdCalendarioORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/calendario/getByIdCalendario', summary: 'Recupera partite del calendario per idCalendario' })
  .input(z.object({ idCalendario: z.number() }))
  .handler(async ({ input }) => {
    try {
      const result = await getCalendario({ idCalendario: input.idCalendario })
      if (result) return mapCalendario(result)
      return null
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
