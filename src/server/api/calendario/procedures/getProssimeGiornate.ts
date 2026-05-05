import { publicProcedure } from '~/server/api/trpc'
import {
  getProssimaGiornata,
  getProssimaGiornataSerieA,
} from '../../../utils/common'

export const getProssimeGiornateProcedure = publicProcedure.query(async () => {
  try {
    const giornataSerieA = await getProssimaGiornataSerieA(false, 'asc')
    return await getProssimaGiornata(giornataSerieA)
  } catch (error) {
    console.error('Si è verificato un errore', error)
    throw error
  }
})
