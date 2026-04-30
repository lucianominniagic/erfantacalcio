import { z } from 'zod'
import { publicProcedure } from '~/server/api/trpc'
import { StatsA, StatsC, StatsD, StatsP, Utenti } from '~/server/db/entities'
import { Not, IsNull } from 'typeorm'
import { getSogliaGiocate } from '~/server/api/giocatori/utils'

interface PlayerRow {
  idgiocatore: number
  nome: string
  ruolo: string
  maglia: string
  squadraSerieA?: string | null
  idSquadra?: number | null
  media?: string | number | null
  golfatti?: string | number | null
  assist?: string | number | null
  giocate?: number | null
}

interface TopEntry {
  idGiocatore: number
  nome: string
  ruolo: string
  maglia: string | null
  squadraSerieA: string | null
  value: number
}

export interface TopGiocatoriPerSquadra {
  idSquadra: number
  squadra: string
  foto: string | null
  topMedia: TopEntry | null
  topBomber: TopEntry | null
  topAssist: TopEntry | null
}

const buildEntry = (player: PlayerRow, value: number): TopEntry => ({
  idGiocatore: player.idgiocatore,
  nome: player.nome,
  ruolo: player.ruolo,
  maglia: player.maglia ? `/images/maglie/${player.maglia}` : null,
  squadraSerieA: player.squadraSerieA ?? null,
  value,
})

export const topGiocatoriProcedure = publicProcedure
  .input(z.object({ idTornei: z.array(z.number()) }))
  .query(async () => {
    try {
      const sogliaGiocate = await getSogliaGiocate()

      const select = {
        idgiocatore: true,
        nome: true,
        ruolo: true,
        maglia: true,
        squadraSerieA: true,
        idSquadra: true,
        media: true,
        golfatti: true,
        assist: true,
        giocate: true,
      }
      const where = { idSquadra: Not(IsNull()) }

      const [statsP, statsD, statsC, statsA, utenti] = await Promise.all([
        StatsP.find({ select, where }),
        StatsD.find({ select, where }),
        StatsC.find({ select, where }),
        StatsA.find({ select, where }),
        Utenti.find({
          select: { idUtente: true, nomeSquadra: true, foto: true },
          order: { nomeSquadra: 'asc' },
        }),
      ])

      const allPlayers: PlayerRow[] = [...statsP, ...statsD, ...statsC, ...statsA]
      const bomberPool: PlayerRow[] = [...statsD, ...statsC, ...statsA]
      const assistPool: PlayerRow[] = [...statsD, ...statsC, ...statsA]

      const result: TopGiocatoriPerSquadra[] = utenti.map((u) => {
        const idSquadra = u.idUtente

        let topMedia: TopEntry | null = null
        for (const p of allPlayers) {
          if (p.idSquadra !== idSquadra) continue
          if ((p.giocate ?? 0) < sogliaGiocate) continue
          const val = Number(p.media ?? 0)
          if (val <= 0) continue
          if (!topMedia || val > topMedia.value) topMedia = buildEntry(p, val)
        }

        let topBomber: TopEntry | null = null
        for (const p of bomberPool) {
          if (p.idSquadra !== idSquadra) continue
          const val = Number(p.golfatti ?? 0)
          if (val <= 0) continue
          if (!topBomber || val > topBomber.value) topBomber = buildEntry(p, val)
        }

        let topAssist: TopEntry | null = null
        for (const p of assistPool) {
          if (p.idSquadra !== idSquadra) continue
          const val = Number(p.assist ?? 0)
          if (val <= 0) continue
          if (!topAssist || val > topAssist.value) topAssist = buildEntry(p, val)
        }

        return {
          idSquadra,
          squadra: u.nomeSquadra,
          foto: u.foto,
          topMedia,
          topBomber,
          topAssist,
        }
      })

      return result
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })

