import { z } from 'zod'
import { adminProcedure } from '~/server/orpc'
import { normalizeNomeGiocatore } from '~/utils/giocatori'
import { Giocatori } from '~/server/db/entities'

function isAbsoluteUrl(value?: string | null): boolean {
  if (!value) return false
  try {
    const parsed = new URL(value)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}

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
