import { adminProcedure } from '~/server/orpc'
import { Configurazione } from '~/config'
import { creaClassifica } from '../repositories/classificheRepository'
import { checkCountClassifiche, updateFase } from '../repositories/flowFaseRepository'
import { getTornei } from '~/server/api/tornei/repository'
import { AppDataSource } from '~/data-source'
import { messageSchema } from '~/schemas/messageSchema'

export const creaClassificheORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/nuovastagione/creaClassifiche', summary: 'Crea le classifiche per la nuova stagione' })
  .output(messageSchema)
  .handler(async () => {
    try {
      let message = {
        isError: true,
        isComplete: true,
        message:
          'Impossibile procedere con la nuova Stagione, classifiche già inserite',
      }

      await AppDataSource.transaction(async (trx) => {
        if ((await checkCountClassifiche()) === false) {
          console.warn(
            'Impossibile procedere con la nuova Stagione, classifiche già inserite',
          )
          message = {
            isError: true,
            isComplete: true,
            message:
              'Impossibile procedere con la nuova Stagione, classifiche già inserite',
          }
        } else {
          const tornei = await getTornei()

          let idTorneo = tornei.find(
            (c: { nome: string; gruppoFase?: string | null; idTorneo: number }) =>
              c.nome.toLowerCase() === 'campionato',
          )?.idTorneo
          if (!idTorneo)
            throw new Error("Nessun torneo trovato con il nome 'campionato'.")
          await creaClassifica(trx, idTorneo, 1, 8)

          idTorneo = tornei.find(
            (c: { nome: string; gruppoFase?: string | null; idTorneo: number }) =>
              c.nome.toLowerCase() === 'champions' &&
              c.gruppoFase?.toUpperCase() === 'A',
          )?.idTorneo
          if (!idTorneo)
            throw new Error(
              "Nessun torneo trovato con il nome 'champions' girone 'A'.",
            )
          await creaClassifica(trx, idTorneo, 1, 4)

          idTorneo = tornei.find(
            (c: { nome: string; gruppoFase?: string | null; idTorneo: number }) =>
              c.nome.toLowerCase() === 'champions' &&
              c.gruppoFase?.toUpperCase() === 'B',
          )?.idTorneo
          if (!idTorneo)
            throw new Error(
              "Nessun torneo trovato con il nome 'champions' e fase girone 'B'.",
            )
          await creaClassifica(trx, idTorneo, 5, 8)

          await updateFase(trx, 5)

          console.info(
            `Le classifiche della stagione ${Configurazione.stagione} sono state create`,
          )
          message = {
            isError: false,
            isComplete: true,
            message: `Le classifiche della stagione ${Configurazione.stagione} sono state create`,
          }
        }
      })
      return message
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
