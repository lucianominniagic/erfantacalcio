import { z } from 'zod'
import { adminProcedure } from '~/server/orpc'
import { SquadreSerieA } from '~/server/db/entities'

export const updateSquadraSerieAORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/squadreSerieA/update', summary: 'Aggiorna squadra Serie A' })
  .input(
    z.object({
      idSquadraSerieA: z.number(),
      nome: z.string(),
      maglia: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    try {
      await SquadreSerieA.update(
        { idSquadraSerieA: input.idSquadraSerieA },
        {
          nome: input.nome,
          maglia: input.maglia,
        },
      )
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
