import { adminProcedure } from '~/server/api/trpc'
import { z } from 'zod'
import { chiudiTrasferimentoGiocatore } from '../../../utils/common'
import { Configurazione } from '~/config'
import { toUtcDate } from '~/utils/dateUtils'
import { AppDataSource } from '~/data-source'
import { SquadreSerieA, Trasferimenti, Utenti } from '~/server/db/entities'

export const upsertTrasferimentoProcedure = adminProcedure
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
  .mutation(async (opts) => {
    try {
      let idTrasferimento = opts.input.idTrasferimento

      await AppDataSource.transaction(async (trx) => {
        const squadra = await trx.findOne(Utenti, {
          select: { nomeSquadra: true },
          where: { idUtente: opts.input.idSquadra ?? -1 },
        })
        const squadraSerieA = await trx.findOne(SquadreSerieA, {
          select: { nome: true },
          where: { idSquadraSerieA: opts.input.idSquadraSerieA ?? -1 },
        })

        if (opts.input.idTrasferimento === 0) {
          await chiudiTrasferimentoGiocatore(trx, opts.input.idGiocatore, false)
        }

        const isExists = await trx.exists(Trasferimenti, {
          where: { idTrasferimento: opts.input.idTrasferimento },
        })

        if (isExists) {
          await trx.update(
            Trasferimenti,
            { idTrasferimento: idTrasferimento },
            {
              idSquadraSerieA: opts.input.idSquadraSerieA ?? null,
              idSquadra: opts.input.idSquadra ?? null,
              costo: opts.input.costo,
              dataAcquisto: opts.input.dataAcquisto,
              stagione: Configurazione.stagione,
              hasRitirato: false,
              nomeSquadra: squadra?.nomeSquadra,
              nomeSquadraSerieA: squadraSerieA?.nome,
              dataCessione: opts.input.dataCessione,
            },
          )
        } else {
          idTrasferimento = (
            await trx.insert(Trasferimenti, {
              idGiocatore: opts.input.idGiocatore,
              idSquadraSerieA: opts.input.idSquadraSerieA ?? null,
              idSquadra: opts.input.idSquadra ?? null,
              costo: opts.input.costo,
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
