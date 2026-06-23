import { z } from 'zod'
import { publicProcedure } from '~/server/orpc'
import { getCalendario, mapCalendario } from '~/server/api/calendario/repository'
import { getTabellino } from '~/server/services/tabelliniService'
import { Partite } from '~/server/db/entities'
import {
  mapVotoToTabellinoEntry,
  calcolaFantapunti,
} from '~/server/services/tabelliniService'
import { getAltrePartite, getFormazioni } from './helpers'

export const getTabelliniORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/partita/getTabellini', summary: 'Tabellini di una partita' })
  .input(z.object({ idPartita: z.number() }))
  .handler(async ({ input }) => {
    const idPartita = +input.idPartita
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
