/**
 * classificheRepository — creazione classifiche per il flusso nuova stagione.
 */

import { Classifiche } from '~/server/db/entities'
import { type EntityManager } from 'typeorm'

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
