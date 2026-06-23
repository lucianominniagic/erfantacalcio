import { z } from 'zod'
import { adminProcedure } from '~/server/orpc'
import { deleteGiocatore, deleteVotiGiocatore } from '~/server/api/giocatori/services/giocatoriRepository'
import { AppDataSource } from '~/data-source'
import { Trasferimenti } from '~/server/db/entities'

export const deleteTrasferimentoORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/trasferimenti/delete', summary: 'Elimina trasferimento' })
  .input(z.number())
  .handler(async ({ input }) => {
    const idtrasferimento = +input
    try {
      AppDataSource.transaction(async (trx) => {
        const trasferimento = await trx.findOneOrFail(Trasferimenti, {
          select: { idGiocatore: true },
          where: { idTrasferimento: idtrasferimento },
        })
        await trx.delete(Trasferimenti, {
          where: { idTrasferimento: idtrasferimento },
        })
        const count = await trx.count(Trasferimenti, {
          where: { idGiocatore: trasferimento.idGiocatore },
        })
        if (count === 0) {
          await deleteVotiGiocatore(trx, trasferimento.idGiocatore)
          await deleteGiocatore(trx, trasferimento.idGiocatore)
        }
        return idtrasferimento ?? null
      })
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
