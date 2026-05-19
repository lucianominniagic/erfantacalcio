import { adminProcedure } from '../../trpc'
import { processVotiInputSchema } from '~/schemas/voti'
import { caricaVoti } from '~/server/services/caricaVotiService'

export const processVotiProcedure = adminProcedure
  .input(processVotiInputSchema)
  .mutation(async (opts) => {
    try {
      console.log(`Processing ${opts.input.votiGiocatori.length} giocatori`)
      await caricaVoti(opts.input.votiGiocatori, opts.input.idCalendario)
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
