import { z } from 'zod'
import { protectedProcedure } from '~/server/orpc'
import {
  getProssimaGiornata,
  getProssimaGiornataSerieA,
} from '~/server/api/calendario/repository'
import { getRosaDisponibile } from '~/server/api/squadre/services/rosaService'
import { GiocatoreFormazioneType } from '~/types/squadre'
import { moduloDefault } from '~/utils/helper'
import { Formazioni, Voti } from '~/server/db/entities'

export const showFormazioneORPCProcedure = protectedProcedure
  .route({ method: 'GET', path: '/formazione/get', summary: 'Formazione corrente per torneo' })
  .input(z.object({ idTorneo: z.number() }))
  .handler(async ({ input, context }) => {
    const idSquadraUtente = context.session.user.idSquadra
    const idTorneo = +input.idTorneo
    try {
      const giornataSerieA = await getProssimaGiornataSerieA(false, 'asc')
      const prossimoCalendario = (
        await getProssimaGiornata(giornataSerieA)
      ).find((c) => c.idTorneo === idTorneo)
      const prossimaPartita = prossimoCalendario?.partite.find(
        (c) => c.idHome === idSquadraUtente || c.idAway === idSquadraUtente,
      )
      if (!prossimaPartita || !prossimoCalendario) {
        return null
      } else {
        const giocatoriSchierati = await Voti.find({
          select: {
            idGiocatore: true,
            titolare: true,
            riserva: true,
          },
          relations: { Formazione: true },
          where: {
            idCalendario: prossimoCalendario.idCalendario,
            Formazione: { idSquadra: idSquadraUtente },
          },
        })
        const datiFormazione = await Formazioni.findOne({
          select: { modulo: true },
          where: {
            idPartita: prossimaPartita.idPartita,
            idSquadra: idSquadraUtente,
          },
        })
        const rosa = await getRosaDisponibile(idSquadraUtente)
        const formazione: GiocatoreFormazioneType[] = rosa.map((r) => ({
          idGiocatore: r.idGiocatore,
          nome: r.nome,
          nomeFantagazzetta: r.nomeFantagazzetta,
          ruolo: r.ruolo,
          ruoloEsteso: r.ruoloEsteso,
          costo: r.costo,
          isVenduto: r.isVenduto,
          urlCampioncino: r.urlCampioncino,
          urlCampioncinoSmall: r.urlCampioncinoSmall,
          nomeSquadraSerieA: r.nomeSquadraSerieA,
          magliaSquadraSerieA: r.magliaSquadraSerieA,
          titolare:
            giocatoriSchierati.find((g) => g.idGiocatore === r.idGiocatore)
              ?.titolare ?? false,
          riserva:
            giocatoriSchierati.find((g) => g.idGiocatore === r.idGiocatore)
              ?.riserva ?? null,
        }))

        const dati = {
          idPartita: prossimaPartita.idPartita,
          data: prossimoCalendario.data,
          modulo: datiFormazione?.modulo ?? moduloDefault,
          giocatori: formazione,
        }

        return dati
      }
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
