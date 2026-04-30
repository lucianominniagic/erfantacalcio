import { publicProcedure } from '../../trpc'
import { z } from 'zod'
import { StatsA, StatsC, StatsD, StatsP } from '~/server/db/entities'
import { toClientPlayer } from '../utils'

export const listStatisticheSquadra = publicProcedure
  .input(
    z.object({
      id_squadra: z.number(),
    }),
  )
  .query(async (opts) => {
    try {
      const playerStatsSelect = {
        maglia: true,
        ruolo: true,
        media: true,
        mediabonus: true,
        golfatti: true,
        golsubiti: true,
        assist: true,
        giocate: true,
        nome: true,
        idgiocatore: true,
        squadraSerieA: true,
        idSquadra: true,
      }
      const whereClause = { idSquadra: opts.input.id_squadra }
      const [statsP, statsD, statsC, statsA] = await Promise.all([
        StatsP.find({ select: playerStatsSelect, where: whereClause }),
        StatsD.find({ select: playerStatsSelect, where: whereClause }),
        StatsC.find({ select: playerStatsSelect, where: whereClause }),
        StatsA.find({ select: playerStatsSelect, where: whereClause }),
      ])

      const stat = [...statsP, ...statsD, ...statsC, ...statsA]

      return stat.map((player) => ({
        ...toClientPlayer(player),
        gol: player.ruolo === 'P'
          ? -Number(player.golsubiti)
          : Number(player.golfatti),
      }))
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })

