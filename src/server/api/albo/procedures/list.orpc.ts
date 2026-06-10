import { publicProcedure } from '~/server/orpc'
import { AlboTrofei } from '~/server/db/entities'

export const listAlboORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/albo/list', summary: 'Lista albo trofei' })
  .handler(async () => {
    try {
      const records = await AlboTrofei.find({
        order: { stagione: 'DESC', campionato: 'DESC', champions: 'DESC', secondo: 'DESC', terzo: 'DESC' },
      })
      return records.map((c) => ({
        id: c.id,
        stagione: c.stagione,
        campionato: c.campionato,
        champions: c.champions,
        secondo: c.secondo,
        terzo: c.terzo,
      }))
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
