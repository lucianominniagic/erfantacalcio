import { z } from 'zod'
import { adminProcedure } from '~/server/orpc'
import { normalizeNomeGiocatore } from '~/utils/helper'
import { Giocatori } from '~/server/db/entities'
import { isAbsoluteUrl } from './createOrUpdatePlayer'

export const createOrUpdatePlayerORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/giocatori/upsert', summary: 'Crea o aggiorna giocatore' })
  .input(
    z.object({
      idGiocatore: z.number(),
      ruolo: z.string(),
      nome: z.string(),
      nomeFantagazzetta: z.string().nullable(),
    }),
  )
  .handler(async ({ input }) => {
    try {
      const giocatore = await Giocatori.save({
        idGiocatore: input.idGiocatore,
        nome: normalizeNomeGiocatore(input.nome),
        nomeFantaGazzetta: input.nomeFantagazzetta
          ? isAbsoluteUrl(input.nomeFantagazzetta)
            ? input.nomeFantagazzetta
            : normalizeNomeGiocatore(input.nomeFantagazzetta)
          : null,
        ruolo: input.ruolo,
      })
      return giocatore.idGiocatore
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
