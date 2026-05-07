import { toUtcDate } from '~/utils/dateUtils'
import { Configurazione } from '~/config'
import { getCalendario } from '../../../utils/common'
import { type Partita, RoundRobin4, RoundRobin8 } from '~/utils/bergerTables'
import {
  Calendario,
  Classifiche,
  FlowNewSeason,
  Partite,
  Voti,
} from '~/server/db/entities'
import { EntityManager, LessThanOrEqual } from 'typeorm'

export async function updateFase(trx: EntityManager, idFase: number) {
  await trx.update(
    FlowNewSeason,
    { idFase },
    { active: true, data: toUtcDate(new Date()) },
  )
}

export async function creaPartite(
  trx: EntityManager,
  squadre: number,
  idTorneo: number,
  evaluateLastGirone: boolean,
  idAccumulate = 0,
) {
  let roundRobin: Partita[] | undefined

  if (squadre === 8) {
    roundRobin = RoundRobin8()
    console.info('creato roundrobin 8 squadre')
  } else if (squadre === 4) {
    roundRobin = RoundRobin4()
    console.info('creato roundrobin 4 squadre')
  } else {
    console.error('Numero di squadre non supportato')
    throw new Error('Numero di squadre non supportato')
  }

  const calendario = await getCalendario({ idTorneo: idTorneo })
  if (calendario && roundRobin) {
    let index = 1
    let previousGirone = calendario[0]?.girone
    const lastGirone = calendario[calendario.length - 1]?.girone
    console.info(
      `lastGirone: ${lastGirone}, evaluateLastGirone: ${evaluateLastGirone}`,
    )

    for (const c of calendario) {
      if (c.girone !== previousGirone) {
        previousGirone = c.girone!
        index = 1
      }

      const matches = roundRobin.filter((x) => x.giornata === index)
      console.info(`Matches for girone ${c.girone}:`, matches)

      for (const p of matches) {
        let fattoreCasalingo = Configurazione.bonusFattoreCasalingo > 0
        if (evaluateLastGirone && lastGirone === c.girone && fattoreCasalingo) {
          fattoreCasalingo =
            (calendario[calendario.length - 1]?.girone ?? 0) % 2 === 0
          console.info(
            `Fattore casalingo per l'ultima giornata: ${fattoreCasalingo}`,
          )
        }
        await trx.insert(Partite, {
          idCalendario: c.idCalendario,
          idSquadraH:
            c.girone! % 2 === 0
              ? p.squadraHome + idAccumulate
              : p.squadraAway + idAccumulate,
          idSquadraA:
            c.girone! % 2 === 0
              ? p.squadraAway + idAccumulate
              : p.squadraHome + idAccumulate,
          fattoreCasalingo,
          golH: null,
          golA: null,
          hasMultaH: false,
          hasMultaA: false,
          punteggioH: null,
          punteggioA: null,
          puntiH: null,
          puntiA: null,
        })
      }

      index++
    }

    console.info(`create partite calendario per idTorneo: ${idTorneo}`)
  }
}

export async function creaClassifica(
  trx: EntityManager,
  idTorneo: number,
  from: number,
  to: number,
) {
  for (let i = from; i <= to; i++) {
    await trx.insert(Classifiche, {
      idSquadra: i,
      idTorneo,
      differenzaReti: 0,
      giocate: 0,
      golFatti: 0,
      golSubiti: 0,
      pareggiCasa: 0,
      pareggiTrasferta: 0,
      perseCasa: 0,
      perseTrasferta: 0,
      punti: 0,
      vinteCasa: 0,
      vinteTrasferta: 0,
    })
  }

  console.info(`create classifiche per idTorneo: ${idTorneo}`)
}

export async function creaPartiteEmpty(
  trx: EntityManager,
  partite: number,
  idTorneo: number,
  fattoreCasalingo: boolean,
) {
  const calendario = await getCalendario({ idTorneo: idTorneo })
  if (calendario.length === 0) {
    console.error('Impossibile creare partite vuote, calendario non trovato')
    throw new Error('Impossibile creare partite vuote, calendario non trovato')
  }
  for (let i = 0; i < partite; i++) {
    await trx.insert(Partite, {
      idCalendario: calendario.pop()?.idCalendario!,
      idSquadraH: null,
      idSquadraA: null,
      fattoreCasalingo,
      golH: null,
      golA: null,
      hasMultaH: false,
      hasMultaA: false,
      punteggioH: null,
      punteggioA: null,
      puntiH: null,
      puntiA: null,
    })
  }
  console.info(`create partite calendario per idTorneo: ${idTorneo}`)
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
