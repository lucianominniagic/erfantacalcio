import { z } from 'zod'
import { publicProcedure } from '~/server/orpc'
import { Configurazione } from '~/config'
import { Voti } from '~/server/db/entities'
import { MoreThan } from 'typeorm'

export const getStatisticaVotiORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/voti/getStatisticaVoti', summary: 'Statistiche voti di un giocatore' })
  .input(z.object({ idGiocatore: z.number(), top: z.number().nullable().optional() }))
  .handler(async ({ input }) => {
    const result = await Voti.find({
      where: { idGiocatore: input.idGiocatore, voto: MoreThan(0) },
      select: {
        idVoto: true,
        voto: true,
        ammonizione: true,
        espulsione: true,
        gol: true,
        assist: true,
        autogol: true,
        altriBonus: true,
        titolare: true,
        riserva: true,
        Giocatore: { nome: true, ruolo: true },
        Calendario: {
          giornataSerieA: true,
          Torneo: { nome: true, gruppoFase: true },
        },
      },
      relations: { Giocatore: true, Calendario: { Torneo: true } },
      order: { Calendario: { giornataSerieA: 'asc' } },
      take: input.top ? input.top : 1000,
    })

    const voti = result.reduce((acc, c) => {
      const giornata = c.Calendario.giornataSerieA
      if (!acc.has(giornata)) {
        acc.set(giornata, {
          voto: Number(c.voto),
          ammonizione: Number(c.ammonizione),
          espulsione: Number(c.espulsione),
          gol:
            c.Giocatore.ruolo === 'P'
              ? (c.gol ?? 0) / Configurazione.bonusGolSubito
              : (c.gol ?? 0) / Configurazione.bonusGol,
          assist: (c.assist ?? 0) / Configurazione.bonusAssist,
          giornataSerieA: giornata.toString(),
        })
      }
      return acc
    }, new Map())

    return Array.from(voti.values())
  })
