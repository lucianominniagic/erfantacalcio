import { publicProcedure } from '~/server/orpc'
import {
  getProssimaGiornata,
  getProssimaGiornataSerieA,
} from '~/server/api/calendario/repository'

export const getProssimeGiornateORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/calendario/getProssimeGiornate', summary: 'Restituisce le prossime giornate del calendario' })
  .handler(async () => {
    try {
      const giornataSerieA = await getProssimaGiornataSerieA(false, 'asc')
      return await getProssimaGiornata(giornataSerieA)
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
