import { adminProcedure } from '~/server/orpc'
import { Configurazione } from '~/config'
import { creaPartite, creaPartiteEmpty } from '../repositories/partiteRepository'
import { checkCountPartite, updateFase } from '../repositories/flowFaseRepository'
import { getTornei } from '~/server/api/tornei/repository'
import { AppDataSource } from '~/data-source'
import { messageSchema } from '~/schemas/messageSchema'

export const creaPartiteORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/nuovastagione/creaPartite', summary: 'Crea il calendario partite per la nuova stagione' })
  .output(messageSchema)
  .handler(async () => {
    try {
      if ((await checkCountPartite()) === false) {
        console.warn(
          'Impossibile procedere con la nuova Stagione, partite già inserite',
        )
        return {
          isError: true,
          isComplete: true,
          message:
            'Impossibile procedere con la nuova Stagione, partite già inserite',
        }
      } else {
        const tornei = await getTornei()

        await AppDataSource.transaction(async (trx) => {
          let idTorneo = tornei.find(
            (c: { nome: string; gruppoFase?: string | null; idTorneo: number }) =>
              c.nome.toLowerCase() === 'campionato',
          )?.idTorneo
          if (!idTorneo)
            throw new Error("Nessun torneo trovato con il nome 'campionato'.")
          await creaPartite(trx, 8, idTorneo, true)

          idTorneo = tornei.find(
            (c: { nome: string; gruppoFase?: string | null; idTorneo: number }) =>
              c.nome.toLowerCase() === 'champions' &&
              c.gruppoFase?.toUpperCase() === 'A',
          )?.idTorneo
          if (!idTorneo)
            throw new Error(
              "Nessun torneo trovato con il nome 'champions' girone 'A'.",
            )
          await creaPartite(trx, 4, idTorneo, false)

          idTorneo = tornei.find(
            (c: { nome: string; gruppoFase?: string | null; idTorneo: number }) =>
              c.nome.toLowerCase() === 'champions' &&
              c.gruppoFase?.toUpperCase() === 'B',
          )?.idTorneo
          if (!idTorneo)
            throw new Error(
              "Nessun torneo trovato con il nome 'champions' e fase girone 'B'.",
            )
          await creaPartite(trx, 4, idTorneo, false, 4)

          idTorneo = tornei.find(
            (c: { nome: string; gruppoFase?: string | null; idTorneo: number }) =>
              c.nome.toLowerCase() === 'champions' &&
              c.gruppoFase?.toLowerCase() === 'semifinali andata',
          )?.idTorneo
          if (!idTorneo)
            throw new Error(
              "Nessun torneo trovato con il nome 'champions' e fase 'semifinali andata'.",
            )
          await creaPartiteEmpty(trx, 2, idTorneo, true)

          idTorneo = tornei.find(
            (c: { nome: string; gruppoFase?: string | null; idTorneo: number }) =>
              c.nome.toLowerCase() === 'champions' &&
              c.gruppoFase?.toLowerCase() === 'semifinali ritorno',
          )?.idTorneo
          if (!idTorneo)
            throw new Error(
              "Nessun torneo trovato con il nome 'champions' e fase 'semifinali ritorno'.",
            )
          await creaPartiteEmpty(trx, 2, idTorneo, true)

          idTorneo = tornei.find(
            (c: { nome: string; gruppoFase?: string | null; idTorneo: number }) =>
              c.nome.toLowerCase() === 'champions' &&
              c.gruppoFase?.toLowerCase() === 'finale',
          )?.idTorneo
          if (!idTorneo)
            throw new Error(
              "Nessun torneo trovato con il nome 'champions' e fase 'finale'.",
            )
          await creaPartiteEmpty(trx, 1, idTorneo, false)

          await updateFase(trx, 4)

          console.info(
            `Le partite della stagione ${Configurazione.stagione} sono state create`,
          )
        })

        return {
          isError: false,
          isComplete: true,
          message: `Le partite della stagione ${Configurazione.stagione} sono state create`,
        }
      }
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
