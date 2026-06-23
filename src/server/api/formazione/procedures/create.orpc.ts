import { z } from 'zod'
import { protectedProcedure } from '~/server/orpc'
import { salvaFormazione } from '../services/salvaFormazioneService'

export const createFormazioneORPCProcedure = protectedProcedure
  .route({ method: 'POST', path: '/formazione/create', summary: 'Inserisci formazione per una partita' })
  .input(
    z.object({
      idPartita: z.number(),
      modulo: z.string(),
      giocatori: z.array(
        z.object({
          idGiocatore: z.number(),
          titolare: z.boolean(),
          riserva: z.number().nullable().optional(),
        }),
      ),
    }),
  )
  .handler(async ({ input, context }) => {
    await salvaFormazione({
      idPartita: +input.idPartita,
      idSquadra: context.session.user.idSquadra,
      modulo: input.modulo,
      giocatori: input.giocatori,
    })
  })

