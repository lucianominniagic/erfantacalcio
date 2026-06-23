/**
 * flowFaseRepository — query di stato e avanzamento del flusso nuova stagione.
 *
 * Espone: updateFase, checkVotiUltimaGiornata, checkCountPartite,
 *         checkCountClassifiche, checkVerificaPartiteGiocate.
 */

import { toUtcDate } from '~/utils/dateUtils'
import { Calendario, Classifiche, FlowNewSeason, Partite, Voti } from '~/server/db/entities'
import { type EntityManager, LessThanOrEqual } from 'typeorm'

export async function updateFase(trx: EntityManager, idFase: number) {
  await trx.update(
    FlowNewSeason,
    { idFase },
    { active: true, data: toUtcDate(new Date()) },
  )
}

export async function checkVotiUltimaGiornata() {
  return (
    (await Voti.count({
      where: { Calendario: { giornataSerieA: 38 } },
      relations: { Calendario: true },
    })) > 0
  )
}

export async function checkCountPartite() {
  return (await Partite.count()) === 0
}

export async function checkCountClassifiche() {
  return (await Classifiche.count()) === 0
}

export async function checkVerificaPartiteGiocate() {
  return (
    (await Calendario.count({
      where: { hasGiocata: false, idTorneo: LessThanOrEqual(6) },
    })) === 0
  )
}
