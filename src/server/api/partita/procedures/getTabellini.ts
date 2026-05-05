import { publicProcedure } from '~/server/api/trpc'
import { z } from 'zod'
import { getCalendario, mapCalendario } from '../../../utils/common'
import {
  getBonusModulo,
  getBonusSenzaVoto,
  getGiocatoriVotoInfluente,
  getGolSegnati,
  getTabellino,
} from '../../../utils/common'
import { Configurazione } from '~/config'
import { Formazioni, Partite } from '~/server/db/entities'
import { IsNull, LessThan, MoreThan, Not } from 'typeorm'

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

            const fantapuntiHome = getGiocatoriVotoInfluente(
              giocatoriInfluentiHome,
            ).reduce((acc, cur) => acc + (cur.votoBonus ?? 0), 0)

            const giocatoriInfluentiAway = await getTabellino(
              datiAway?.idFormazione ?? 0,
            )
            const fantapuntiAway = getGiocatoriVotoInfluente(
              giocatoriInfluentiAway,
            ).reduce((acc, cur) => acc + (cur.votoBonus ?? 0), 0)

            const altrePartite = await getAltrePartite(idCalendario)

            return {
              Calendario: result,
              AltrePartite: altrePartite,
              TabellinoHome: datiHome && {
                dataOra: datiHome?.dataOra,
                modulo: datiHome?.modulo,
                idSquadra: datiHome?.idSquadra,
                fattoreCasalingo:
                  partita?.isFattoreHome === true
                    ? Configurazione.bonusFattoreCasalingo
                    : 0,
                bonusModulo: getBonusModulo(datiHome.modulo),
                bonusSenzaVoto: getBonusSenzaVoto(
                  getGiocatoriVotoInfluente(giocatoriInfluentiHome).length,
                ),
                fantapunti: fantapuntiHome,
                golSegnati: getGolSegnati(
                  fantapuntiHome +
                    getBonusModulo(datiHome.modulo) +
                    getBonusSenzaVoto(
                      getGiocatoriVotoInfluente(giocatoriInfluentiHome).length,
                    ) +
                    (partita?.isFattoreHome === true
                      ? Configurazione.bonusFattoreCasalingo
                      : 0),
                ),
                fantapuntiTotale:
                  fantapuntiHome +
                  getBonusModulo(datiHome.modulo) +
                  getBonusSenzaVoto(
                    getGiocatoriVotoInfluente(giocatoriInfluentiHome).length,
                  ) +
                  (partita?.isFattoreHome === true
                    ? Configurazione.bonusFattoreCasalingo
                    : 0),
                Voti: datiHome.Voti.map((voto) => ({
                  nome: voto.Giocatore.nome,
                  idGiocatore: voto.Giocatore.idGiocatore,
                  titolare: voto.titolare,
                  riserva: voto.riserva,
                  nomeSquadraSerieA:
                    voto.Giocatore.Trasferimenti[0]?.SquadraSerieA?.nome,
                  magliaSquadraSerieA:
                    voto.Giocatore.Trasferimenti[0]?.SquadraSerieA?.maglia,
                  ruolo: voto.Giocatore.ruolo,
                  voto: voto.voto ?? 0,
                  ammonizione: voto.ammonizione ?? 0,
                  espulsione: voto.espulsione ?? 0,
                  gol: voto.gol ?? 0,
                  assist: voto.assist ?? 0,
                  autogol: voto.autogol ?? 0,
                  altriBonus: voto.altriBonus ?? 0,
                  votoBonus:
                    giocatoriInfluentiHome.find(
                      (gi) => gi.idVoto === voto.idVoto,
                    )?.votoBonus ?? 0,
                  isSostituito:
                    giocatoriInfluentiHome.find(
                      (gi) => gi.idVoto === voto.idVoto,
                    )?.isSostituito ?? false,
                  isVotoInfluente:
                    giocatoriInfluentiHome.find(
                      (gi) => gi.idVoto === voto.idVoto,
                    )?.isVotoInfluente ?? false,
                })),
              },
              TabellinoAway: datiAway && {
                dataOra: datiAway?.dataOra,
                modulo: datiAway?.modulo,
                idSquadra: datiAway?.idSquadra,
                fattoreCasalingo: 0,
                bonusModulo: getBonusModulo(datiAway.modulo),
                bonusSenzaVoto: getBonusSenzaVoto(
                  getGiocatoriVotoInfluente(giocatoriInfluentiAway).length,
                ),
                fantapunti: fantapuntiAway,
                golSegnati: getGolSegnati(
                  fantapuntiAway +
                    getBonusModulo(datiAway.modulo) +
                    getBonusSenzaVoto(
                      getGiocatoriVotoInfluente(giocatoriInfluentiAway).length,
                    ),
                ),
                fantapuntiTotale:
                  fantapuntiAway +
                  getBonusModulo(datiAway.modulo) +
                  getBonusSenzaVoto(
                    getGiocatoriVotoInfluente(giocatoriInfluentiAway).length,
                  ),
                Voti: datiAway.Voti.map((c) => ({
                  nome: c.Giocatore.nome,
                  idGiocatore: c.Giocatore.idGiocatore,
                  titolare: c.titolare,
                  riserva: c.riserva,
                  nomeSquadraSerieA:
                    c.Giocatore.Trasferimenti[0]?.SquadraSerieA?.nome,
                  magliaSquadraSerieA:
                    c.Giocatore.Trasferimenti[0]?.SquadraSerieA?.maglia,
                  ruolo: c.Giocatore.ruolo,
                  voto: c.voto ?? 0,
                  ammonizione: c.ammonizione ?? 0,
                  espulsione: c.espulsione ?? 0,
                  gol: c.gol ?? 0,
                  assist: c.assist ?? 0,
                  autogol: c.autogol ?? 0,
                  altriBonus: c.altriBonus ?? 0,
                  votoBonus:
                    giocatoriInfluentiAway.find((gi) => gi.idVoto === c.idVoto)
                      ?.votoBonus ?? 0,
                  isSostituito:
                    giocatoriInfluentiAway.find((gi) => gi.idVoto === c.idVoto)
                      ?.isSostituito ?? false,
                  isVotoInfluente:
                    giocatoriInfluentiAway.find((gi) => gi.idVoto === c.idVoto)
                      ?.isVotoInfluente ?? false,
                })),
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
