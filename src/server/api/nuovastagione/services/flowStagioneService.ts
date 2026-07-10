/**
 * flowStagioneService — business logic per il ciclo di vita della stagione.
 *
 * Espone:
 *  - preparaNuovaStagione() — valida stato, azzera dati stagione precedente
 *  - chiudiStagione()       — chiude i trasferimenti aperti a fine stagione (paginato, 30 per volta)
 *
 * Nessuna dipendenza da contesto oRPC. Le procedure diventano thin wrappers.
 */

import _ from 'lodash'
import { IsNull, Not } from 'typeorm'
import { Configurazione } from '~/config'
import { AppDataSource } from '~/data-source'
import { toUtcDate } from '~/utils/dateUtils'
import {
  Calendario,
  Classifiche,
  Formazioni,
  Partite,
  ProposteMercato,
  SessioniMercato,
  Trasferimenti,
  Voti,
} from '~/server/db/entities'
import { chiudiTrasferimentoGiocatore } from '~/server/api/trasferimenti/services/trasferimentoService'
import {
  checkVotiUltimaGiornata,
  checkVerificaPartiteGiocate,
  updateFase,
} from '../repositories/flowFaseRepository'

// ─── Shared type ─────────────────────────────────────────────────────────────

interface StageMessage {
  isError: boolean
  isComplete: boolean
  message: string
}

// ─── Services ─────────────────────────────────────────────────────────────────

/**
 * Valida che la stagione corrente sia completata, poi azzera tutti i dati
 * (classifiche, voti, formazioni, partite, calendario) in un'unica transazione.
 * Pulizia mercato (proposte + sessioni) fuori transazione per non bloccarla.
 */
export async function preparaNuovaStagione(): Promise<StageMessage> {
  if (!(await checkVotiUltimaGiornata())) {
    console.warn('Impossibile preparare la nuova stagione, calendario non completato')
    return {
      isError: true,
      isComplete: true,
      message: 'Impossibile preparare la nuova stagione, calendario non completato',
    }
  }

  if (!(await checkVerificaPartiteGiocate())) {
    console.warn('Impossibile preparare la nuova stagione: ci sono ancora partite da giocare')
    return {
      isError: true,
      isComplete: true,
      message: 'Impossibile preparare la nuova stagione: ci sono ancora partite da giocare',
    }
  }

  await AppDataSource.transaction(async (trx) => {
    await trx.createQueryBuilder().delete().from(Classifiche).execute()
    await trx.createQueryBuilder().delete().from(Voti).execute()
    await trx.createQueryBuilder().delete().from(Formazioni).execute()
    await trx.createQueryBuilder().delete().from(Partite).execute()
    await trx
      .createQueryBuilder()
      .update(Calendario)
      .set({
        hasGiocata: false,
        data: toUtcDate(new Date()),
        dataFine: toUtcDate(new Date()),
      })
      .execute()

    await updateFase(trx, 2)
  })

  // Pulizia mercato fuori transazione (non critica per l'atomicità della stagione)
  await ProposteMercato.createQueryBuilder().delete().execute()
  await SessioniMercato.createQueryBuilder().delete().execute()

  console.info(`Azzeramento dati della scorsa stagione ${Configurazione.stagione}`)
  return {
    isError: false,
    isComplete: true,
    message: `Azzeramento dati della scorsa stagione ${Configurazione.stagione}`,
  }
}

/**
 * Chiude fino a 30 trasferimenti aperti per la stagione corrente.
 * Chiamare ripetutamente finché `isComplete === true`.
 */
export async function chiudiStagione(): Promise<StageMessage> {
  const takeNum = 10
  let message: StageMessage = {
    isError: true,
    isComplete: true,
    message: 'Impossibile chiudere la stagione, calendario non completato',
  }

  await AppDataSource.transaction(async (trx) => {
    console.info(
      `Chiudo la stagione ${Configurazione.stagione} con un massimo di ${takeNum} giocatori in trasferimento`,
    )

    if (!(await checkVotiUltimaGiornata())) {
      console.warn('Impossibile chiudere la stagione, calendario non completato')
      return
    }

    let giocatoriTrasferimenti = await Trasferimenti.find({
      select: { idGiocatore: true },
      where: { dataCessione: IsNull(), stagione: Configurazione.stagione },
      take: takeNum,
    })
    giocatoriTrasferimenti = _.uniqBy(giocatoriTrasferimenti, 'idGiocatore')

    const countTrasferimenti = await Trasferimenti.count({
      where: { dataCessione: IsNull(), stagione: Configurazione.stagione },
    })
    console.info(
      `Trovati ${giocatoriTrasferimenti.length} giocatori in trasferimento da chiudere`,
    )

    await Promise.all(
      giocatoriTrasferimenti.map((c) => chiudiTrasferimentoGiocatore(trx, c.idGiocatore, true)),
    )

    if (giocatoriTrasferimenti.length < takeNum) {
      await trx.delete(Trasferimenti, {
        idSquadra: Not(IsNull()),
        stagione: Configurazione.stagione,
      })
      await updateFase(trx, 1)
      console.info(`Chiusura trasferimenti stagione ${Configurazione.stagione} completato`)
      message = {
        isError: false,
        isComplete: true,
        message: `Chiusura trasferimenti stagione ${Configurazione.stagione} completato.`,
      }
    } else {
      console.info(`Chiusura trasferimenti stagione ${Configurazione.stagione} ancora incompleto.`)
      message = {
        isError: false,
        isComplete: false,
        message: `Chiusura trasferimenti stagione ${Configurazione.stagione} ancora incompleto. CONTINUA A CHIUDERE I TRASFERIMENTI (mancanti: ${countTrasferimenti})`,
      }
    }
  })

  return message
}
