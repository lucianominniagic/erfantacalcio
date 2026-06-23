import { protectedProcedure } from '~/server/orpc'
import { confermaPrecedente } from '../services/salvaFormazioneService'

export const confirmPrecedenteORPCProcedure = protectedProcedure
  .route({ method: 'POST', path: '/formazione/confirmPrecedente', summary: 'Conferma formazione della giornata precedente' })
  .handler(async ({ context }) => {
    await confermaPrecedente(context.session.user.idSquadra)
  })

