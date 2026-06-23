import { publicProcedure } from '~/server/orpc'
import { getCalendario, mapCalendario } from '~/server/api/calendario/repository'
import { getTornei } from '~/server/api/tornei/repository'

export const championsBracketORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/tornei/championsBracket', summary: 'Bracket Champions League' })
  .handler(async () => {
    try {
      const tornei = await getTornei()
      const champions = tornei.filter((t) => t.nome.toLowerCase() === 'champions')

      const semifinaliAndandoTorneo = champions.find((t) => t.gruppoFase?.toLowerCase() === 'semifinali andata')
      const semifinaliRitornoTorneo = champions.find((t) => t.gruppoFase?.toLowerCase() === 'semifinali ritorno')
      const finaleTorneo = champions.find((t) => t.gruppoFase?.toLowerCase() === 'finale')

      const fetchGiornata = async (idTorneo: number | undefined) => {
        if (idTorneo === undefined) return null
        const result = await getCalendario({ Torneo: { idTorneo } })
        if (!result.length) return null
        const mapped = await mapCalendario(result)
        return mapped[0] ?? null
      }

      const [semifinaliAndata, semifinaliRitorno, finale] = await Promise.all([
        fetchGiornata(semifinaliAndandoTorneo?.idTorneo),
        fetchGiornata(semifinaliRitornoTorneo?.idTorneo),
        fetchGiornata(finaleTorneo?.idTorneo),
      ])

      return { semifinaliAndata, semifinaliRitorno, finale }
    } catch (error) {
      console.error('Si è verificato un errore in championsBracket', error)
      throw error
    }
  })
