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

        // Cleanup dati mercato della stagione precedente
        await ProposteMercato.createQueryBuilder().delete().execute()
        await SessioniMercato.createQueryBuilder().delete().execute()

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
