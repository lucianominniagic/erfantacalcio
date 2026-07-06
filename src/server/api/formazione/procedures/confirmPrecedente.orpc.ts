import { protectedProcedure } from '~/server/orpc'
import { confermaPrecedente } from '../services/salvaFormazioneService'
import z from 'zod'

export const confirmPrecedenteORPCProcedure = protectedProcedure
  .route({ method: 'POST', path: '/formazione/confirmPrecedente', summary: 'Conferma formazione della giornata precedente' })
  .input(z.object({
    verificaEsistenti: z.boolean().optional().default(true),
  }))
  .handler(async ({ context, input }) => {
    await confermaPrecedente(context.session.user.idSquadra, input.verificaEsistenti)
  })

