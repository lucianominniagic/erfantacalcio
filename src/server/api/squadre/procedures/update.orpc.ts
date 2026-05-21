import { z } from 'zod'
import { adminProcedure } from '~/server/orpc'
import { Utenti } from '~/server/db/entities'

export const updateSquadraORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/squadre/update', summary: 'Aggiorna dati squadra fantasy' })
  .input(
    z.object({
      id: z.number(),
      isAdmin: z.boolean(),
      isLockLevel: z.boolean(),
      presidente: z.string(),
      email: z.string(),
      squadra: z.string(),
      importoAnnuale: z.number(),
      importoMulte: z.number(),
      importoMercato: z.number(),
      fantamilioni: z.number(),
    }),
  )
  .handler(async ({ input }) => {
    try {
      await Utenti.update(
        { idUtente: input.id },
        {
          presidente: input.presidente,
          mail: input.email,
          nomeSquadra: input.squadra,
          importoBase: input.importoAnnuale,
          importoMulte: input.importoMulte,
          importoMercato: input.importoMercato,
          fantaMilioni: input.fantamilioni,
          adminLevel: input.isLockLevel ? true : input.isAdmin,
        },
      )
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
