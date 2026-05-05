import { adminProcedure } from '~/server/api/trpc'
import { chiudiTrasferimentoGiocatore } from '../../../utils/common'
import { AppDataSource } from '~/data-source'

export const chiudiTrasferimentoProcedure = adminProcedure
  .input((val: unknown) => Number(val))
  .mutation(async (opts) => {
    const idGiocatore = +opts.input
    return await chiudiTrasferimentoGiocatore(
      AppDataSource.manager,
      idGiocatore,
      false,
    )
  })
