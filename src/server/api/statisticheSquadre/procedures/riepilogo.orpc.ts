import { publicProcedure } from '~/server/orpc'
import { statisticheSquadreInputSchema } from '~/schemas/statisticheSquadre'
import { loadUtenti, loadPartiteConPunteggio } from '../statisticheSquadreRepository'
import { buildRiepilogo } from '~/server/services/statisticheService'

export const riepilogoORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/statisticheSquadre/riepilogo', summary: 'Riepilogo statistiche squadre' })
  .input(statisticheSquadreInputSchema)
  .handler(async ({ input }) => {
    try {
      const idTornei = input.idTornei
      if (idTornei.length === 0) return []

      const [utenti, partite] = await Promise.all([
        loadUtenti(),
        loadPartiteConPunteggio(idTornei),
      ])

      return buildRiepilogo(utenti, partite)
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
