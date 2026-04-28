import { protectedProcedure } from '~/server/api/trpc'
import type { magliaType } from '~/components/selectColors'
import { Utenti } from '~/server/db/entities'

export const getMagliaProcedure = protectedProcedure.query(
  async (opts): Promise<magliaType | null> => {
    try {
      const utente = await Utenti.findOne({
        select: { maglia: true },
        where: { idUtente: opts.ctx.session.user.idSquadra },
      })

      if (!utente || !utente.maglia) {
        return null
      }

      return JSON.parse(utente.maglia) as magliaType
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  },
)
