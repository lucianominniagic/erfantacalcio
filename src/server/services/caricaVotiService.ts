import _ from 'lodash'
import { type EntityManager, In } from 'typeorm'
import type { z } from 'zod'
import { Configurazione } from '~/config'
import type { uploadVotoGiocatoreSchema } from '~/schemas/giocatore'
import { AppDataSource } from '~/data-source'
import {
  Calendario,
  Giocatori,
  SquadreSerieA,
  Trasferimenti,
  Voti,
} from '~/server/db/entities'
import { calcBonusVoto } from '~/server/services/votiService'
import { normalizeNomeGiocatore } from '~/utils/helper'

type UploadVotoGiocatoreType = z.infer<typeof uploadVotoGiocatoreSchema>

type GiocatoreInfo = {
  idGiocatore: number | undefined
  id_pf: number | null
  nome: string
}

export async function caricaVoti(
  votiGiocatori: UploadVotoGiocatoreType[],
  idCalendario: number,
): Promise<void> {
  await checkFormazioni(idCalendario)

  await AppDataSource.transaction(async (trx) => {
    const giocatori = await findAndCreateGiocatori(
      trx,
      votiGiocatori.map((v) => ({
        id_pf: v.id_pf,
        nome: normalizeNomeGiocatore(v.Nome),
        ruolo: v.Ruolo,
      })),
    )

    await Promise.all(
      votiGiocatori.map(async (votoGiocatore) => {
        const idGiocatore = giocatori.find(
          (g) =>
            g !== null &&
            (g.id_pf === votoGiocatore.id_pf ||
              g.nome.toLowerCase() === votoGiocatore.Nome.toLowerCase()),
        )?.idGiocatore

        if (idGiocatore && (await findLastTrasferimento(trx, idGiocatore)) === null) {
          const squadraSerieA = await findSquadraSerieA(trx, votoGiocatore.Squadra)
          if (squadraSerieA !== null) {
            await createTrasferimento(
              trx,
              idGiocatore,
              squadraSerieA.idSquadraSerieA,
              squadraSerieA.nome,
            )
          }
        }

        const bonusData = calcBonusVoto(votoGiocatore, Configurazione)
        const votoSave = trx.create(Voti, bonusData)

        const criteria = {
          idGiocatore: idGiocatore,
          idCalendario: idCalendario,
        }
        const isExists = await trx.exists(Voti, { where: criteria })

        const votoData = _.omit(votoSave, ['idCalendario', 'idGiocatore'])

        if (isExists) {
          await trx.update(Voti, criteria, votoData)
        } else {
          await trx.insert(Voti, {
            idCalendario: idCalendario,
            idGiocatore: idGiocatore,
            ...votoData,
          })
        }
      }),
    )
  })
}

async function checkFormazioni(idCalendario: number): Promise<void> {
  const calendario = await Calendario.findOneOrFail({
    select: {
      idCalendario: true,
      giornata: true,
      giornataSerieA: true,
      Partite: {
        idPartita: true,
        Formazioni: {
          idFormazione: true,
        },
      },
    },
    relations: {
      Partite: {
        Formazioni: true,
      },
    },
    where: { idCalendario: idCalendario },
  })

  const partiteSenzaFormazioni = calendario.Partite.filter(
    (p) => p.Formazioni.length !== 2,
  )
  // if (partiteSenzaFormazioni.length > 0) {
  //   console.error(`Giornata ${calendario.giornata} (serie A: ${calendario.giornataSerieA}) - Partite senza formazioni:`, partiteSenzaFormazioni.map((p) => p.idPartita))
  //   throw new Error(
  //     `Non tutte le partite della giornata ${calendario.giornata} (serie A: ${calendario.giornataSerieA}) hanno formazioni inserite.`,
  //   )
  // }
}

async function findAndCreateGiocatori(
  trx: EntityManager,
  players: { id_pf: number | null; nome: string; ruolo: string }[],
): Promise<GiocatoreInfo[]> {
  const pfIds = players
    .map((p) => p.id_pf)
    .filter((id): id is number => id !== null)

    console.log('PfIds da cercare:', pfIds)

  // 1️⃣ Trova giocatori esistenti per id_pf
  const giocatori: GiocatoreInfo[] = await trx.find(Giocatori, {
    select: {
      idGiocatore: true,
      id_pf: true,
      nome: true,
    },
    where: {
      id_pf: In(pfIds),
    },
  })

  console.dir(giocatori, { depth: null })

  // 2️⃣ Filtra solo i giocatori non ancora in DB
  const newPlayers = players.filter((p) => {
    return !giocatori.some(
      (g) => (g.id_pf && g.id_pf === p.id_pf) || g.nome === p.nome,
    )
  })

  console.log('Giocatori da creare:', newPlayers)

  // 3️⃣ Crea i nuovi giocatori
  if (newPlayers.length > 0) {
    const created = await createGiocatori(trx, newPlayers)
    giocatori.push(...created)
  }

  return giocatori.filter((g) => g.idGiocatore !== 0)
}

async function createGiocatori(
  trx: EntityManager,
  giocatori: { id_pf: number | null; nome: string; ruolo: string }[],
) {
  const result = await trx.insert(
    Giocatori,
    giocatori.map((g) => ({
      id_pf: g.id_pf,
      nome: g.nome,
      nomeFantaGazzetta: null,
      ruolo: g.ruolo,
    })),
  )

  return result.identifiers.map((id, i) => ({
    idGiocatore: id.idGiocatore as number,
    id_pf: giocatori[i]!.id_pf,
    nome: giocatori[i]!.nome,
  }))
}

async function findLastTrasferimento(trx: EntityManager, idGiocatore: number) {
  const trasferimento = await trx.findOne(Trasferimenti, {
    where: {
      idGiocatore: idGiocatore,
      stagione: Configurazione.stagione,
    },
    order: {
      dataAcquisto: 'desc',
    },
  })
  return trasferimento
}

async function findSquadraSerieA(trx: EntityManager, nome: string) {
  const results =
    (await trx.find(SquadreSerieA, {
      where: {
        nome: _.capitalize(nome),
      },
    })) ?? []
  return results[0] ?? null
}

async function createTrasferimento(
  trx: EntityManager,
  idGiocatore: number,
  idSquadraSerieA: number,
  nomeSquadraSerieA: string,
) {
  await trx.insert(Trasferimenti, {
    idGiocatore: idGiocatore,
    costo: 0,
    idSquadraSerieA: idSquadraSerieA,
    stagione: Configurazione.stagione,
    nomeSquadraSerieA: nomeSquadraSerieA,
  })
}
