import { adminProcedure } from '~/server/orpc'
import { getProposteSessioneSchema } from '~/schemas/mercato'
import { getProposteSessione } from '../services/mercatoService'

export const getProposteSessioneORPCProcedure = adminProcedure
  .route({ method: 'GET', path: '/mercato/getProposteSessione', summary: 'Recupera le proposte di una sessione chiusa (admin)' })
  .input(getProposteSessioneSchema)
  .handler(async ({ input }) => getProposteSessione({ input }))
