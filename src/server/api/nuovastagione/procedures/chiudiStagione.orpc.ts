import { adminProcedure } from '~/server/orpc'
import { Configurazione } from '~/config'
import { chiudiTrasferimentoGiocatore } from '../../../utils/common'
import { checkVotiUltimaGiornata, updateFase } from '../services/helpers'
import { Trasferimenti } from '~/server/db/entities'
import { IsNull, Not } from 'typeorm'
import _ from 'lodash'
import { AppDataSource } from '~/data-source'
import { messageSchema } from '~/schemas/messageSchema'

export const chiudiStagioneORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/nuovastagione/chiudiStagione', summary: 'Chiudi la stagione corrente e liquida i trasferimenti aperti' })
  .output(messageSchema)
  .handler(async () => {
    try {
      const takeNum = 30
      let message = {
        isError: true,
        isComplete: true,
        message: 'Impossibile chiudere la stagione, calendario non completato',
      }
      await AppDataSource.transaction(async (trx) => {
        console.info(
          `Chiudo la stagione ${Configurazione.stagione} con un massimo di ${takeNum} giocatori in trasferimento`,
        )
        if ((await checkVotiUltimaGiornata()) === false) {
          console.warn(
            'Impossibile chiudere la stagione, calendario non completato',
          )
          message = {
            isError: true,
            isComplete: true,
            message:
              'Impossibile chiudere la stagione, calendario non completato',
          }
        } else {
          let giocatoritrasferimenti = await Trasferimenti.find({
            select: { idGiocatore: true },
            where: { dataCessione: IsNull(), stagione: Configurazione.stagione },
            take: takeNum,
          })
          giocatoritrasferimenti = _.uniqBy(giocatoritrasferimenti, 'idGiocatore')

          const countTrasferimenti = await Trasferimenti.count({
            where: { dataCessione: IsNull(), stagione: Configurazione.stagione },
          })
          console.info(
            `Trovati ${giocatoritrasferimenti.length} giocatori in trasferimento da chiudere`,
          )

          const promises = giocatoritrasferimenti.map(async (c) => {
            await chiudiTrasferimentoGiocatore(trx, c.idGiocatore, true)
          })
          await Promise.all(promises)

          if (giocatoritrasferimenti.length < takeNum) {
            await trx.delete(Trasferimenti, { idSquadra: Not(IsNull()), stagione: Configurazione.stagione })

            await updateFase(trx, 1)
            console.info(
              `Chiusura trasferimenti stagione ${Configurazione.stagione} completato`,
            )
            message = {
              isError: false,
              isComplete: true,
              message: `Chiusura trasferimenti stagione ${Configurazione.stagione} completato.`,
            }
          } else {
            console.info(
              `Chiusura trasferimenti stagione ${Configurazione.stagione} ancora incompleto.`,
            )
            message = {
              isError: false,
              isComplete: false,
              message: `Chiusura trasferimenti stagione ${Configurazione.stagione} ancora incompleto. CONTINUA A CHIUDERE I TRASFERIMENTI (mancanti: ${countTrasferimenti})`,
            }
          }
        }
      })
      return message
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
