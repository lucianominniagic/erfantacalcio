import { adminProcedure } from '../../trpc'
import { z } from 'zod'
import { uploadFile } from '~/utils/blobVercelUtils'

export const uploadVotiVercelProcedure = adminProcedure
  .input(
    z.object({
      idCalendario: z.number(),
      fileName: z.string(),
      fileData: z.string(),
    }),
  )
  .mutation(async (opts) => {
    try {
      const { fileName, fileData } = opts.input
      const blob = await uploadFile(fileData, fileName, 'voti')
      console.info('file blob: ', blob)
      console.info(`Il file ${blob.url} è stato completamente salvato.`)
      return blob.url
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
