/**
 * Procedura oRPC per getRisultatiStagione — versione parallela al file tRPC (getSaldoSquadre.ts).
 *
 * NON modificare `getSaldoSquadre.ts` (file tRPC originale).
 * Questo file fa parte della migrazione tRPC → oRPC del router `economia`.
 *
 * Restituisce i risultati stagionali necessari per il calcolo dei premi:
 * - classificaMap: posizione in classifica del campionato per ogni squadra
 * - idVincitriceChampions: squadra vincitrice della finale Champions (null se non giocata)
 * - finaleGiocata: se la finale Champions è stata disputata
 */
import { publicProcedure } from '~/server/orpc'
import { Tornei, Classifiche, Calendario, Partite } from '~/server/db/entities'
import { In } from 'typeorm'

export const getRisultatiStagioneORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/economia/getRisultatiStagione', summary: 'Risultati stagionali per calcolo premi' })
  .handler(async () => {
  // 1. Find campionato and champions tornei IDs
  const tornei = await Tornei.find({ select: { idTorneo: true, nome: true } })
  const campionatoIds = tornei
    .filter((t) => t.nome.toLowerCase().includes('campionato'))
    .map((t) => t.idTorneo)
  const championsIds = tornei
    .filter((t) => t.nome.toLowerCase().includes('champions'))
    .map((t) => t.idTorneo)

  if (campionatoIds.length === 0) {
    return {
      classificaMap: {},
      idVincitriceChampions: null,
      finaleGiocata: false,
    }
  }

  // 2. Get campionato classifica
  const classifiche = await Classifiche.find({
    select: { idSquadra: true, punti: true, golFatti: true, golSubiti: true },
    where: { idTorneo: In(campionatoIds) },
    order: { punti: 'DESC', golFatti: 'DESC', golSubiti: 'ASC' },
  })

  const classificaMap = new Map<number, number>()
  classifiche.forEach((c, idx) => {
    if (!classificaMap.has(c.idSquadra)) {
      classificaMap.set(c.idSquadra, idx + 1)
    }
  })

  // 3. Find Champions finale winner
  let idVincitriceChampions: number | null = null
  let finaleGiocata = false

  if (championsIds.length > 0) {
    const calendariChampions = await Calendario.find({
      select: { idCalendario: true, giornata: true, hasGiocata: true },
      where: { idTorneo: In(championsIds) },
      order: { giornata: 'DESC' },
    })

    if (calendariChampions.length > 0) {
      const maxGiornata = calendariChampions[0].giornata
      const finaleCalendari = calendariChampions.filter((c) => c.giornata === maxGiornata)
      const idCalendariFinale = finaleCalendari.map((c) => c.idCalendario)

      const partitaFinale = await Partite.findOne({
        select: { idSquadraH: true, idSquadraA: true, golH: true, golA: true },
        where: { idCalendario: In(idCalendariFinale) },
      })

      if (partitaFinale && partitaFinale.golH !== null && partitaFinale.golA !== null) {
        finaleGiocata = true
        if (partitaFinale.golH > partitaFinale.golA) {
          idVincitriceChampions = partitaFinale.idSquadraH
        } else if (partitaFinale.golA > partitaFinale.golH) {
          idVincitriceChampions = partitaFinale.idSquadraA
        }
      }
    }
  }

  return {
    classificaMap: Object.fromEntries(classificaMap),
    idVincitriceChampions,
    finaleGiocata,
  }
})
