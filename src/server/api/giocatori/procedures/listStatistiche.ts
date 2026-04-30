import { publicProcedure } from '../../trpc'
import { z } from 'zod'
import { Configurazione } from '~/config'
import { IsNull, MoreThanOrEqual, type FindManyOptions } from 'typeorm'
import { roleEntityMap, toClientPlayer, getSogliaGiocate } from '../utils'

export const listStatistiche = publicProcedure
  .input(
    z.object({
      ruolo: z.enum(['P', 'D', 'C', 'A']),
      soloSvincolati: z.boolean().default(false),
    }),
  )
  .query(async (opts) => {
    try {
      const { ruolo, soloSvincolati } = opts.input
      const Entity = roleEntityMap[ruolo]

      const sogliaGiocate = await getSogliaGiocate()

      const findOptions: FindManyOptions = {
        select: {
          media: true,
          mediabonus: true,
          golfatti: true,
          golsubiti: true,
          assist: true,
          ammonizioni: true,
          espulsioni: true,
          giocate: true,
          ruolo: true,
          nome: true,
          nomefantagazzetta: true,
          idgiocatore: true,
          maglia: true,
          squadraSerieA: true,
          squadra: true,
          idSquadra: true,
        },
        where: {
          giocate: MoreThanOrEqual(sogliaGiocate),
          ...(soloSvincolati ? { idSquadra: IsNull() } : {}),
        },
        order: { media: 'desc', mediabonus: 'desc', giocate: 'desc' },
        take: Configurazione.recordCount,
      }

      const rows = await Entity.find(findOptions)
      return rows.map(toClientPlayer)
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })

