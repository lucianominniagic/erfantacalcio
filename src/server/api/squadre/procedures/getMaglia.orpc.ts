import { protectedProcedure } from '~/server/orpc'
import { parseMaglia } from '~/schemas/maglia'
import type { MagliaType } from '~/schemas/maglia'
import { Utenti } from '~/server/db/entities'

export const getMagliaORPCProcedure = protectedProcedure
  .route({ method: 'GET', path: '/squadre/getMaglia', summary: 'Maglia della squadra dell\'utente' })
  .handler(async ({ context }): Promise<MagliaType | null> => {
    try {
      const utente = await Utenti.findOne({
        select: { maglia: true },
        where: { idUtente: context.session.user.idSquadra },
      })

      return parseMaglia(utente?.maglia)
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
