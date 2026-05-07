import { publicProcedure } from '../../trpc'
import { z } from 'zod'
import { Voti } from '~/server/db/entities'
import { In, MoreThan } from 'typeorm'

export const getFormaGiocatoriProcedure = publicProcedure
  .input(z.object({ idGiocatori: z.array(z.number()) }))
  .query(async ({ input }) => {
    if (input.idGiocatori.length === 0) return []

    const voti = await Voti.find({
      where: { idGiocatore: In(input.idGiocatori), voto: MoreThan(0) },
      select: { idVoto: true, idGiocatore: true, voto: true, Calendario: { giornataSerieA: true } },
      relations: { Calendario: true },
      order: { Calendario: { giornataSerieA: 'DESC' } },
    })

    // Raggruppa per idGiocatore, prendi i primi 3 (già ordinati DESC = più recenti)
    const grouped = new Map<number, number[]>()
    for (const v of voti) {
      const list = grouped.get(v.idGiocatore) ?? []
      if (list.length < 3) {
        list.push(v.voto)
        grouped.set(v.idGiocatore, list)
      }
    }

    return input.idGiocatori.map((idGiocatore) => {
      const list = grouped.get(idGiocatore) ?? []
      const giocate = list.length
      const media =
        giocate < 2
          ? null
          : Math.round((list.reduce((acc, v) => acc + v, 0) / giocate) * 100) / 100

      return { idGiocatore, media, giocate }
    })
  })
