import { z } from 'zod'
import { publicProcedure } from '~/server/orpc'
import { RuoloUtente } from '~/utils/enums'
import {
  getTorneo,
  getDescrizioneGiornata,
  getTorneoTitle,
  getTorneoSubTitle,
  getCalendario,
} from '../../../utils/common'
import { mapPartite } from '../services/partiteMapping'

export const getGiornataPartiteORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/risultati/getGiornataPartite', summary: 'Partite di una giornata' })
  .input(
    z.object({
      idCalendario: z.number(),
      includeTabellini: z.boolean(),
      backOfficeMode: z.boolean(),
    }),
  )
  .handler(async ({ input, context }) => {
    try {
      const result = await getCalendario({
        idCalendario: input.idCalendario,
      })
      const calendario = result.pop()
      if (calendario) {
        return {
          idCalendario: calendario.idCalendario,
          idTorneo: calendario.Torneo.idTorneo,
          giornata: calendario.giornata,
          giornataSerieA: calendario.giornataSerieA,
          isGiocata: calendario.hasGiocata,
          isSovrapposta: calendario.hasSovrapposta,
          data: calendario.data?.toISOString(),
          dataFine: calendario.dataFine?.toISOString(),
          girone: calendario.girone,
          partite: await mapPartite(
            calendario.Partite,
            input.includeTabellini,
            context.session?.user?.ruolo === RuoloUtente.contributor
              ? false
              : input.backOfficeMode,
          ),
          Torneo: getTorneo(
            calendario.Torneo.nome,
            calendario.Torneo.gruppoFase,
          ),
          Descrizione: getDescrizioneGiornata(
            calendario.Torneo.nome,
            calendario.giornata,
            calendario.giornataSerieA,
            calendario.Torneo.gruppoFase,
          ),
          Title: getTorneoTitle(
            calendario.Torneo.nome,
            calendario.giornata,
            calendario.Torneo.gruppoFase,
          ),
          SubTitle: getTorneoSubTitle(calendario.giornataSerieA),
        }
      }
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
