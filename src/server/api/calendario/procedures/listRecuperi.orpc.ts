import { publicProcedure } from '~/server/orpc'
import { getCalendario, mapCalendario } from '~/server/utils/common'

export const listRecuperiORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/calendario/listRecuperi', summary: 'Lista partite di recupero del calendario' })
  .handler(async () => {
    try {
      const result = await getCalendario({ hasDaRecuperare: true })
      return await mapCalendario(result)
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
