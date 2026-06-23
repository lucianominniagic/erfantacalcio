import { z } from 'zod'
import { publicProcedure } from '~/server/orpc'
import { getGiocatoriVenduti, getRosaDisponibile } from '~/server/api/squadre/services/rosaService'
import { Voti } from '~/server/db/entities'
import { In, MoreThan } from 'typeorm'

type FormaData = { media: number | null; giocate: number }

export const getRosaORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/squadre/getRosa', summary: 'Rosa di una squadra fantasy' })
  .input(
    z.object({
      idSquadra: z.number(),
      includeVenduti: z.boolean(),
      includeForma: z.boolean().optional(),
    }),
  )
  .handler(async ({ input }) => {
    const { idSquadra, include, includeForma } = {
      idSquadra: input.idSquadra,
      include: input.includeVenduti,
      includeForma: input.includeForma ?? false,
    }
    try {
      const rosaDisponibile = await getRosaDisponibile(idSquadra)
      const giocatori = include
        ? [...rosaDisponibile, ...(await getGiocatoriVenduti(idSquadra))]
        : rosaDisponibile

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
