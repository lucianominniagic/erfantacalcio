import { z } from 'zod'
import { publicProcedure } from '~/server/orpc'
import { Configurazione } from '~/config'
import { Voti } from '~/server/db/entities'

export const listVotiORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/voti/list', summary: 'Lista voti di un giocatore' })
  .input(
    z.object({
      idGiocatore: z.number(),
      top: z.number().nullable().optional(),
    }),
  )
  .handler(async ({ input }) => {
    try {
      const result = await Voti.find({
        where: {
          idGiocatore: input.idGiocatore,
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
        relations: { Giocatore: true, Calendario: { Torneo: true } },
        order: {
          Calendario: {
            giornataSerieA: 'desc',
          },
        },
        take: input.top ? input.top : 1000,
      })

      if (result !== null) {
        return result.map((c) => ({
          id: c.idVoto,
          nome: c.Giocatore.nome,
          ruolo: c.Giocatore.ruolo,
          voto: c.voto,
          ammonizione: c.ammonizione,
          espulsione: c.espulsione,
          gol:
            c.Giocatore.ruolo === 'P'
              ? (c.gol ?? 0) / Configurazione.bonusGolSubito
              : (c.gol ?? 0) / Configurazione.bonusGol,
          assist: (c.assist ?? 0) / Configurazione.bonusAssist,
          autogol: (c.autogol ?? 0) / Configurazione.bonusAutogol,
          altriBonus: c.altriBonus,
          torneo: c.Calendario.Torneo.nome,
          gruppoFase: c.Calendario.Torneo.gruppoFase,
          giornataSerieA: c.Calendario.giornataSerieA,
        }))
      } else return null
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
