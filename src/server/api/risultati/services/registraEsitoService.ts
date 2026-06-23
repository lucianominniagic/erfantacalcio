import { Calendario, Formazioni, Partite } from '~/server/db/entities'
import { AppDataSource } from '~/data-source'
import { punteggioPartita, aggiornaClassifica, aggiornaMulte } from './risultatiService'

export interface RegistraEsitoInput {
  idPartita: number
  escludi: boolean
  golHome: number
  golAway: number
  fantapuntiHome: number
  fantapuntiAway: number
  multaHome: boolean
  multaAway: boolean
}

export async function registraEsito(input: RegistraEsitoInput): Promise<void> {
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
    where: { idPartita: input.idPartita },
  })

  if (!partita?.idSquadraH || !partita?.idSquadraA) return

  const idSquadraHome = partita.idSquadraH
  const idSquadraAway = partita.idSquadraA

  await AppDataSource.transaction(async (trx) => {
    await trx.update(Formazioni, { idPartita: input.idPartita }, { hasBloccata: true })
    await trx.update(
      Calendario,
      { idCalendario: partita.idCalendario },
      { hasGiocata: true },
    )
    await trx.update(
      Partite,
      { idPartita: input.idPartita },
      {
        puntiH: punteggioPartita(
          partita.Calendario.Torneo.hasClassifica ?? false,
          input.multaHome,
          input.golHome,
          input.golAway,
        ),
        puntiA: punteggioPartita(
          partita.Calendario.Torneo.hasClassifica ?? false,
          input.multaAway,
          input.golAway,
          input.golHome,
        ),
        golH: input.golHome,
        golA: input.golAway,
        hasMultaH: input.multaHome,
        hasMultaA: input.multaAway,
        punteggioH: input.fantapuntiHome,
        punteggioA: input.fantapuntiAway,
      },
    )

    console.info(
      `Aggiornate formazioni, calendario e partite per idpartita: ${input.idPartita}`,
    )

    if (partita.Calendario.Torneo.hasClassifica) {
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
