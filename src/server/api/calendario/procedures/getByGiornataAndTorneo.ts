import { publicProcedure } from '~/server/api/trpc'
import { z } from 'zod'
import { getCalendario, mapCalendario } from '../../../utils/common'

export const getByGiornataAndTorneoProcedure = publicProcedure
  .input(z.object({ idTorneo: z.number(), giornata: z.number() }))
  .query(async ({ input }) => {
    try {
      const result = await getCalendario({
        idTorneo: input.idTorneo,
        giornata: input.giornata,
      })
      return await mapCalendario(result)
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
