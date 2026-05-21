import { z } from 'zod'
import { adminProcedure } from '~/server/orpc'
import { Configurazione } from '~/config'
import { Voti } from '~/server/db/entities'

export const updateVotoORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/voti/update', summary: 'Aggiorna i valori di un voto (admin)' })
  .input(
    z.object({
      idVoto: z.number(),
      ruolo: z.string(),
      voto: z.number(),
      ammonizione: z.number(),
      espulsione: z.number(),
      gol: z.number(),
      assist: z.number(),
      autogol: z.number(),
      altriBonus: z.number(),
    }),
  )
  .handler(async ({ input }) => {
    try {
      await Voti.update(
        {
          idVoto: input.idVoto,
        },
        {
          voto: input.voto,
          ammonizione: input.ammonizione,
          espulsione: input.espulsione,
          gol:
            input.ruolo === 'P'
              ? input.gol * Configurazione.bonusGolSubito
              : input.gol * Configurazione.bonusGol,
          assist: input.assist * Configurazione.bonusAssist,
          autogol: input.autogol * Configurazione.bonusAutogol,
          altriBonus: input.altriBonus,
        },
      )
      return input.idVoto
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
