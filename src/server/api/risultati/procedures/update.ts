import { z } from 'zod'
import { adminProcedure } from '~/server/api/trpc'
import { punteggioPartita, aggiornaClassifica, aggiornaMulte } from '../services/risultatiService'
import { Calendario, Formazioni, Partite } from '~/server/db/entities'
import { AppDataSource } from '~/data-source'

export const updateRisultatiProcedure = adminProcedure
  .input(
    z.object({
      idPartita: z.number(),
      escludi: z.boolean(),
      golHome: z.number().min(0).max(10),
      golAway: z.number().min(0).max(10),
      fantapuntiHome: z.number().min(0).max(120),
      fantapuntiAway: z.number().min(0).max(120),
      multaHome: z.boolean(),
      multaAway: z.boolean(),
    }),
  )
  .mutation(async (opts) => {
    try {
      const partita = await Partite.findOne({
        select: {
          idPartita: true,
          idSquadraH: true,
          idSquadraA: true,
          idCalendario: true,
          Calendario: {
            idCalendario: true,
            Torneo: { idTorneo: true, hasClassifica: true },
          },
        },
        relations: { Calendario: { Torneo: true } },
        where: { idPartita: opts.input.idPartita },
      })

      if (partita?.idSquadraH && partita?.idSquadraA) {
        const idSquadraHome = partita.idSquadraH
        const idSquadraAway = partita.idSquadraA

        await AppDataSource.transaction(async (trx) => {
          await trx.update(
            Formazioni,
            { idPartita: opts.input.idPartita },
            { hasBloccata: true },
          )
          await trx.update(
            Calendario,
            { idCalendario: partita?.idCalendario },
            { hasGiocata: true },
          )
          await trx.update(
            Partite,
            { idPartita: opts.input.idPartita },
            {
              puntiH: punteggioPartita(
                partita?.Calendario.Torneo.hasClassifica ?? false,
                opts.input.multaHome,
                opts.input.golHome,
                opts.input.golAway,
              ),
              puntiA: punteggioPartita(
                partita?.Calendario.Torneo.hasClassifica ?? false,
                opts.input.multaAway,
                opts.input.golAway,
                opts.input.golHome,
              ),
              golH: opts.input.golHome,
              golA: opts.input.golAway,
              hasMultaH: opts.input.multaHome,
              hasMultaA: opts.input.multaAway,
              punteggioH: opts.input.fantapuntiHome,
              punteggioA: opts.input.fantapuntiAway,
            },
          )

          console.info(
            `Aggiornate formazioni, calendario e partite per idpartita: ${opts.input.idPartita}`,
          )

          if (partita?.Calendario.Torneo.hasClassifica) {
            await aggiornaClassifica(trx, idSquadraHome, partita.Calendario.Torneo.idTorneo)
            console.info(
              `Aggiornate classifica e utenti (multe) per idsquadraHome: ${idSquadraHome} e idTorneo: ${partita.Calendario.Torneo.idTorneo}`,
            )
            await aggiornaMulte(trx, idSquadraHome)
            await aggiornaClassifica(trx, idSquadraAway, partita.Calendario.Torneo.idTorneo)
            console.info(
              `Aggiornate classifica e utenti (multe) per idsquadraAway: ${idSquadraAway} e idTorneo: ${partita.Calendario.Torneo.idTorneo}`,
            )
            await aggiornaMulte(trx, idSquadraAway)
          }
        })
      }
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
