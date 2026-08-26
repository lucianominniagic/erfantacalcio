import { z } from 'zod'
import { adminProcedure } from '~/server/orpc'
import { uploadVotoGiocatoreSchema } from '~/schemas/giocatore'
import { initImportaVoti } from '../services/importaVotiService'

export const importaVotiInitORPCProcedure = adminProcedure
  .route({
    method: 'POST',
    path: '/voti/importaVotiInit',
    summary:
      'Importa voti CSV — step 1/3: upload su Blob, reset voti esistenti, parsing CSV. Restituisce i voti letti da processare in chunk.',
  })
  .input(
    z.object({
      idCalendario: z.number(),
      fileName: z.string(),
      fileData: z.string(),
    }),
  )
  .output(
    z.object({
      fileUrl: z.string(),
      voti: z.array(uploadVotoGiocatoreSchema),
    }),
  )
  .handler(async ({ input }) => {
    return await initImportaVoti(input)
  })
