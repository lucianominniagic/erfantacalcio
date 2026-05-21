import { z } from 'zod'
import { protectedProcedure } from '~/server/orpc'
import { Utenti } from '~/server/db/entities'

export const updateFotoORPCProcedure = protectedProcedure
  .route({ method: 'POST', path: '/profilo/updateFoto', summary: 'Aggiorna URL foto profilo' })
  .input(z.object({ fileName: z.string() }))
  .handler(async ({ input, context }) => {
    try {
      const filePath = input.fileName
      await Utenti.update(
        { idUtente: context.session.user.idSquadra },
        { foto: filePath },
      )
      console.info(`Foto profilo utente aggiornata: ${filePath}`)
      return filePath
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
