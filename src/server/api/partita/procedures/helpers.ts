import { IsNull, LessThan, MoreThan } from 'typeorm'
import { Formazioni, Partite } from '~/server/db/entities'

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
