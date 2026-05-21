import { z } from 'zod'
import { adminProcedure } from '~/server/orpc'
import { uploadFile } from '~/utils/blobVercelUtils'

export const uploadVercelORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/voti/uploadVercel', summary: 'Upload file voti su Vercel Blob' })
  .input(
    z.object({
      idCalendario: z.number(),
      fileName: z.string(),
      fileData: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    const { fileName, fileData } = input
    const blob = await uploadFile(fileData, fileName, 'voti')
    console.info('file blob: ', blob)
    console.info(`Il file ${blob.url} è stato completamente salvato.`)
    return blob.url
  })
