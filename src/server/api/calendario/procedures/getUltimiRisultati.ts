import { publicProcedure } from '~/server/api/trpc'
import {
  getCalendario,
  getProssimaGiornataSerieA,
  mapCalendario,
} from '../../../utils/common'

export const getUltimiRisultatiProcedure = publicProcedure.query(async () => {
  try {
    const giornataSerieA = await getProssimaGiornataSerieA(true, 'desc')
    const result = await getCalendario({ giornataSerieA })
    return await mapCalendario(result)
  } catch (error) {
    console.error('Si è verificato un errore', error)
    throw error
  }
})
