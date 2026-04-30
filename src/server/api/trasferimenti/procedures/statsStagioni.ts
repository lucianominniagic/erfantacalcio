import { publicProcedure } from '~/server/api/trpc'
import { number, z } from 'zod'
import { Configurazione } from '~/config'
import { Trasferimenti } from '~/server/db/entities'
import { Not } from 'typeorm'

export const statsStagioniProcedure = publicProcedure
  .input(z.object({ idGiocatore: number() }))
  .query(async (opts) => {
    const idGiocatore = +opts.input.idGiocatore
    try {
      const query = await Trasferimenti.find({
        select: {
          idTrasferimento: true,
          idGiocatore: false,
          costo: true,
          media: true,
          gol: true,
          assist: true,
          giocate: true,
          dataAcquisto: true,
          dataCessione: true,
          stagione: true,
          nomeSquadra: true,
          nomeSquadraSerieA: true,
          Utente: { idUtente: true, nomeSquadra: true },
          Giocatore: { idGiocatore: true, nome: true, ruolo: true },
          SquadraSerieA: { idSquadraSerieA: true, nome: true },
        },
        relations: { Utente: true, Giocatore: true, SquadraSerieA: true },
        where: { idGiocatore: idGiocatore , stagione: Not(Configurazione.stagione), hasRitirato: false },
        order: { stagione: 'desc' , dataAcquisto: 'desc' },
      })

      const aggregatedStats: Record<string, { media: number; gol: number; assist: number; giocate: number }> = {}

      query.forEach(({ stagione, media, gol, assist, giocate }) => {
        if (!aggregatedStats[stagione]) {
          aggregatedStats[stagione] = { media: 0, gol: 0, assist: 0, giocate: 0 }
        }
        const currentStats = aggregatedStats[stagione]
        const gamesPlayed = giocate ?? 0
        if (currentStats && media) {
          currentStats.media += gamesPlayed * media
          currentStats.gol += gol ?? 0
          currentStats.assist += assist ?? 0
          currentStats.giocate += gamesPlayed
        }
      })

      Object.keys(aggregatedStats).forEach((stagione) => {
        const stats = aggregatedStats[stagione]
        if (stats && stats.giocate > 0) {
          stats.media /= stats.giocate
        }
      })

      return Object.entries(aggregatedStats).map(([stagione, stats]) => ({
        stagione,
        media: Math.round(stats.media * 100) / 100,
        gol: stats.gol,
        assist: stats.assist,
        giocate: stats.giocate,
      }))
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
