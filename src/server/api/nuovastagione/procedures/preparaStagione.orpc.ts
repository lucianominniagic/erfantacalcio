import { adminProcedure } from '~/server/orpc'
import { preparaNuovaStagione } from '../services/flowStagioneService'
import { messageSchema } from '~/schemas/messageSchema'

export const preparaStagioneORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/nuovastagione/preparaStagione', summary: 'Azzera i dati della stagione precedente per preparare la nuova' })
  .output(messageSchema)
  .handler(async () => {
    try {
      return await preparaNuovaStagione()
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
