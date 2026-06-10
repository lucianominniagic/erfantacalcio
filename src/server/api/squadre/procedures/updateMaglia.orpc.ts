import { z } from 'zod'
import { protectedProcedure } from '~/server/orpc'
import { Utenti } from '~/server/db/entities'

export const updateMagliaORPCProcedure = protectedProcedure
  .route({ method: 'POST', path: '/squadre/updateMaglia', summary: 'Aggiorna maglia della squadra' })
  .input(
    z.object({
      mainColor: z.string(),
      secondaryColor: z.string(),
      thirdColor: z.string(),
      textColor: z.string(),
      shirtNumber: z.number(),
      selectedTemplate: z.string(),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      await Utenti.update(
        { idUtente: context.session.user.idSquadra },
        { maglia: JSON.stringify(input) },
      )
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
