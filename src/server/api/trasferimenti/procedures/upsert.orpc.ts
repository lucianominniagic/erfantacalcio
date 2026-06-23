import { z } from 'zod'
import { adminProcedure } from '~/server/orpc'
import { chiudiTrasferimentoGiocatore } from '~/server/api/trasferimenti/services/trasferimentoService'
import { Configurazione } from '~/config'
import { toUtcDate } from '~/utils/dateUtils'
import { AppDataSource } from '~/data-source'
import { SquadreSerieA, Trasferimenti, Utenti } from '~/server/db/entities'

export const upsertTrasferimentoORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/trasferimenti/upsert', summary: 'Crea o aggiorna trasferimento' })
  .input(
    z.object({
      idTrasferimento: z.number(),
      idGiocatore: z.number(),
      idSquadraSerieA: z.number().optional().nullable(),
      idSquadra: z.number().optional().nullable(),
      costo: z.number(),
      dataAcquisto: z.date().optional(),
      dataCessione: z.date().optional().nullable(),
    }),
  )
  .handler(async ({ input }) => {
    try {
      let idTrasferimento = input.idTrasferimento

      await AppDataSource.transaction(async (trx) => {
        const squadra = await trx.findOne(Utenti, {
          select: { nomeSquadra: true },
          where: { idUtente: input.idSquadra ?? -1 },
        })
        const squadraSerieA = await trx.findOne(SquadreSerieA, {
          select: { nome: true },
          where: { idSquadraSerieA: input.idSquadraSerieA ?? -1 },
        })

        if (input.idTrasferimento === 0) {
          await chiudiTrasferimentoGiocatore(trx, input.idGiocatore, false)
        }

        const isExists = await trx.exists(Trasferimenti, {
          where: { idTrasferimento: input.idTrasferimento },
        })

        if (isExists) {
          await trx.update(
            Trasferimenti,
            { idTrasferimento: idTrasferimento },
            {
              idSquadraSerieA: input.idSquadraSerieA ?? null,
              idSquadra: input.idSquadra ?? null,
              costo: input.costo,
              dataAcquisto: input.dataAcquisto,
              stagione: Configurazione.stagione,
              hasRitirato: false,
              nomeSquadra: squadra?.nomeSquadra,
              nomeSquadraSerieA: squadraSerieA?.nome,
              dataCessione: input.dataCessione,
            },
          )
        } else {
          idTrasferimento = (
            await trx.insert(Trasferimenti, {
              idGiocatore: input.idGiocatore,
              idSquadraSerieA: input.idSquadraSerieA ?? null,
              idSquadra: input.idSquadra ?? null,
              costo: input.costo,
              dataAcquisto: toUtcDate(new Date()),
              dataCessione: null,
              stagione: Configurazione.stagione,
              hasRitirato: false,
            })
          ).identifiers[0].idTrasferimento
        }
      })
      return idTrasferimento
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
