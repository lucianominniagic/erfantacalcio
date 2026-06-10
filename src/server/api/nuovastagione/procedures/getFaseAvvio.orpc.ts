import { z } from 'zod'
import { adminProcedure } from '~/server/orpc'
import { FlowNewSeason } from '~/server/db/entities'

export const getFaseAvvioORPCProcedure = adminProcedure
  .route({ method: 'GET', path: '/nuovastagione/getFaseAvvio', summary: 'Ottieni la fase corrente di avvio nuova stagione' })
  .output(z.number())
  .handler(async () => {
    try {
      const fase = await FlowNewSeason.findOne({
        where: { active: false },
        order: { idFase: 'ASC' },
      })
      return fase ? fase.idFase : 6
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
