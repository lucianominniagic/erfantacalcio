import { z } from 'zod'
import { adminProcedure } from '~/server/orpc'
import { Calendario } from '~/server/db/entities'

export const updateCalendarioORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/calendario/update', summary: 'Aggiorna un elemento del calendario (admin)' })
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
  .handler(async ({ input }) => {
    try {
      await Calendario.update(
        { idCalendario: input.id },
        {
          idTorneo: input.idTorneo,
          giornata: input.giornata,
          giornataSerieA: input.giornataSerieA,
          girone: input.girone,
          hasDaRecuperare: input.isRecupero,
          hasSovrapposta: input.isSovrapposta,
          hasGiocata: input.isGiocata,
          data: input.data,
          dataFine: input.dataFine,
        },
      )
      return input.id
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
