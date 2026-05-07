import { Configurazione } from '~/config'
import { Classifiche, Partite, Utenti } from '~/server/db/entities'
import { EntityManager } from 'typeorm'

export async function UpdateClassifica(
  trx: EntityManager,
  idSquadra: number,
  idTorneo: number,
) {
  const partite = await trx.find(Partite, {
    where: [
      {
        idSquadraH: idSquadra,
        Calendario: { idTorneo: idTorneo, hasGiocata: true },
      },
      {
        idSquadraA: idSquadra,
        Calendario: { idTorneo: idTorneo, hasGiocata: true },
      },
    ],
  })
  const puntiH = partite
    .filter((p) => p.idSquadraH === idSquadra)
    .reduce((sum, p) => sum + (p.hasMultaH ? 0 : (p.puntiH ?? 0)), 0)
  const vinteH = partite.filter(
    (p) => p.idSquadraH === idSquadra && (p.golH ?? 0) > (p.golA ?? 0),
  ).length
  const nulleH = partite.filter(
    (p) => p.idSquadraH === idSquadra && (p.golH ?? 0) === (p.golA ?? 0),
  ).length
  const perseH = partite.filter(
    (p) => p.idSquadraH === idSquadra && (p.golH ?? 0) < (p.golA ?? 0),
  ).length
  const golFattiH = partite
    .filter((p) => p.idSquadraH === idSquadra)
    .reduce((sum, p) => sum + (p.golH ?? 0), 0)
  const golSubitiH = partite
    .filter((p) => p.idSquadraH === idSquadra)
    .reduce((sum, p) => sum + (p.golA ?? 0), 0)
  const multeH = partite.filter(
    (p) => p.idSquadraH === idSquadra && p.hasMultaH,
  ).length

  const puntiA = partite
    .filter((p) => p.idSquadraA === idSquadra)
    .reduce((sum, p) => sum + (p.hasMultaA ? 0 : (p.puntiA ?? 0)), 0)
  const vinteA = partite.filter(
    (p) => p.idSquadraA === idSquadra && (p.golA ?? 0) > (p.golH ?? 0),
  ).length
  const nulleA = partite.filter(
    (p) => p.idSquadraA === idSquadra && (p.golA ?? 0) === (p.golH ?? 0),
  ).length
  const perseA = partite.filter(
    (p) => p.idSquadraA === idSquadra && (p.golA ?? 0) < (p.golH ?? 0),
  ).length
  const golFattiA = partite
    .filter((p) => p.idSquadraA === idSquadra)
    .reduce((sum, p) => sum + (p.golA ?? 0), 0)
  const golSubitiA = partite
    .filter((p) => p.idSquadraA === idSquadra)
    .reduce((sum, p) => sum + (p.golH ?? 0), 0)
  const multeA = partite.filter(
    (p) => p.idSquadraA === idSquadra && p.hasMultaA,
  ).length

  const giocate = vinteH + nulleH + perseH + vinteA + nulleA + perseA

  await trx.update(
    Classifiche,
    { idSquadra, idTorneo },
    {
      punti: puntiH + puntiA,
      vinteCasa: vinteH,
      pareggiCasa: nulleH,
      perseCasa: perseH,
      vinteTrasferta: vinteA,
      pareggiTrasferta: nulleA,
      perseTrasferta: perseA,
      golFatti: golFattiH + golFattiA,
      golSubiti: golSubitiH + golSubitiA,
      differenzaReti: golFattiH + golFattiA - (golSubitiH + golSubitiA),
      giocate,
    },
  )
  await trx.update(
    Utenti,
    { idUtente: idSquadra },
    { importoMulte: (multeH + multeA) * Configurazione.importoMulta },
  )
}
