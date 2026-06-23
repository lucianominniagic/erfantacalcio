import { publicProcedure } from '~/server/orpc'
import { getTornei } from '~/server/api/tornei/repository'

export const listTorneiORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/tornei/list', summary: 'Lista tornei' })
  .handler(async () => {
    try {
      return await getTornei()
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
