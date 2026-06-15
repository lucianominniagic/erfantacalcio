import { adminProcedure } from '~/server/orpc'
import { createSessioneSchema } from '~/schemas/mercato'
import { createSessione } from '../services/mercatoService'

export const createSessioneORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/mercato/createSessione', summary: 'Crea una nuova sessione di mercato (admin)' })
  .input(createSessioneSchema)
  .handler(async ({ input }) => createSessione({ input }))
