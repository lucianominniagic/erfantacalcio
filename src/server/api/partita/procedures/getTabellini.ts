import { publicProcedure } from '~/server/api/trpc'
import { z } from 'zod'
import { getCalendario, mapCalendario } from '../../../utils/common'
import { getTabellino } from '../../../utils/common'
import { Formazioni, Partite } from '~/server/db/entities'
import { IsNull, LessThan, MoreThan, Not } from 'typeorm'
import {
  mapVotoToTabellinoEntry,
  calcolaFantapunti,
} from '~/server/services/tabelliniService'

export const getTabelliniProcedure = publicProcedure
  .input(z.object({ idPartita: z.number() }))
  .query(async (opts) => {
    const idPartita = +opts.input.idPartita
    try {
      const idCalendario = (
        await Partite.findOne({
          select: { idCalendario: true },
          where: { idPartita },
        })
      )?.idCalendario

      if (idCalendario) {
        const calendario = await getCalendario({
          idCalendario: idCalendario,
          Partite: { idPartita: idPartita },
        })

        if (calendario) {
          const result = (await mapCalendario(calendario))[0]
          if (result?.partite.length === 1) {
            const partita = result.partite[0]

            const formazioni = await getFormazioni(idPartita)

            const datiHome = formazioni.find(
              (c) => c.idSquadra === partita?.idHome,
            )
            const datiAway = formazioni.find(
              (c) => c.idSquadra === partita?.idAway,
            )

            const giocatoriInfluentiHome = await getTabellino(
              datiHome?.idFormazione ?? 0,
            )
            const risultatoHome = calcolaFantapunti(
              giocatoriInfluentiHome,
              datiHome?.modulo ?? '',
              partita?.isFattoreHome === true,
            )

            const giocatoriInfluentiAway = await getTabellino(
              datiAway?.idFormazione ?? 0,
            )
            const risultatoAway = calcolaFantapunti(
              giocatoriInfluentiAway,
              datiAway?.modulo ?? '',
              false,
            )

            const altrePartite = await getAltrePartite(idCalendario)

            return {
              Calendario: result,
              AltrePartite: altrePartite,
              TabellinoHome: datiHome && {
                dataOra: datiHome?.dataOra,
                modulo: datiHome?.modulo,
                idSquadra: datiHome?.idSquadra,
                fattoreCasalingo: risultatoHome.fattoreCasalingo,
                bonusModulo: risultatoHome.bonusModulo,
                bonusSenzaVoto: risultatoHome.bonusSenzaVoto,
                fantapunti: risultatoHome.fantapuntiBase,
                golSegnati: risultatoHome.golSegnati,
                fantapuntiTotale: risultatoHome.fantapuntiTotale,
                Voti: datiHome.Voti.map((voto) =>
                  mapVotoToTabellinoEntry(voto, giocatoriInfluentiHome),
                ),
              },
              TabellinoAway: datiAway && {
                dataOra: datiAway?.dataOra,
                modulo: datiAway?.modulo,
                idSquadra: datiAway?.idSquadra,
                fattoreCasalingo: risultatoAway.fattoreCasalingo,
                bonusModulo: risultatoAway.bonusModulo,
                bonusSenzaVoto: risultatoAway.bonusSenzaVoto,
                fantapunti: risultatoAway.fantapuntiBase,
                golSegnati: risultatoAway.golSegnati,
                fantapuntiTotale: risultatoAway.fantapuntiTotale,
                Voti: datiAway.Voti.map((voto) =>
                  mapVotoToTabellinoEntry(voto, giocatoriInfluentiAway),
                ),
              },
            }
          }
        }
      }
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })

export async function getAltrePartite(idCalendario: number | undefined) {
  return await Partite.find({
    select: {
      idPartita: true,
      SquadraHome: { nomeSquadra: true, foto: true, maglia: true },
      SquadraAway: { nomeSquadra: true, foto: true, maglia: true },
    },
    relations: { SquadraHome: true, SquadraAway: true },
    where: { idCalendario },
  })
}

export async function getFormazioni(idPartita: number) {
  const formazioni = await Formazioni.find({
    select: {
      idFormazione: true,
      idSquadra: true,
      idPartita: true,
      dataOra: true,
      modulo: true,
      hasBloccata: true,
      Voti: {
        idVoto: true,
        idGiocatore: true,
        idCalendario: true,
        idFormazione: true,
        voto: true,
        ammonizione: true,
        espulsione: true,
        gol: true,
        assist: true,
        autogol: true,
        altriBonus: true,
        titolare: true,
        riserva: true,
        Giocatore: {
          idGiocatore: true,
          ruolo: true,
          nome: true,
          nomeFantaGazzetta: true,
          id_pf: true,
          Trasferimenti: {
            idTrasferimento: true,
            idGiocatore: true,
            idSquadraSerieA: true,
            dataAcquisto: true,
            dataCessione: true,
            idSquadra: true,
            costo: true,
            stagione: true,
            hasRitirato: true,
            nomeSquadraSerieA: true,
            nomeSquadra: true,
            media: true,
            gol: true,
            assist: true,
            giocate: true,
            SquadraSerieA: {
              idSquadraSerieA: true,
              nome: true,
              maglia: true,
            },
          },
        },
      },
    },
    relations: {
      Voti: { Giocatore: { Trasferimenti: { SquadraSerieA: true } } },
    },
    where: {
      idPartita: idPartita,
      Voti: {
        Giocatore: {
          Trasferimenti: [
            {
              dataCessione: IsNull(),
              dataAcquisto: LessThan(new Date()),
            },
            {
              dataAcquisto: LessThan(new Date()),
              dataCessione: MoreThan(new Date()),
            },
          ],
        },
      },
    },
    order: {
      Voti: {
        Giocatore: { ruolo: 'DESC' },
        riserva: 'ASC',
      },
    },
  })

  return formazioni
}
