/**
 * Servizio per la rosa di una squadra.
 *
 * Fornisce i giocatori attualmente disponibili e quelli ceduti
 * per una squadra nella stagione corrente.
 */

import { Configurazione } from '~/config'
import { getRuoloEsteso, normalizeCampioncinoUrl } from '~/utils/helper'
import { toUtcDate } from '~/utils/dateUtils'
import { type GiocatoreType } from '~/types/squadre'
import { Trasferimenti } from '~/server/db/entities'
import { IsNull, Not, LessThan, MoreThan } from 'typeorm'

export async function getRosaDisponibile(idSquadra: number) {
  const now = toUtcDate(new Date())
  const query = await Trasferimenti.find({
    select: {
      idGiocatore: true,
      costo: true,
      Giocatore: { nome: true, nomeFantaGazzetta: true, ruolo: true },
      SquadraSerieA: { nome: true, maglia: true },
    },
    relations: {
      Giocatore: true,
      SquadraSerieA: true,
    },
    where: [
      {
        idSquadra: idSquadra,
        stagione: Configurazione.stagione,
        hasRitirato: false,
        dataCessione: IsNull(),
        dataAcquisto: LessThan(now),
      },
      {
        idSquadra: idSquadra,
        stagione: Configurazione.stagione,
        hasRitirato: false,
        dataCessione: MoreThan(now),
        dataAcquisto: LessThan(now),
      },
    ],
    order: {
      Giocatore: { ruolo: 'desc' },
      costo: 'desc',
    },
  })

  return query.map<GiocatoreType>((giocatore) => ({
    idGiocatore: giocatore.idGiocatore,
    nome: giocatore.Giocatore.nome,
    nomeFantagazzetta: giocatore.Giocatore.nomeFantaGazzetta,
    ruolo: giocatore.Giocatore.ruolo,
    ruoloEsteso: getRuoloEsteso(giocatore.Giocatore.ruolo),
    costo: giocatore.costo,
    isVenduto: false,
    urlCampioncino: normalizeCampioncinoUrl(
      Configurazione.urlCampioncino,
      giocatore.Giocatore.nome,
      giocatore.Giocatore.nomeFantaGazzetta,
    ),
    urlCampioncinoSmall: normalizeCampioncinoUrl(
      Configurazione.urlCampioncinoSmall,
      giocatore.Giocatore.nome,
      giocatore.Giocatore.nomeFantaGazzetta,
    ),
    nomeSquadraSerieA: giocatore.SquadraSerieA?.nome,
    magliaSquadraSerieA: giocatore.SquadraSerieA?.maglia,
  }))
}

export async function getGiocatoriVenduti(idSquadra: number) {
  const query = await Trasferimenti.find({
    select: {
      idGiocatore: true,
      costo: true,
      Giocatore: {
        nome: true,
        nomeFantaGazzetta: true,
        ruolo: true,
      },
      SquadraSerieA: {
        nome: true,
        maglia: true,
      },
    },
    relations: {
      Giocatore: true,
      SquadraSerieA: true,
    },
    where: {
      idSquadra: idSquadra,
      stagione: Configurazione.stagione,
      hasRitirato: false,
      dataCessione: Not(IsNull()),
    },
    order: {
      Giocatore: { ruolo: 'desc' },
      costo: 'desc',
    },
  })

  return query.map<GiocatoreType>((giocatore) => ({
    idGiocatore: giocatore.idGiocatore,
    nome: giocatore.Giocatore.nome,
    nomeFantagazzetta: giocatore.Giocatore.nomeFantaGazzetta,
    ruolo: giocatore.Giocatore.ruolo,
    ruoloEsteso: getRuoloEsteso(giocatore.Giocatore.ruolo),
    costo: giocatore.costo,
    isVenduto: true,
    urlCampioncino: normalizeCampioncinoUrl(
      Configurazione.urlCampioncino,
      giocatore.Giocatore.nome,
      giocatore.Giocatore.nomeFantaGazzetta,
    ),
    urlCampioncinoSmall: normalizeCampioncinoUrl(
      Configurazione.urlCampioncinoSmall,
      giocatore.Giocatore.nome,
      giocatore.Giocatore.nomeFantaGazzetta,
    ),
    nomeSquadraSerieA: giocatore.SquadraSerieA?.nome,
    magliaSquadraSerieA: giocatore.SquadraSerieA?.maglia,
  }))
}
