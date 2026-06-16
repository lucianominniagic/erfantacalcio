import { z } from 'zod'
import { publicProcedure } from '~/server/orpc'
import { getGiocatoreById } from '~/server/api/giocatori/services/giocatoriRepository'

export const showGiocatoreORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/giocatori/get', summary: 'Dettaglio giocatore' })
  .input(z.object({ idGiocatore: z.number() }))
  .handler(async ({ input }) => {
    try {
      return await getGiocatoreById(+input.idGiocatore)
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
