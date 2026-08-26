import { z } from 'zod'
import { adminProcedure } from '~/server/orpc'
import { uploadVotoGiocatoreSchema } from '~/schemas/giocatore'
import { processVotiChunk } from '../services/importaVotiService'

export const importaVotiProcessChunkORPCProcedure = adminProcedure
  .route({
    method: 'POST',
    path: '/voti/importaVotiProcessChunk',
    summary:
      'Importa voti CSV — step 2/3: upsert di un chunk di voti (giocatori + auto-trasferimento + bonus/malus). Da richiamare ripetutamente finché tutti i voti non sono processati.',
  })
  .input(
    z.object({
      idCalendario: z.number(),
      voti: z.array(uploadVotoGiocatoreSchema),
    }),
  )
  .output(z.object({ processed: z.number() }))
  .handler(async ({ input }) => {
    return await processVotiChunk(input.voti, input.idCalendario)
  })
