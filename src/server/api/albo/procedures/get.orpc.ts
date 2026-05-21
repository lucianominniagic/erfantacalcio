import { z } from 'zod'
import { publicProcedure } from '~/server/orpc'
import { Utenti } from '~/server/db/entities'

export const getAlboORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/albo/get', summary: 'Trofei di una squadra' })
  .input(z.object({ idSquadra: z.number() }))
  .handler(async ({ input }) => {
    try {
      const utente = await Utenti.findOne({ where: { idUtente: input.idSquadra } })
      if (utente) {
        return {
          squadra: utente.nomeSquadra,
          campionato: utente.Campionato,
          champions: utente.Champions,
          secondo: utente.Secondo,
          terzo: utente.Terzo,
        }
      }
      return null
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
