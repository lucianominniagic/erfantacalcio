import { z } from 'zod'
import { adminProcedure } from '~/server/orpc'
import { deleteGiocatore, deleteVotiGiocatore } from '~/server/api/giocatori/services/giocatoriRepository'
import { Trasferimenti } from '~/server/db/entities'
import { AppDataSource } from '~/data-source'
import type { EntityManager } from 'typeorm'

async function deleteTrasferimentiGiocatore(
  trx: EntityManager,
  idGiocatore: number,
) {
  try {
    await trx.delete(Trasferimenti, { idGiocatore })
  } catch (error) {
    console.error('Si è verificato un errore', error)
    throw error
  }
}

export const removeGiocatoreORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/giocatori/delete', summary: 'Elimina giocatore' })
  .input(z.number())
  .handler(async ({ input }) => {
    const idGiocatore = +input

    try {
      AppDataSource.transaction(async (trx) => {
        await deleteVotiGiocatore(trx, idGiocatore)
        await deleteTrasferimentiGiocatore(trx, idGiocatore)
        await deleteGiocatore(trx, idGiocatore)
      })
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
