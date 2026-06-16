import { adminProcedure } from '~/server/orpc'
import { listSessioni } from '../services/mercatoService'

export const listSessioniORPCProcedure = adminProcedure
  .route({ method: 'GET', path: '/mercato/listSessioni', summary: 'Lista sessioni di mercato (admin)' })
  .handler(async () => listSessioni())
