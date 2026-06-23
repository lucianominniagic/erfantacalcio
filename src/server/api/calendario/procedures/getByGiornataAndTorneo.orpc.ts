import { publicProcedure } from '~/server/orpc'
import { calendarioByGiornataSchema } from '~/schemas/calendario'
import { getCalendario, mapCalendario } from '~/server/api/calendario/repository'

export const getByGiornataAndTorneoORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/calendario/getByGiornataAndTorneo', summary: 'Recupera partite del calendario per giornata e torneo' })
  .input(calendarioByGiornataSchema)
  .handler(async ({ input }) => {
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
