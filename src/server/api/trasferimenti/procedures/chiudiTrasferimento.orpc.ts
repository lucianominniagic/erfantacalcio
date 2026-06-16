import { z } from 'zod'
import { adminProcedure } from '~/server/orpc'
import { chiudiTrasferimentoGiocatore } from '~/server/api/trasferimenti/services/trasferimentoService'
import { AppDataSource } from '~/data-source'

export const chiudiTrasferimentoORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/trasferimenti/chiudiTrasferimento', summary: 'Chiudi trasferimento giocatore' })
  .input(z.number())
  .handler(async ({ input }) => {
    const idGiocatore = +input
    return await chiudiTrasferimentoGiocatore(
      AppDataSource.manager,
      idGiocatore,
      false,
    )
  })
