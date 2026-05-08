import { adminProcedure } from '~/server/api/trpc'
import { z } from 'zod'
import { Calendario } from '~/server/db/entities'

export const updateCalendarioProcedure = adminProcedure
  .input(
    z.object({
      id: z.number(),
      idTorneo: z.number(),
      giornata: z.number(),
      giornataSerieA: z.number(),
      girone: z.number().optional().nullable(),
      data: z.string().datetime().optional().nullable(),
      dataFine: z.string().datetime().optional().nullable(),
      isRecupero: z.boolean(),
      isSovrapposta: z.boolean(),
      isGiocata: z.boolean(),
    }),
  )
  .mutation(async (opts) => {
    try {
      await Calendario.update(
        { idCalendario: opts.input.id },
        {
          idTorneo: opts.input.idTorneo,
          giornata: opts.input.giornata,
          giornataSerieA: opts.input.giornataSerieA,
          girone: opts.input.girone,
          hasDaRecuperare: opts.input.isRecupero,
          hasSovrapposta: opts.input.isSovrapposta,
          hasGiocata: opts.input.isGiocata,
          data: opts.input.data,
          dataFine: opts.input.dataFine,
        },
      )
      return opts.input.id
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
