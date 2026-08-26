import { z } from 'zod'
import { adminProcedure } from '~/server/orpc'
import { refreshStatsRuolo } from '../services/importaVotiService'

export const importaVotiRefreshStatsORPCProcedure = adminProcedure
  .route({
    method: 'POST',
    path: '/voti/importaVotiRefreshStats',
    summary:
      'Importa voti CSV — step 3/3: refresh stored procedure statistiche per un ruolo (P/D/C/A). Da richiamare una volta per ciascun ruolo.',
  })
  .input(z.object({ ruolo: z.enum(['P', 'D', 'C', 'A']) }))
  .output(z.object({ ruolo: z.string() }))
  .handler(async ({ input }) => {
    return await refreshStatsRuolo(input.ruolo)
  })
