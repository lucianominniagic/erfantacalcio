import { publicProcedure } from '../../trpc'
import { z } from 'zod'
import { Configurazione } from '~/config'
import { Voti } from '~/server/db/entities'
import { MoreThan } from 'typeorm'

export const showStatisticaVotiProcedure = publicProcedure
  .input(
    z.object({
      idGiocatore: z.number(),
      top: z.number().nullable().optional(),
    }),
  )
  .query(async (opts) => {
    try {
      const result = await Voti.find({
        where: {
          idGiocatore: opts.input.idGiocatore,
          voto: MoreThan(0),
        },
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
        relations: {
          Giocatore: true,
          Calendario: {
            Torneo: true,
          },
        },
        order: {
          Calendario: {
            giornataSerieA: 'asc',
          },
        },
        take: opts.input.top ? opts.input.top : 1000,
      })

      if (result !== null) {
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
        const votiDistinct = Array.from(voti.values())
        return votiDistinct
      } else return []
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
