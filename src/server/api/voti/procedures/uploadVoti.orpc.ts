import fs from 'fs'
import path from 'path'
import { z } from 'zod'
import { adminProcedure } from '~/server/orpc'

function getPathVoti(fileName: string) {
  return path.join(process.cwd(), `public/voti/${fileName}`)
}

export const uploadVotiORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/voti/upload', summary: 'Carica un file voti sul filesystem (admin)' })
  .input(
    z.object({
      idCalendario: z.number(),
      fileName: z.string(),
      fileSize: z.number(),
      blockDataBase64: z.string(),
    }),
  )
  .handler(async ({ input }) => {
    try {
      const { fileName, fileSize, blockDataBase64 } = input
      const filePath = getPathVoti(fileName)

      fs.writeFileSync(filePath, Buffer.from(blockDataBase64, 'base64'), {
        flag: 'w',
      })

      if (fs.statSync(filePath).size >= fileSize) {
        console.info(`Il file ${fileName} è stato completamente salvato.`)
      }
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
