import { z } from 'zod'
import { adminProcedure } from '~/server/orpc'
import { calendarioSchema } from '~/schemas/calendario'
import { getCalendario } from '~/server/utils/common'

export const listCalendarioORPCProcedure = adminProcedure
  .route({ method: 'GET', path: '/calendario/list', summary: 'Lista completa del calendario (admin)' })
  .handler(async () => {
    try {
      const result = await getCalendario({})

      let indexSelected = 0
      if (result && result.length > 0) {
        const allFalse = result.every((r) => !r.hasGiocata)
        const allTrue = result.every((r) => r.hasGiocata)
        if (allFalse) {
          indexSelected = 0
        } else if (allTrue) {
          indexSelected = result.length - 1
        } else {
          indexSelected = result.findIndex((r) => !r.hasGiocata)
          if (indexSelected === -1) indexSelected = 0
        }
      }

      console.log(`Index selected calendario: ${indexSelected}`)
      const mapped = result.map((c, index) => ({
        id: c.idCalendario,
        idTorneo: c.Torneo.idTorneo,
        nome: c.Torneo.nome,
        gruppoFase: c.Torneo.gruppoFase,
        giornata: c.giornata,
        giornataSerieA: c.giornataSerieA,
        isGiocata: c.hasGiocata,
        isSovrapposta: c.hasSovrapposta,
        isRecupero: c.hasDaRecuperare,
        data: c.data?.toISOString(),
        dataFine: c.dataFine?.toISOString(),
        girone: c.girone,
        isSelected: index === indexSelected,
      }))
      return z.array(calendarioSchema).parse(mapped)
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
