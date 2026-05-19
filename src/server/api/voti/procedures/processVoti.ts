import { z } from 'zod'
import { adminProcedure } from '../../trpc'
import { uploadVotoGiocatoreSchema } from '~/schemas/giocatore'
import { caricaVoti } from '~/server/services/caricaVotiService'

export const processVotiProcedure = adminProcedure
  .input(
    z.object({
      idCalendario: z.number(),
      votiGiocatori: z.array(uploadVotoGiocatoreSchema),
    }),
  )
  .mutation(async (opts) => {
    try {
      console.log(`Processing ${opts.input.votiGiocatori.length} giocatori`)
      await caricaVoti(opts.input.votiGiocatori, opts.input.idCalendario)
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
