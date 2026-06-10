import fs from 'fs'
import path from 'path'
import { protectedProcedure } from '~/server/orpc'

export const deleteFotoORPCProcedure = protectedProcedure
  .route({ method: 'POST', path: '/profilo/deleteFoto', summary: 'Elimina foto profilo locale' })
  .handler(async ({ context }) => {
    try {
      const directory = 'public/images/fotoprofili/'

      fs.readdir(directory, (err, files) => {
        if (err) throw err

        for (const file of files) {
          const userFilePattern = new RegExp(
            `foto_${context.session.user.idSquadra}_.*`,
          )
          if (userFilePattern.test(file)) {
            fs.unlink(path.join(directory, file), (err) => {
              if (err) throw err
            })
            console.info(`Eliminato file: ${file}`)
          }
        }
      })
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
