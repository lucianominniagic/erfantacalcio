/**
 * Giocatori repository — CRUD di base per i giocatori.
 *
 * Lettura, cancellazione voti e cancellazione giocatore,
 * usate da più procedure in domini diversi.
 */

import { getRuoloEsteso } from '~/utils/formazione'
import { Giocatori, Voti } from '~/server/db/entities'
import { type EntityManager } from 'typeorm'

export async function getGiocatoreById(idGiocatore: number) {
  const giocatore = await Giocatori.findOne({
    where: {
      idGiocatore: idGiocatore,
    },
  })

  if (giocatore) {
    return {
      idGiocatore: giocatore.idGiocatore,
      nome: giocatore.nome,
      nomeFantagazzetta: giocatore.nomeFantaGazzetta,
      ruolo: giocatore.ruolo,
      ruoloEsteso: getRuoloEsteso(giocatore.ruolo),
    }
  }
}

export async function deleteVotiGiocatore(
  trx: EntityManager,
  idGiocatore: number,
) {
  try {
    await trx.delete(Voti, {
      idGiocatore: idGiocatore,
    })
  } catch (error) {
    console.error('Si è verificato un errore', error)
    throw error
  }
}

export async function deleteGiocatore(trx: EntityManager, idGiocatore: number) {
  try {
    await trx.delete(Giocatori, {
      idGiocatore: idGiocatore,
    })
  } catch (error) {
    console.error('Si è verificato un errore', error)
    throw error
  }
}
