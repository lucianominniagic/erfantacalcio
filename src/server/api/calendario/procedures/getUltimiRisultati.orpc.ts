import { publicProcedure } from '~/server/orpc'
import {
  getCalendario,
  getProssimaGiornataSerieA,
  mapCalendario,
} from '~/server/api/calendario/repository'

export const getUltimiRisultatiORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/calendario/getUltimiRisultati', summary: 'Restituisce gli ultimi risultati del calendario' })
  .handler(async () => {
    try {
      const giornataSerieA = await getProssimaGiornataSerieA(true, 'desc')
      const result = await getCalendario({ giornataSerieA })
      return await mapCalendario(result)
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
