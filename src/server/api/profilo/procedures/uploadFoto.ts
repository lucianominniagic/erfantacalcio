import { z } from 'zod'
import fs from 'fs'
import path from 'path'
import { protectedProcedure } from '~/server/api/trpc'

export const uploadFotoProcedure = protectedProcedure
  .input(
    z.object({
      fileName: z.string(),
      fileSize: z.number(),
      blockDataBase64: z.string(),
    }),
  )
  .mutation(async (opts) => {
    try {
      const { fileName, fileSize, blockDataBase64 } = opts.input
      const filePath = path.join(
        process.cwd(),
        `public/images/fotoprofili/${fileName}`,
      )
      const fileExists = fs.existsSync(filePath)

      if (!fileExists) {
        fs.writeFileSync(filePath, Buffer.from(blockDataBase64, 'base64'), {
          flag: 'w',
        })
      } else {
        fs.appendFileSync(filePath, Buffer.from(blockDataBase64, 'base64'))
      }

      if (fs.statSync(filePath).size >= fileSize)
        console.info(`Il file ${fileName} è stato completamente salvato.`)
      return `/images/fotoprofili/${fileName}`
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
