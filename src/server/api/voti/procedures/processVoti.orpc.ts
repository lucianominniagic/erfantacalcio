import { adminProcedure } from '~/server/orpc'
import { processVotiInputSchema } from '~/schemas/voti'
import { caricaVoti } from '~/server/services/caricaVotiService'

export const processVotiORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/voti/processVoti', summary: 'Processa e salva i voti di una giornata (admin)' })
  .input(processVotiInputSchema)
  .handler(async ({ input }) => {
    try {
      console.log(`Processing ${input.votiGiocatori.length} giocatori`)
      await caricaVoti(input.votiGiocatori, input.idCalendario)
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
