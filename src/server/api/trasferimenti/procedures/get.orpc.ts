import { z } from 'zod'
import { publicProcedure } from '~/server/orpc'
import { Trasferimenti } from '~/server/db/entities'

export const getTrasferimentoORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/trasferimenti/get', summary: 'Dettaglio trasferimento' })
  .input(z.object({ idTrasferimento: z.number() }))
  .handler(async ({ input }) => {
    const idTrasferimento = +input.idTrasferimento
    try {
      const result = await Trasferimenti.findOne({
        select: {
          idTrasferimento: true,
          idGiocatore: true,
          costo: true,
          dataAcquisto: true,
          dataCessione: true,
          idSquadraSerieA: true,
          idSquadra: true,
        },
        where: { idTrasferimento },
      })

      if (result) {
        return {
          idTrasferimento: result.idTrasferimento,
          idGiocatore: result.idGiocatore,
          idSquadra: result.idSquadra,
          idSquadraSerieA: result.idSquadraSerieA,
          costo: result.costo,
          dataAcquisto: result.dataAcquisto,
          dataCessione: result.dataCessione,
        }
      }
      console.warn(`Trasferimento giocatore ${idTrasferimento} non trovato`)
      return null
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
