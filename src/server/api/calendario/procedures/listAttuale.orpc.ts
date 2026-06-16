import { publicProcedure } from '~/server/orpc'
import { getCalendario, mapCalendario } from '~/server/api/calendario/repository'
import { Between, MoreThan } from 'typeorm'

export const listAttualeORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/calendario/listAttuale', summary: 'Lista partite del calendario attuale (±10 giorni)' })
  .handler(async () => {
    try {
      const currentDateMinus = new Date()
      currentDateMinus.setDate(currentDateMinus.getDate() - 10)
      const currentDatePlus = new Date()
      currentDatePlus.setDate(currentDateMinus.getDate() + 10)
      const result = await getCalendario({
        girone: MoreThan(0),
        giornata: MoreThan(0),
        data: Between(currentDateMinus, currentDatePlus),
      })
      return await mapCalendario(result)
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
