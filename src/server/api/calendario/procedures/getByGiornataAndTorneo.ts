import { publicProcedure } from '~/server/api/trpc'
import { calendarioByGiornataSchema } from '~/schemas/calendario'
import { getCalendario, mapCalendario } from '../../../utils/common'

export const getByGiornataAndTorneoProcedure = publicProcedure
  .input(calendarioByGiornataSchema)
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
