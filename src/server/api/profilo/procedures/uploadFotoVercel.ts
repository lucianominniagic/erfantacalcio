import { uploadFile } from '~/utils/blobVercelUtils'
import { protectedProcedure } from '~/server/api/trpc'
import { uploadFotoVercelSchema } from '~/schemas/profilo'

export const uploadFotoVercelProcedure = protectedProcedure
  .input(uploadFotoVercelSchema)
  .mutation(async (opts) => {
    try {
      const { fileName, fileData } = opts.input
      const blob = await uploadFile(fileData, fileName, 'fotoprofili')
      console.info('file blob: ', blob)
      console.info(`Il file ${fileName} è stato completamente salvato.`)
      return blob.url
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
