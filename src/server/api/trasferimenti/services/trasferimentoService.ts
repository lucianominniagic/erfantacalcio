/**
 * Servizio per la gestione dei trasferimenti.
 *
 * Contiene la logica di chiusura di un trasferimento attivo:
 * calcolo statistiche (media, gol, assist, giocate) e aggiornamento del record.
 */

import { toUtcDate } from '~/utils/dateUtils'
import { Trasferimenti, Voti } from '~/server/db/entities'
import { type EntityManager, IsNull, Between, MoreThan } from 'typeorm'

export async function chiudiTrasferimentoGiocatore(
  trx: EntityManager,
  idGiocatore: number,
  chiusuraStagione: boolean,
) {
  try {
    const oldTrasferimento = await trx.findOne(Trasferimenti, {
      select: {
        dataAcquisto: true,
        idTrasferimento: true,
        Utente: { nomeSquadra: true, idUtente: true },
        SquadraSerieA: { nome: true },
        Giocatore: { ruolo: true },
      },
      relations: {
        Utente: true,
        SquadraSerieA: true,
        Giocatore: true,
      },
      where: { idGiocatore: idGiocatore, dataCessione: IsNull() },
    })

    if (oldTrasferimento) {
      console.debug(
        'dati ultimo trasferimento idgiocatore: ' + idGiocatore,
        oldTrasferimento,
      )
      const votiTutti = await trx.find(Voti, {
        select: {
          idVoto: true,
          voto: true,
          gol: true,
          assist: true,
          Calendario: {
            idCalendario: true,
            giornataSerieA: true,
          },
        },
        relations: {
          Calendario: true,
        },
        where: {
          idGiocatore: idGiocatore,
          Calendario: {
            data: Between(oldTrasferimento.dataAcquisto, toUtcDate(new Date())),
          },
          voto: MoreThan(0),
        },
      })

      // Dedup per giornataSerieA: un giocatore può essere schierato in più
      // partite (es. campionato + champions) nella stessa giornata di serie A,
      // ma il voto/gol/assist reale è uno solo per quella giornata.
      const votiPerGiornata = new Map<number, (typeof votiTutti)[number]>()
      for (const v of votiTutti) {
        const giornata = v.Calendario.giornataSerieA
        if (!votiPerGiornata.has(giornata)) {
          votiPerGiornata.set(giornata, v)
        }
      }
      const voti = Array.from(votiPerGiornata.values())

      if (voti.length > 0) {
        console.debug(
          'voti ultimo trasferimento idgiocatore: ' + idGiocatore,
          voti,
        )
        const oldStatistica = voti.reduce(
          (acc, curr) => {
            acc.mediaVoto += curr.voto ?? 0
            acc.golTotali += curr.gol ?? 0
            acc.assistTotali += curr.assist ?? 0
            return acc
          },
          { mediaVoto: 0, golTotali: 0, assistTotali: 0, giocate: voti.length },
        )
        oldStatistica.mediaVoto = oldStatistica.mediaVoto / voti.length
        // La divisione per 3 è intenzionale: `voto.gol` contiene punti bonus,
        // non il conteggio dei gol. I portieri non hanno questa divisione.
        oldStatistica.golTotali =
          oldTrasferimento.Giocatore.ruolo === 'P'
            ? oldStatistica.golTotali
            : oldStatistica.golTotali / 3

        console.debug(
          'statistica ultimo trasferimento idgiocatore: ' + idGiocatore,
          oldStatistica,
        )
        await trx.update(
          Trasferimenti,
          {
            idTrasferimento: oldTrasferimento.idTrasferimento,
          },
          {
            dataCessione: new Date(),
            nomeSquadraSerieA: oldTrasferimento.SquadraSerieA?.nome,
            nomeSquadra: oldTrasferimento.Utente?.nomeSquadra,
            media: oldStatistica.mediaVoto,
            gol: Math.round(oldStatistica.golTotali),
            assist: Math.round(oldStatistica.assistTotali),
            giocate: oldStatistica.giocate,
            idSquadra: chiusuraStagione
              ? null
              : oldTrasferimento.Utente?.idUtente,
          },
        )
        console.debug('updated ultimo trasferimento (completo): ' + idGiocatore)
      } else {
        await trx.update(
          Trasferimenti,
          {
            idTrasferimento: oldTrasferimento.idTrasferimento,
          },
          {
            dataCessione: new Date(),
            nomeSquadraSerieA: oldTrasferimento.SquadraSerieA?.nome,
            nomeSquadra: oldTrasferimento.Utente?.nomeSquadra,
            idSquadra: chiusuraStagione
              ? null
              : oldTrasferimento.Utente?.idUtente,
          },
        )
        console.debug('updated ultimo trasferimento (parziale): ' + idGiocatore)
      }
    } else {
      await trx.update(
        Trasferimenti,
        { idGiocatore: idGiocatore, dataCessione: IsNull() },
        {
          dataCessione: new Date(),
          nomeSquadra: '',
          nomeSquadraSerieA: '',
        },
      )
      console.debug('updated ultimo trasferimento (base): ' + idGiocatore)
    }
  } catch (error) {
    console.error('Si è verificato un errore', error)
    throw error
  }
}
