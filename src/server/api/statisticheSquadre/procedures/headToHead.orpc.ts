import { publicProcedure } from '~/server/orpc'
import { statisticheSquadreInputSchema } from '~/schemas/statisticheSquadre'
import { loadUtenti, loadPartiteConGol } from '../statisticheSquadreRepository'
import { buildHeadToHead } from '~/server/services/statisticheService'

export const headToHeadORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/statisticheSquadre/headToHead', summary: 'Matrice head-to-head squadre' })
  .input(statisticheSquadreInputSchema)
  .handler(async ({ input }) => {
    try {
      const idTornei = input.idTornei
      if (idTornei.length === 0) return { squadre: [], matrice: {} }

      const [utenti, partite] = await Promise.all([
        loadUtenti(),
        loadPartiteConGol(idTornei),
      ])

      return buildHeadToHead(utenti, partite)
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
