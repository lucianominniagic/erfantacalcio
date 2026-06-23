import { publicProcedure } from '~/server/orpc'
import { getCalendario, mapCalendario } from '~/server/api/calendario/repository'
import { getTornei } from '~/server/api/tornei/repository'
import z from 'zod'

export const coppaBracketORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/tornei/coppaBracket', summary: 'Bracket Coppa' })
  .input(z.object({ nomeTorneo: z.string() }))
  .handler(async ({ input }) => {
    try {
      const tornei = await getTornei()
      const coppa = tornei.filter((t) => t.nome.toLowerCase() === input.nomeTorneo.toLowerCase())

      const semifinaliAndandoTorneo = coppa.find((t) => t.gruppoFase?.toLowerCase() === 'semifinali andata')
      const semifinaliRitornoTorneo = coppa.find((t) => t.gruppoFase?.toLowerCase() === 'semifinali ritorno')
      const finaleTorneo = coppa.find((t) => t.gruppoFase?.toLowerCase() === 'finale')

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
      console.error('Si è verificato un errore in coppaBracket', error)
      throw error
    }
  })
