import { adminProcedure } from '~/server/api/trpc'
import { calendarioSchema } from '~/schemas/calendario'
import { z } from 'zod'
import { getCalendario } from '~/server/utils/common'

export const listCalendarioProcedure = adminProcedure.query(async () => {
  try {
    const result = await getCalendario({})

    // Determina l'indice selezionato:
    // - se tutti hasGiocata === false -> 0 (campionato non iniziato)
    // - se tutti hasGiocata === true -> ultimo indice (campionato finito)
    // - altrimenti -> prima partita non giocata (campionato in corso)
    let indexSelected = 0
    if (result && result.length > 0) {
      const allFalse = result.every((r) => !r.hasGiocata)
      const allTrue = result.every((r) => r.hasGiocata)
      if (allFalse) {
        indexSelected = 0
      } else if (allTrue) {
        indexSelected = result.length - 1
      } else {
        // campionato in corso -> prima partita non giocata
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
    const parsed = z.array(calendarioSchema).parse(mapped)
    return parsed
  } catch (error) {
    console.error('Si è verificato un errore', error)
    throw error
  }
})
