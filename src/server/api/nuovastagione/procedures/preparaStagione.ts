import { adminProcedure } from '~/server/api/trpc'
import { Configurazione } from '~/config'
import { messageSchema } from '~/schemas/messageSchema'
import { checkVotiUltimaGiornata, checkVerificaPartiteGiocate, updateFase } from '../services/helpers'
import { toUtcDate } from '~/utils/dateUtils'
import { z } from 'zod'
import { AppDataSource } from '~/data-source'
import { Classifiche, Formazioni, Partite, Voti, Calendario } from '~/server/db/entities'

export const preparaStagioneProcedure = adminProcedure.mutation<z.infer<typeof messageSchema>>(async () => {
  let message = { isError: false, isComplete: true, message: `Azzeramento dati della scorsa stagione ${Configurazione.stagione}` }
  try {
    if ((await checkVotiUltimaGiornata()) === false) {
      console.warn('Impossibile preparare la nuova stagione, calendario non completato')
      return { isError: true, isComplete: true, message: 'Impossibile preparare la nuova stagione, calendario non completato' }
    } else if ((await checkVerificaPartiteGiocate()) === false) {
      console.warn('Impossibile preparare la nuova stagione: ci sono ancora partite da giocare')
      return { isError: true, isComplete: true, message: 'Impossibile preparare la nuova stagione: ci sono ancora partite da giocare' }
    } else {

      await AppDataSource.transaction(async (trx) => {
        trx.deleteAll(Classifiche)
        trx.deleteAll(Voti)
        trx.deleteAll(Formazioni)
        trx.deleteAll(Partite)
        trx.update(Calendario, {}, {
          hasGiocata: false,
          data: toUtcDate(new Date()),
          dataFine: toUtcDate(new Date()),
        })

        await updateFase(trx, 2)
      })

      console.info(`Azzeramento dati della scorsa stagione ${Configurazione.stagione}`)
      return message
    }
  } catch (error) {
    console.error('Si è verificato un errore', error)
    throw error
  }
})
