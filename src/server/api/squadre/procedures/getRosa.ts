import { z } from 'zod'
import { publicProcedure } from '~/server/api/trpc'
import { getGiocatoriVenduti, getRosaDisponibile } from '../../../utils/common'
import { Voti } from '~/server/db/entities'
import { In, MoreThan } from 'typeorm'

type FormaData = { media: number | null; giocate: number }

export const getRosaProcedure = publicProcedure
  .input(
    z.object({
      idSquadra: z.number(),
      includeVenduti: z.boolean(),
      includeForma: z.boolean().optional(),
    }),
  )
  .query(async (opts) => {
    const { idSquadra, include, includeForma } = {
      idSquadra: opts.input.idSquadra,
      include: opts.input.includeVenduti,
      includeForma: opts.input.includeForma ?? false,
    }
    try {
      const rosaDisponibile = await getRosaDisponibile(idSquadra)
      const giocatori = include
        ? [...rosaDisponibile, ...(await getGiocatoriVenduti(idSquadra))]
        : rosaDisponibile

      // Build forma map (empty when not requested)
      const grouped = new Map<number, number[]>()

      if (includeForma && giocatori.length > 0) {
        const idGiocatori = giocatori.map((g) => g.idGiocatore)
        const voti = await Voti.find({
          where: { idGiocatore: In(idGiocatori), voto: MoreThan(0) },
          select: { idVoto: true, idGiocatore: true, voto: true, Calendario: { giornataSerieA: true } },
          relations: { Calendario: true },
          order: { Calendario: { giornataSerieA: 'DESC' } },
        })
        for (const v of voti) {
          const list = grouped.get(v.idGiocatore) ?? []
          if (list.length < 3) {
            list.push(v.voto)
            grouped.set(v.idGiocatore, list)
          }
        }
      }

      // Always return the same shape — forma is undefined when not requested
      return giocatori.map((g) => {
        const forma: FormaData | undefined = includeForma
          ? (() => {
              const list = grouped.get(g.idGiocatore) ?? []
              const giocate = list.length
              const media =
                giocate < 2
                  ? null
                  : Math.round((list.reduce((acc, v) => acc + v, 0) / giocate) * 100) / 100
              return { media, giocate }
            })()
          : undefined
        return { ...g, forma }
      })
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
