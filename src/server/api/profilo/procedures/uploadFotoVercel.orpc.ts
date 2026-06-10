import { uploadFile } from '~/utils/blobVercelUtils'
import { protectedProcedure } from '~/server/orpc'
import { uploadFotoVercelSchema } from '~/schemas/profilo'

export const uploadFotoVercelORPCProcedure = protectedProcedure
  .route({ method: 'POST', path: '/profilo/uploadFotoVercel', summary: 'Upload foto profilo su Vercel Blob' })
  .input(uploadFotoVercelSchema)
  .handler(async ({ input }) => {
    try {
      const { fileName, fileData } = input
      const blob = await uploadFile(fileData, fileName, 'fotoprofili')
      console.info('file blob: ', blob)
      console.info(`Il file ${fileName} è stato completamente salvato.`)
      return blob.url
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
