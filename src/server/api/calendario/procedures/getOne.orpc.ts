import { z } from 'zod'
import { adminProcedure } from '~/server/orpc'
import { calendarioSchema } from '~/schemas/calendario'
import { Calendario } from '~/server/db/entities'

function mapCalendarioResult(
  result: Calendario,
): z.infer<typeof calendarioSchema> {
  return {
    id: result.idCalendario,
    idTorneo: result.Torneo.idTorneo,
    nome: result.Torneo.nome,
    gruppoFase: result.Torneo.gruppoFase,
    giornata: result.giornata,
    giornataSerieA: result.giornataSerieA,
    isGiocata: result.hasGiocata,
    isSovrapposta: result.hasSovrapposta,
    isRecupero: result.hasDaRecuperare,
    data: (result.data ?? new Date())?.toISOString(),
    dataFine: (result.dataFine ?? new Date())?.toISOString(),
    girone: result.girone,
    isSelected: false,
  }
}

export const getOneCalendarioORPCProcedure = adminProcedure
  .route({ method: 'GET', path: '/calendario/getOne', summary: 'Recupera un singolo elemento del calendario (admin)' })
  .input(z.object({ idCalendario: z.number() }))
  .handler(async ({ input }) => {
    try {
      const result = await Calendario.findOne({
        select: {
          idCalendario: true,
          giornata: true,
          giornataSerieA: true,
          ordine: true,
          data: true,
          dataFine: true,
          hasSovrapposta: true,
          girone: true,
          hasGiocata: true,
          hasDaRecuperare: true,
          idTorneo: true,
          Torneo: { idTorneo: true, nome: true, gruppoFase: true },
        },
        relations: { Torneo: true },
        where: { idCalendario: input.idCalendario },
      })
      if (result) {
        return mapCalendarioResult(result)
      }
      return null
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
