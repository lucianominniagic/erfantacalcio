import { adminProcedure } from '~/server/orpc'
import { Configurazione } from '~/config'
import {
  checkVotiUltimaGiornata,
  checkVerificaPartiteGiocate,
  updateFase,
} from '../services/helpers'
import { toUtcDate } from '~/utils/dateUtils'
import { AppDataSource } from '~/data-source'
import {
  Classifiche,
  Formazioni,
  Partite,
  Voti,
  Calendario,
  ProposteMercato,
  SessioniMercato,
} from '~/server/db/entities'
import { messageSchema } from '~/schemas/messageSchema'

export const preparaStagioneORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/nuovastagione/preparaStagione', summary: 'Azzera i dati della stagione precedente per preparare la nuova' })
  .output(messageSchema)
  .handler(async () => {
    const message = {
      isError: false,
      isComplete: true,
      message: `Azzeramento dati della scorsa stagione ${Configurazione.stagione}`,
    }
    try {
      if ((await checkVotiUltimaGiornata()) === false) {
        console.warn(
          'Impossibile preparare la nuova stagione, calendario non completato',
        )
        return {
          isError: true,
          isComplete: true,
          message:
            'Impossibile preparare la nuova stagione, calendario non completato',
        }
      } else if ((await checkVerificaPartiteGiocate()) === false) {
        console.warn(
          'Impossibile preparare la nuova stagione: ci sono ancora partite da giocare',
        )
        return {
          isError: true,
          isComplete: true,
          message:
            'Impossibile preparare la nuova stagione: ci sono ancora partite da giocare',
        }
      } else {
        await AppDataSource.transaction(async (trx) => {
          trx.deleteAll(Classifiche)
          trx.deleteAll(Voti)
          trx.deleteAll(Formazioni)
          trx.deleteAll(Partite)
          trx.update(
            Calendario,
            {},
            {
              hasGiocata: false,
              data: toUtcDate(new Date()),
              dataFine: toUtcDate(new Date()),
            },
          )

          await updateFase(trx, 2)
        })

        // Cleanup dati mercato della stagione precedente
        await ProposteMercato.delete({})
        await SessioniMercato.delete({})

        console.info(
          `Azzeramento dati della scorsa stagione ${Configurazione.stagione}`,
        )
        return message
      }
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
