/**
 * scriviFormazione — logica transazionale di scrittura DB per la formazione.
 *
 * Responsabilità:
 *  1. Elimina voti e formazioni esistenti per la coppia idPartita + idSquadra
 *  2. Inserisce la nuova formazione
 *  3. Inserisce i voti per ogni giocatore (voto = 0)
 *
 * Non fa: non carica la Partita, non invia mail, non gestisce routing to/cc.
 */

import { In } from 'typeorm'

import { AppDataSource } from '~/data-source'
import { Formazioni, Voti } from '~/server/db/entities'
import {
  buildFormazioneInsertData,
  buildVotiInsertData,
  type GiocatoreInput,
} from '~/server/services/formazioneService'
import { nowInItalyIso } from '~/utils/dateUtils'

export type { GiocatoreInput }

export interface ScriviFormazioneInput {
  idPartita: number
  idSquadra: number
  idCalendario: number
  modulo: string
  giocatori: GiocatoreInput[]
}

export async function scriviFormazione(
  input: ScriviFormazioneInput,
): Promise<void> {
  const { idPartita, idSquadra, idCalendario, modulo, giocatori } = input

  await AppDataSource.transaction(async (trx) => {
    // 1. Trova le formazioni esistenti per idPartita + idSquadra
    const formazioniEsistenti = await trx.find(Formazioni, {
      select: { idFormazione: true },
      where: { idPartita, idSquadra },
    })

    // 2. Elimina i voti associati a quelle formazioni
    if (formazioniEsistenti.length > 0) {
      await trx.delete(Voti, {
        idFormazione: In(formazioniEsistenti.map((f) => f.idFormazione)),
      })
      console.log(
        `[scriviFormazione] Eliminati voti per idPartita:${idPartita} idSquadra:${idSquadra}`,
      )
    }

    // 3. Elimina le formazioni esistenti
    await trx.delete(Formazioni, { idPartita, idSquadra })
    console.log(
      `[scriviFormazione] Eliminate formazioni per idPartita:${idPartita} idSquadra:${idSquadra}`,
    )

    // 4. Inserisce la nuova formazione (hasBloccata: false, dataOra: now)
    const dataOra = nowInItalyIso()
    const formazioneResult = await trx.insert(
      Formazioni,
      buildFormazioneInsertData(idPartita, idSquadra, modulo, dataOra),
    )
    const idFormazione = formazioneResult.identifiers[0].idFormazione as number
    console.log(
      `[scriviFormazione] Nuova formazione creata: ${idFormazione} per idPartita:${idPartita} idSquadra:${idSquadra}`,
    )

    // 5. Inserisce i voti per ogni giocatore (voto = 0)
    await Promise.all(
      buildVotiInsertData(giocatori, idFormazione, idCalendario).map(
        async (votoData) => {
          await trx.insert(Voti, votoData)
        },
      ),
    )
    console.log(
      `[scriviFormazione] Inseriti ${giocatori.length} giocatori in tabella voti con idFormazione:${idFormazione}`,
    )
  })
}
