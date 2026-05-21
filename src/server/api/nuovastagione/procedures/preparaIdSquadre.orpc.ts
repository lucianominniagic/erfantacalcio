import { adminProcedure } from '~/server/orpc'
import { generateUniqueRandomNumbers } from '~/utils/numberUtils'
import { updateFase } from '../services/helpers'
import { AppDataSource } from '~/data-source'
import { Utenti } from '~/server/db/entities'
import { MoreThan } from 'typeorm'
import { Configurazione } from '~/config'
import { messageSchema } from '~/schemas/messageSchema'

export const preparaIdSquadreORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/nuovastagione/preparaIdSquadre', summary: 'Sorteggia i nuovi ID squadra per la stagione' })
  .output(messageSchema)
  .handler(async () => {
    try {
      await AppDataSource.transaction(async (trx) => {
        const utenti = await trx.find(Utenti, {
          order: { idUtente: 'asc' },
        })
        const startNewId = 10

        const promises = utenti.map(async (utente) => {
          const newIdUtente = utente.idUtente + startNewId
          const username = utente.username + '_temp'

          trx.create(Utenti, {
            idUtente: newIdUtente,
            username: username,
            pwd: utente.pwd,
            adminLevel: utente.adminLevel,
            presidente: utente.presidente,
            mail: utente.mail,
            nomeSquadra: utente.nomeSquadra,
            foto: utente.foto,
            importoBase: Configurazione.importoQuotaAnnuale,
            importoMulte: 0,
            importoMercato: 0,
            fantaMilioni: 600,
            Campionato: utente.Campionato,
            Champions: utente.Champions,
            Secondo: utente.Secondo,
            Terzo: utente.Terzo,
            lockLevel: utente.lockLevel,
            maglia: utente.maglia,
          })
        })
        await Promise.all(promises)
        console.info('creati nuovi utenti temporanei')

        const uniqueRandomNumbers = generateUniqueRandomNumbers(
          startNewId + 1,
          startNewId + 8,
          8,
        )
        console.info('sorteggiati nuovi idutente', uniqueRandomNumbers)

        for (let i = 0; i <= 7; i++) {
          const user = await trx.findOne(Utenti, {
            where: { idUtente: uniqueRandomNumbers[i] },
          })
          await trx.update(
            Utenti,
            { idUtente: i + 1 },
            {
              username: `${user?.username.replace('_temp', '_new')}`,
              adminLevel: user?.adminLevel,
              lockLevel: user?.lockLevel,
              mail: user?.mail,
              nomeSquadra: user?.nomeSquadra,
              presidente: user?.presidente,
              foto: user?.foto,
              pwd: user?.pwd,
              Campionato: user?.Campionato,
              Champions: user?.Champions,
              fantaMilioni: user?.fantaMilioni,
              importoBase: user?.importoBase,
              importoMercato: user?.importoMercato,
              importoMulte: user?.importoMulte,
              Secondo: user?.Secondo,
              Terzo: user?.Terzo,
              maglia: user?.maglia,
            },
          )
          console.info(
            `aggiornato utente: ${i + 1} con utente estratto: ${uniqueRandomNumbers[i]}`,
          )
        }

        await trx.delete(Utenti, { idUtente: MoreThan(8) })
        console.info('eliminati utenti con idutente > 8')

        await trx
          .createQueryBuilder()
          .update(Utenti)
          .set({ username: () => "REPLACE(username, '_new', '')" })
          .execute()

        console.info('aggiornati usernames utenti')

        await updateFase(trx, 3)
      })
      return {
        isError: false,
        isComplete: true,
        message: 'Sorteggio nuove squadre completato',
      }
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
