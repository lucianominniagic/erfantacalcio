import { adminProcedure } from '~/server/orpc'
import { updateFase } from '../services/helpers'
import { AppDataSource } from '~/data-source'
import { Utenti } from '~/server/db/entities'
import { Configurazione } from '~/config'
import { messageSchema } from '~/schemas/messageSchema'

function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export const preparaIdSquadreORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/nuovastagione/preparaIdSquadre', summary: 'Sorteggia i nuovi ID squadra per la stagione' })
  .output(messageSchema)
  .handler(async () => {
    try {
      await AppDataSource.transaction(async (trx) => {
        const utenti = await trx.find(Utenti, {
          order: { idUtente: 'asc' },
        })

        if (utenti.length === 0) {
          throw new Error('Nessun utente da sorteggiare')
        }

        const shuffledData = shuffle(utenti)
        console.info(
          'sorteggio nuove squadre:',
          utenti.map((u, i) => `id ${u.idUtente} -> ${shuffledData[i].presidente}`),
        )

        for (let i = 0; i < utenti.length; i++) {
          const targetId = utenti[i].idUtente
          const source = shuffledData[i]

          await trx.update(
            Utenti,
            { idUtente: targetId },
            {
              username: source.username,
              pwd: source.pwd,
              adminLevel: source.adminLevel,
              lockLevel: source.lockLevel,
              presidente: source.presidente,
              mail: source.mail,
              nomeSquadra: source.nomeSquadra,
              foto: source.foto,
              maglia: source.maglia,
              Campionato: source.Campionato,
              Champions: source.Champions,
              Secondo: source.Secondo,
              Terzo: source.Terzo,
              importoBase: Configurazione.importoQuotaAnnuale,
              importoMulte: 0,
              importoMercato: 0,
              fantaMilioni: 600,
            },
          )
          console.info(
            `aggiornato utente id=${targetId} con dati di ${source.presidente}`,
          )
        }

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
