import { publicProcedure } from '~/server/api/trpc'
import { z } from 'zod'
import { getCalendario, mapCalendario } from '../../../utils/common'
import { getAltrePartite, getFormazioni } from './getTabellini'

export const getFormazioniProcedure = publicProcedure
  .input(z.object({ idPartita: z.number() }))
  .query(async (opts) => {
    const idPartita = +opts.input.idPartita
    try {
      const calendarioQry = await getCalendario({
        Partite: { idPartita: idPartita },
      })

      if (calendarioQry.length > 0) {
        const calendario = (await mapCalendario(calendarioQry)).pop()
        if (calendario) {
          const partita = calendario.partite[0]

          const formazioni = await getFormazioni(idPartita)

          const altrePartite = await getAltrePartite(calendario?.idCalendario)

          return {
            Calendario: calendario,
            AltrePartite: altrePartite,
            FormazioneHome: formazioni.find(
              (c) => c.idSquadra === partita?.idHome,
            ),
            FormazioneAway: formazioni.find(
              (c) => c.idSquadra === partita?.idAway,
            ),
          }
        }
      }
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
