import { z } from 'zod'
import { adminProcedure } from '~/server/orpc'
import { uploadFile } from '~/utils/blobVercelUtils'

export const uploadVotiVercelORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/voti/uploadVercel', summary: 'Carica un file voti su Vercel Blob (admin)' })
  .input(
    z.object({
      idCalendario: z.number(),
      fileName: z.string(),
      fileData: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    try {
      const { fileName, fileData } = input
      const blob = await uploadFile(fileData, fileName, 'voti')
      console.info('file blob: ', blob)
      console.info(`Il file ${blob.url} è stato completamente salvato.`)
      return blob.url
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
