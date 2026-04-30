import { publicProcedure } from '~/server/api/trpc'
import { z } from 'zod'
import { Tornei, Classifiche, Calendario, Partite } from '~/server/db/entities'
import { In } from 'typeorm'

export const getSaldoSquadreProcedure = publicProcedure
  .input(z.object({ detrazioneSito: z.number() }))
  .query(async ({ input }) => {
    // 1. Find campionato and champions tornei IDs
    const tornei = await Tornei.find({ select: { idTorneo: true, nome: true } })
    const campionatoIds = tornei
      .filter((t) => t.nome.toLowerCase().includes('campionato'))
      .map((t) => t.idTorneo)
    const championsIds = tornei
      .filter((t) => t.nome.toLowerCase().includes('champions'))
      .map((t) => t.idTorneo)

    if (campionatoIds.length === 0) return []

    // 2. Get campionato classifica (sorted by punti desc, then golFatti desc, golSubiti asc)
    const classifiche = await Classifiche.find({
      select: {
        idSquadra: true,
        punti: true,
        golFatti: true,
        golSubiti: true,
      },
      where: { idTorneo: In(campionatoIds) },
      order: { punti: 'DESC', golFatti: 'DESC', golSubiti: 'ASC' },
    })

    const classificaMap = new Map<number, number>()
    classifiche.forEach((c, idx) => {
      if (!classificaMap.has(c.idSquadra)) {
        classificaMap.set(c.idSquadra, idx + 1)
      }
    })

    // 3. Find Champions finale winner (partita in max giornata of champions tornei)
    let idVincitriceChampions: number | null = null
    let finaleGiocata = false

    if (championsIds.length > 0) {
      // Find the max giornata in the champions torneo
      const calendariChampions = await Calendario.find({
        select: { idCalendario: true, giornata: true, hasGiocata: true },
        where: { idTorneo: In(championsIds) },
        order: { giornata: 'DESC' },
      })

      if (calendariChampions.length > 0) {
        const maxGiornata = calendariChampions[0]!.giornata
        const finaleCalendari = calendariChampions.filter(
          (c) => c.giornata === maxGiornata,
        )
        const idCalendariFinale = finaleCalendari.map((c) => c.idCalendario)

        const partitaFinale = await Partite.findOne({
          select: {
            idSquadraH: true,
            idSquadraA: true,
            golH: true,
            golA: true,
          },
          where: { idCalendario: In(idCalendariFinale) },
        })

        if (
          partitaFinale &&
          partitaFinale.golH !== null &&
          partitaFinale.golA !== null
        ) {
          finaleGiocata = true
          if (partitaFinale.golH > partitaFinale.golA) {
            idVincitriceChampions = partitaFinale.idSquadraH
          } else if (partitaFinale.golA > partitaFinale.golH) {
            idVincitriceChampions = partitaFinale.idSquadraA
          }
          // In case of draw: no champion (edge case)
        }
      }
    }

    return {
      classificaMap: Object.fromEntries(classificaMap),
      idVincitriceChampions,
      finaleGiocata,
    }
  })
