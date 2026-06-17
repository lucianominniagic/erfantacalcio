import { adminProcedure } from '~/server/orpc'
import { chiudiStagione } from '../services/flowStagioneService'
import { messageSchema } from '~/schemas/messageSchema'

export const chiudiStagioneORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/nuovastagione/chiudiStagione', summary: 'Chiudi la stagione corrente e liquida i trasferimenti aperti' })
  .output(messageSchema)
  .handler(async () => {
    try {
      return await chiudiStagione()
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
