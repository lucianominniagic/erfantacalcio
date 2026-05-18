import { z } from 'zod'
import { adminProcedure } from '../../trpc'
import { normalizeNomeGiocatore } from '~/utils/helper'
import { Configurazione } from '~/config'
import _ from 'lodash'
import { uploadVotoGiocatoreSchema } from '~/schemas/giocatore'
import { EntityManager, In } from 'typeorm'
import {
  Calendario,
  Giocatori,
  SquadreSerieA,
  Trasferimenti,
  Voti,
} from '~/server/db/entities'
import { AppDataSource } from '~/data-source'

export const processVotiProcedure = adminProcedure
  .input(
    z.object({
      idCalendario: z.number(),
      votiGiocatori: z.array(uploadVotoGiocatoreSchema),
    }),
  )
  .mutation(async (opts) => {
    try {
      console.log(`Processing ${opts.input.votiGiocatori.length} giocatori`)
      console.log(`Processing ${opts.input.votiGiocatori} giocatori`)

      const checkFormazioniResult = await checkFormazioni(
        opts.input.idCalendario,
      )
      if (checkFormazioniResult.success === false) {
        throw new Error(checkFormazioniResult.message)
      }

      await AppDataSource.transaction(async (trx) => {
        const giocatori = await findAndCreateGiocatori(
          trx,
          opts.input.votiGiocatori.map((v) => ({
            id_pf: v.id_pf,
            nome: normalizeNomeGiocatore(v.Nome),
            ruolo: v.Ruolo,
          })),
        )

        await Promise.all(
          opts.input.votiGiocatori.map(async (votoGiocatore) => {
            console.log(
              `Processing voto for player: ${votoGiocatore.Nome} ${votoGiocatore.Squadra} ${votoGiocatore.Voto} (id_pf: ${votoGiocatore.id_pf})`,
            )
            const idGiocatore =
              giocatori.find(
                (g) =>
                  g !== null &&
                  (g.id_pf === votoGiocatore.id_pf ||
                    g.nome.toLowerCase() === votoGiocatore.Nome.toLowerCase()),
              )?.idGiocatore

            if (idGiocatore && (await findLastTrasferimento(trx, idGiocatore)) === null) {
              console.log(
                `No trasferimento found for player id: ${idGiocatore}, creating one...`,
              )
              const squadraSerieA = await findSquadraSerieA(
                trx,
                votoGiocatore.Squadra,
              )
              if (squadraSerieA !== null) {
                await createTrasferimento(
                  trx,
                  idGiocatore,
                  squadraSerieA.idSquadraSerieA,
                  squadraSerieA.nome,
                )
              }
            }

            // Upsert con update e create uguali
            const votoSave = trx.create(Voti, {
              voto: votoGiocatore.Voto ?? 0,
              ammonizione:
                votoGiocatore.Ammonizione === 1
                  ? Configurazione.bonusAmmonizione
                  : 0,
              espulsione:
                votoGiocatore.Espulsione === 1
                  ? Configurazione.bonusEspulsione
                  : 0,
              gol:
                votoGiocatore.Ruolo === 'P'
                  ? votoGiocatore.GolSubiti * Configurazione.bonusGolSubito
                  : votoGiocatore.GolSegnati * Configurazione.bonusGol,
              assist: votoGiocatore.Assist * Configurazione.bonusAssist,
              autogol: votoGiocatore.Autogol * Configurazione.bonusAutogol,
              altriBonus:
                (votoGiocatore.RigoriParati ?? 0) *
                  Configurazione.bonusRigoreParato +
                (votoGiocatore.RigoriErrati ?? 0) *
                  Configurazione.bonusRigoreSbagliato,
            })

            const criteria = {
              idGiocatore: idGiocatore,
              idCalendario: opts.input.idCalendario,
            }
            const isExists = await trx.exists(Voti, {
              where: criteria,
            })

            // remove id fields from the data to avoid specifying them twice when spreading
            const votoData = _.omit(votoSave, ['idCalendario', 'idGiocatore'])

            if (isExists) {
              await trx.update(Voti, criteria, votoData)
            } else {
              await trx.insert(Voti, {
                idCalendario: opts.input.idCalendario,
                idGiocatore: idGiocatore,
                ...votoData,
              })
            }
            console.log(`Processed voto for player: ${votoGiocatore.Nome}`)
          
            
          }),
        )

        console.log(`Process voti successfull completed`)
      })
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })

async function findAndCreateGiocatori(
  trx: EntityManager,
  players: { id_pf: number | null; nome: string; ruolo: string }[],
) {
  try {
    // 1️⃣ Trova giocatori esistenti per id_pf
    const giocatoriWithPfId = await trx.find(Giocatori, {
      select: {
        idGiocatore: true,
        id_pf: true,
        nome: true,
      },
      where: {
        id_pf: In(
          players.map((p) => p.id_pf).filter((id): id is number => id !== null),
        ),
      },
    })

    // 2️⃣ Trova giocatori esistenti per nome
    const giocatoriWithNome = await trx.find(Giocatori, {
      select: {
        idGiocatore: true,
        id_pf: true,
        nome: true,
      },
      where: {
        nome: In(players.map((p) => p.nome)),
      },
    })

    // 3️⃣ Unisci per nome o id_pf
    const giocatori = _.uniqBy(
      [...giocatoriWithPfId, ...giocatoriWithNome],
      (g) => `${g.id_pf ?? ''}_${g.nome}`,
    )

    console.log(
      'Giocatori trovati:',
      giocatori.map((g) => ({
        nome: g.nome,
        id_pf: g.id_pf,
        id_giocatore: g.idGiocatore,
      })),
    )

    // 4️⃣ Aggiorna eventuali id_pf mancanti
    await Promise.all(
      giocatori
        .filter((g) => g && g.id_pf)
        .map(async (g) => {
          await trx.update(
            Giocatori,
            { idGiocatore: g.idGiocatore },
            { id_pf: g.id_pf },
          )
        }),
    )

    // 5️⃣ Filtra solo i giocatori non ancora in DB
    const newPlayers = players.filter((p) => {
      const match = giocatori.some(
        (g) => (g.id_pf && g.id_pf === p.id_pf) || g.nome === p.nome,
      )
      return !match
    })

    console.log('Nuovi giocatori da creare:', newPlayers)

    // 6️⃣ Crea i nuovi giocatori
    if (newPlayers.length > 0) {
      const created = await createGiocatori(trx, newPlayers)
      console.log('Giocatori creati:', created)
      giocatori.push(...created)
    }

    return giocatori.filter((g) => g.idGiocatore !== 0)
  } catch (error) {
    console.error('Si è verificato un errore', error)
    throw error
  }
}

async function createGiocatori(
  trx: EntityManager,
  giocatori: { id_pf: number | null; nome: string; ruolo: string }[],
) {
  try {
    const result = await trx.insert(
      Giocatori,
      giocatori.map((g) => ({
        id_pf: g.id_pf,
        nome: g.nome,
        nomeFantaGazzetta: null,
        ruolo: g.ruolo,
      })),
    )

    // console.log(`${result.identifiers.length} nuovi giocatori inseriti`)

    const createdGiocatori = await trx.find(Giocatori, {
      select: {
        idGiocatore: true,
        id_pf: true,
        nome: true,
      },
      where: {
        nome: In(giocatori.map((g) => g.nome)),
      },
    })

    return createdGiocatori
  } catch (error) {
    console.error('Si è verificato un errore', error)
    throw error
  }
}

async function findLastTrasferimento(trx: EntityManager, idGiocatore: number) {
  try {
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
  } catch (error) {
    console.error('Si è verificato un errore:', idGiocatore, error)
    throw error
  }
}

async function findSquadraSerieA(trx: EntityManager, nome: string) {
  try {
    const squadra = await trx.findOne(SquadreSerieA, {
      where: {
        nome: _.capitalize(nome),
      },
    })
    return squadra
  } catch (error) {
    console.error('Si è verificato un errore', error)
    throw error
  }
}

async function createTrasferimento(
  trx: EntityManager,
  idGiocatore: number,
  idSquadraSerieA: number,
  nomeSquadraSerieA: string,
) {
  try {
    const trasferimento = await trx.insert(Trasferimenti, {
      idGiocatore: idGiocatore,
      costo: 0,
      idSquadraSerieA: idSquadraSerieA,
      stagione: Configurazione.stagione,
      nomeSquadraSerieA: nomeSquadraSerieA,
    })
    console.log('Inserito Trasferimento:', trasferimento.identifiers[0])
  } catch (error) {
    console.error('Si è verificato un errore in createTrasferimento:', {
      idGiocatore: idGiocatore,
      idsquadraSerieA: idSquadraSerieA,
      nomeSquadraSerieA: nomeSquadraSerieA,
      error: error,
    })
    throw error
  }
}

async function checkFormazioni(idCalendario: number) {
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

  console.log('numero partite:', calendario.Partite.length)
  console.log(
    'numero partite con formazioni:',
    calendario.Partite.filter((p) => p.Formazioni.length === 2).length,
  )
  if (
    calendario.Partite.length !==
    calendario.Partite.filter((p) => p.Formazioni.length === 2).length
  ) {
    const message = `Non tutte le partite della giornata ${calendario.giornata} (serie A: ${calendario.giornataSerieA}) hanno formazioni inserite.`
    console.warn(message)
    return {
      success: false,
      message: message,
    }
  }
  return {
    success: true,
    message: 'Tutte le partite hanno formazioni inserite.',
  }
}
