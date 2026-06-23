/**
 * Calendario repository — query e mapper per il calendario di gioco.
 *
 * Centralizza tutte le letture della tabella `Calendario` e la loro
 * trasformazione in DTO. Era disperso in `~/server/utils/common`.
 */

import {
  getDescrizioneGiornataExtended,
  getTorneoTitle,
  getTorneoSubTitle,
} from '~/utils/torneo'
import { Calendario, SerieA } from '~/server/db/entities'
import { type FindOptionsWhere, MoreThan } from 'typeorm'

// ─── Raw query ────────────────────────────────────────────────────────────────

export async function getCalendario<T>(
  filter: FindOptionsWhere<T> | FindOptionsWhere<T>[],
) {
  return await Calendario.find({
    select: {
      idCalendario: true,
      giornata: true,
      giornataSerieA: true,
      ordine: true,
      data: true,
      dataFine: true,
      hasSovrapposta: true,
      girone: true,
      hasGiocata: true,
      hasDaRecuperare: true,
      Torneo: { idTorneo: true, nome: true, gruppoFase: true },
      Partite: {
        idPartita: true,
        idSquadraH: true,
        idSquadraA: true,
        hasMultaH: true,
        hasMultaA: true,
        golH: true,
        golA: true,
        fattoreCasalingo: true,
        SquadraHome: { nomeSquadra: true, foto: true, maglia: true },
        SquadraAway: { nomeSquadra: true, foto: true, maglia: true },
      },
    },
    relations: {
      Torneo: true,
      Partite: {
        SquadraHome: true,
        SquadraAway: true,
      },
    },
    where: filter,
    order: { ordine: 'asc', idTorneo: 'asc' },
  })
}

export async function getProssimaGiornataSerieA(
  isGiocata: boolean,
  orderType: 'asc' | 'desc',
) {
  const query = await Calendario.findOne({
    select: {
      giornataSerieA: true,
    },
    where: {
      hasGiocata: isGiocata,
      giornata: MoreThan(0),
      girone: MoreThan(0),
    },
    order: {
      ordine: orderType,
    },
  })
  return query?.giornataSerieA ?? 0
}

export async function getProssimaGiornata(
  giornataSerieA: number,
  withSerieA?: boolean,
) {
  const result = await getCalendario({
    giornataSerieA: giornataSerieA,
    hasGiocata: false,
  })

  if (withSerieA && withSerieA === true) {
    const serieAData = await SerieA.find({
      select: {
        giornata: true,
        squadraHome: true,
        squadraAway: true,
      },
      where: { giornata: giornataSerieA },
    })
    return mapCalendarioWithSerieA(result, serieAData)
  } else {
    return mapCalendario(result)
  }
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

export function mapPartite(partite: Calendario['Partite']) {
  return partite.map((p) => ({
    idPartita: p.idPartita,
    idHome: p.idSquadraH,
    squadraHome: p.SquadraHome?.nomeSquadra,
    fotoHome: p.SquadraHome?.foto,
    magliaHome: p.SquadraHome?.maglia,
    multaHome: p.hasMultaH,
    golHome: p.golH,
    idAway: p.idSquadraA,
    squadraAway: p.SquadraAway?.nomeSquadra,
    fotoAway: p.SquadraAway?.foto,
    magliaAway: p.SquadraAway?.maglia,
    multaAway: p.hasMultaA,
    golAway: p.golA,
    isFattoreHome: p.fattoreCasalingo,
  }))
}

export async function mapCalendario(result: Calendario[]) {
  return result.map((c) => ({
    idCalendario: c.idCalendario,
    idTorneo: c.Torneo.idTorneo,
    giornata: c.giornata,
    giornataSerieA: c.giornataSerieA,
    isGiocata: c.hasGiocata,
    isSovrapposta: c.hasSovrapposta,
    isRecupero: c.hasDaRecuperare,
    data: c.data?.toISOString(),
    dataFine: c.dataFine?.toISOString(),
    girone: c.girone,
    partite: mapPartite(c.Partite),
    Torneo: c.Torneo.nome,
    Descrizione: getDescrizioneGiornataExtended(
      c.Torneo.nome,
      c.giornata,
      c.giornataSerieA,
      c.Torneo.gruppoFase,
    ),
    Title: getTorneoTitle(c.Torneo.nome, c.giornata, c.Torneo.gruppoFase),
    SubTitle: getTorneoSubTitle(c.giornataSerieA),
  }))
}

export async function mapCalendarioWithSerieA(
  result: Calendario[],
  serieAData: SerieA[],
) {
  return result.map((c) => ({
    idCalendario: c.idCalendario,
    idTorneo: c.Torneo.idTorneo,
    giornata: c.giornata,
    giornataSerieA: c.giornataSerieA,
    isGiocata: c.hasGiocata,
    isSovrapposta: c.hasSovrapposta,
    isRecupero: c.hasDaRecuperare,
    data: c.data?.toISOString(),
    dataFine: c.dataFine?.toISOString(),
    girone: c.girone,
    partite: mapPartite(c.Partite),
    Torneo: c.Torneo.nome,
    Descrizione: getDescrizioneGiornataExtended(
      c.Torneo.nome,
      c.giornata,
      c.giornataSerieA,
      c.Torneo.gruppoFase,
    ),
    Title: getTorneoTitle(c.Torneo.nome, c.giornata, c.Torneo.gruppoFase),
    SubTitle: getTorneoSubTitle(c.giornataSerieA),
    SerieA: serieAData.map((s) => ({
      giornata: s.giornata,
      squadraHome: s.squadraHome,
      squadraAway: s.squadraAway,
    })),
  }))
}
