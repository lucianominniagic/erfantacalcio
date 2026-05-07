import { publicProcedure } from '~/server/api/trpc'
import { getCalendario, mapCalendario } from '../../../utils/common'
import { In } from 'typeorm'
import { z } from 'zod'

export const listByTorneoProcedure = publicProcedure
  .input(z.number().array())
  .query(async ({ input }) => {
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
