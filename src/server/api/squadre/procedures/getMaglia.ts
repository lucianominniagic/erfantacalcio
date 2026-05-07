import { protectedProcedure } from '~/server/api/trpc'
import { parseMaglia } from '~/schemas/maglia'
import type { MagliaType } from '~/schemas/maglia'
import { Utenti } from '~/server/db/entities'

export const getMagliaProcedure = protectedProcedure.query(
  async (opts): Promise<MagliaType | null> => {
    try {
      const utente = await Utenti.findOne({
        select: { maglia: true },
        where: { idUtente: opts.ctx.session.user.idSquadra },
      })

      return parseMaglia(utente?.maglia)
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  },
)
