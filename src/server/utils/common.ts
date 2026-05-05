import { Configurazione } from '~/config'
import { getRuoloEsteso, normalizeCampioncinoUrl } from '~/utils/helper'
import { toUtcDate } from '~/utils/dateUtils'
import { type GiocatoreType } from '~/types/squadre'

import {
  Calendario,
  Giocatori,
  Partite,
  SerieA,
  Tornei,
  Trasferimenti,
  Voti,
} from '../db/entities'
import {
  EntityManager,
  FindOptionsWhere,
  IsNull,
  Not,
  Between,
  MoreThan,
  LessThan,
} from 'typeorm'
import _ from 'lodash'

export async function chiudiTrasferimentoGiocatore(
  trx: EntityManager,
  idGiocatore: number,
  chiusuraStagione: boolean,
) {
  try {
    //cerca il trasferimento ancora in corso per quel giocatore (datacessione is null)
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
      //cerca i voti nel periodo dall'ultima data di acuisto ad oggi
      let voti = await trx.find(Voti, {
        select: {
          voto: true,
          gol: true,
          assist: true,
          Calendario: {
            giornataSerieA: true,
          },
        },
        relations: {
          Calendario: true,
          Giocatore: { Trasferimenti: true },
        },
        // distinct: ['voto', 'gol', 'assist'],
        where: {
          idGiocatore: idGiocatore,
          Calendario: {
            data: Between(toUtcDate(new Date()), oldTrasferimento.dataAcquisto),
          },
          voto: MoreThan(0),
          Giocatore: { Trasferimenti: { dataCessione: IsNull() } },
        },
      })

      voti = _.uniqBy(voti, (v) => ['voto', 'gol', 'assist'])

      if (voti.length > 0) {
        console.debug(
          'voti ultimo trasferimento idgiocatore: ' + idGiocatore,
          voti,
        )
        //sui voti precedentemente trovati calcolo media, gol, assist e giocate
        const oldStatistica = voti.reduce(
          (acc, curr) => {
            acc.mediaVoto += curr.voto ?? 0
            acc.golTotali += curr.gol ?? 0
            acc.assistTotali += curr.assist ?? 0
            acc.giocate = voti.length
            return acc
          },
          { mediaVoto: 0, golTotali: 0, assistTotali: 0, giocate: 0 },
        )
        oldStatistica.mediaVoto = oldStatistica.mediaVoto / voti.length
        oldStatistica.golTotali =
          oldTrasferimento.Giocatore.ruolo === 'P'
            ? oldStatistica.golTotali
            : oldStatistica.golTotali / 3

        console.debug(
          'statistica ultimo trasferimento idgiocatore: ' + idGiocatore,
          oldStatistica,
        )

        console.debug(
          'updating ultimo trasferimento (completo): ' + idGiocatore,
        )
        //eseguo update del trasferimento con datacessione odierna
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
            gol: oldStatistica.golTotali,
            assist: oldStatistica.assistTotali,
            giocate: oldStatistica.giocate,
            idSquadra: chiusuraStagione
              ? null
              : oldTrasferimento.Utente?.idUtente,
          },
        )
        console.debug('updated ultimo trasferimento (completo): ' + idGiocatore)
      } else {
        console.debug(
          'updating ultimo trasferimento (parziale): ' + idGiocatore,
        )
        //eseguo update del trasferimento con datacessione odierna
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
      console.debug('updating ultimo trasferimento (base): ' + idGiocatore)
      //eseguo update del trasferimento con datacessione odierna
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

export async function deleteVotiGiocatore(
  trx: EntityManager,
  idGiocatore: number,
) {
  try {
    await trx.delete(Voti, {
      idGiocatore: idGiocatore,
    })
  } catch (error) {
    console.error('Si è verificato un errore', error)
    throw error
  }
}

export async function deleteGiocatore(trx: EntityManager, idGiocatore: number) {
  try {
    await trx.delete(Giocatori, {
      idGiocatore: idGiocatore,
    })
  } catch (error) {
    console.error('Si è verificato un errore', error)
    throw error
  }
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
    Descrizione: getDescrizioneGiornata(
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
    Descrizione: getDescrizioneGiornata(
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

export function mapPartite(partite: Partite[]) {
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

export async function getTornei() {
  return await Tornei.find({
    select: {
      idTorneo: true,
      nome: true,
      gruppoFase: true,
      hasClassifica: true,
    },
  })
}

export async function getGiocatoreById(idGiocatore: number) {
  const giocatore = await Giocatori.findOne({
    where: {
      idGiocatore: idGiocatore,
    },
  })

  if (giocatore) {
    return {
      idGiocatore: giocatore.idGiocatore,
      nome: giocatore.nome,
      nomeFantagazzetta: giocatore.nomeFantaGazzetta,
      ruolo: giocatore.ruolo,
      ruoloEsteso: getRuoloEsteso(giocatore.ruolo),
    }
  }
}

export function getDescrizioneGiornata(
  nome: string,
  giornata: number,
  giornataSerieA: number,
  gruppoFase?: string | null,
): string {
  if (gruppoFase === null || gruppoFase === undefined) {
    return `${nome} ${giornata}ª giornata (${giornataSerieA}ª giornata serie A)`
  } else if (gruppoFase === 'A' || gruppoFase === 'B') {
    return `Gruppo ${gruppoFase} - ${nome} ${giornata}ª giornata (${giornataSerieA}ª giornata serie A)`
  } else {
    return `${gruppoFase} - ${nome} ${giornata}ª giornata (${giornataSerieA}ª giornata serie A)`
  }
}

export function getTorneoTitle(
  nome: string,
  giornata: number,
  gruppoFase?: string | null,
): string {
  if (gruppoFase === null || gruppoFase === undefined) {
    return `${nome} ${giornata}ª giornata`
  } else if (gruppoFase === 'A' || gruppoFase === 'B') {
    return `Gruppo ${gruppoFase} - ${nome} ${giornata}ª giornata`
  } else {
    return `${gruppoFase} - ${nome} ${giornata}ª giornata`
  }
}

export function getTorneoSubTitle(giornataSerieA: number): string {
  return `${giornataSerieA}ª giornata serie A`
}

export function getTorneo(nome: string, gruppoFase?: string | null): string {
  return gruppoFase ? `${nome.trim()} ${gruppoFase.trim()}` : nome.trim()
}

export function getBonusModulo(modulo: string) {
  const moduloToBonusMap: Record<string, number> = {
    '3-5-2': Configurazione.bonusModulo352,
    '4-3-3': Configurazione.bonusModulo433,
    '4-5-1': Configurazione.bonusModulo451,
    '4-4-2': Configurazione.bonusModulo442,
    '3-4-3': Configurazione.bonusModulo343,
    '5-3-2': Configurazione.bonusModulo532,
    '5-4-1': Configurazione.bonusModulo541,
    '': 0,
  }

  return Configurazione.bonusModulo ? (moduloToBonusMap[modulo] ?? 0) : 0
}

export function getGiocatoriVotoInfluente(
  giocatoriFormazione: {
    ruolo: string
    idVoto: number
    voto: number | null
    ammonizione: number
    espulsione: number
    gol: number | null
    assist: number | null
    altriBonus: number | null
    autogol: number | null
    titolare: boolean
    idGiocatore: number
    votoBonus: number
    isSostituito: boolean
    isVotoInfluente: boolean
  }[],
) {
  return giocatoriFormazione.filter((c) => c.isVotoInfluente)
}

export function getBonusSenzaVoto(giocatoriInfluenti: number) {
  return (
    (11 - giocatoriInfluenti > Configurazione.maxSostituzioni
      ? Configurazione.maxSostituzioni
      : 11 - giocatoriInfluenti) * Configurazione.bonusSenzaVoto
  )
}

export function getGolSegnati(fantapunti: number): number {
  const soglieGol = {
    soglia1: 66,
    soglia2: 72,
    soglia3: 78,
    soglia4: 82,
    soglia5: 86,
    soglia6: 90,
    soglia7: 94,
    soglia8: 98,
  }

  let gol = 0

  if (fantapunti >= soglieGol.soglia1 && fantapunti < soglieGol.soglia2) {
    gol = 1
  } else if (
    fantapunti >= soglieGol.soglia2 &&
    fantapunti < soglieGol.soglia3
  ) {
    gol = 2
  } else if (
    fantapunti >= soglieGol.soglia3 &&
    fantapunti < soglieGol.soglia4
  ) {
    gol = 3
  } else if (
    fantapunti >= soglieGol.soglia4 &&
    fantapunti < soglieGol.soglia5
  ) {
    gol = 4
  } else if (
    fantapunti >= soglieGol.soglia5 &&
    fantapunti < soglieGol.soglia6
  ) {
    gol = 5
  } else if (
    fantapunti >= soglieGol.soglia6 &&
    fantapunti < soglieGol.soglia7
  ) {
    gol = 6
  } else if (
    fantapunti >= soglieGol.soglia7 &&
    fantapunti < soglieGol.soglia8
  ) {
    gol = 7
  } else if (fantapunti >= soglieGol.soglia8) {
    gol = 8
  }

  return gol
}

export async function getTabellino(idFormazione: number) {
  const giocatoriFormazione = (
    await Voti.find({
      select: { Giocatore: { ruolo: true } },
      relations: { Giocatore: true },
      where: {
        idFormazione: idFormazione,
      },
    })
  ).map((v) => ({
    ruolo: v.Giocatore.ruolo,
    idVoto: v.idVoto,
    voto: v.voto,
    ammonizione: v.ammonizione,
    espulsione: v.espulsione,
    gol: v.gol,
    assist: v.assist,
    altriBonus: v.altriBonus,
    autogol: v.autogol,
    titolare: v.titolare,
    riserva: v.riserva,
    idGiocatore: v.idGiocatore,
    votoBonus: getVotoBonus(v),
    isSostituito: false,
    isVotoInfluente: v.titolare && v.voto && v.voto > 0 ? true : false,
  }))
  const countRiserve = getCountRiserve(
    getGiocatoriVotoInfluente(giocatoriFormazione).length,
  )

  console.info(
    `Titolari influenti: ${getGiocatoriVotoInfluente(giocatoriFormazione).length}, Count Riserve: ${countRiserve}`,
  )
  if (getGiocatoriVotoInfluente(giocatoriFormazione).length < 11) {
    let iRiserve = 0
    const titolariSenzaVoto = giocatoriFormazione.filter(
      (c) => c.titolare && c.voto == 0,
    )
    const riserveConVoto = giocatoriFormazione
      .filter((c) => c.riserva !== null && c.voto && c.voto > 0)
      .sort((a, b) => {
        if (a.riserva === null) return -1
        if (b.riserva === null) return 1
        if (a.riserva !== b.riserva) return a.riserva - b.riserva
        return b.votoBonus - a.votoBonus
      })
    console.info(
      `Titolari senza voto: ${titolariSenzaVoto.length}, Riserve con voto: ${riserveConVoto.length}, Count Riserve: ${countRiserve}`,
    )

    if (titolariSenzaVoto.length > 0) {
      for (const riserva of riserveConVoto) {
        const giocatoreRuolo = titolariSenzaVoto.find(
          (c) => c.ruolo === riserva.ruolo,
        )
        if (giocatoreRuolo) {
          titolariSenzaVoto.splice(
            titolariSenzaVoto.findIndex(
              (r) => r.idVoto === giocatoreRuolo.idVoto,
            ),
            1,
          )
          if (
            riserveConVoto.find(
              (c) => c.ruolo === giocatoreRuolo.ruolo && !c.isVotoInfluente,
            )
          ) {
            // Imposta il titolare che va sostituito
            giocatoriFormazione
              .filter((c) => c.idVoto === giocatoreRuolo.idVoto)
              .forEach((c) => (c.isSostituito = true))
            // Imposta la riserva il cui voto diventa influente
            giocatoriFormazione
              .filter((c) => c.idVoto === riserva.idVoto)
              .forEach((c) => (c.isVotoInfluente = true))
            // Imposta dalla lista riserve il voto influente per non ripescarlo una seconda volta
            riserveConVoto
              .filter((c) => c.idVoto === riserva.idVoto)
              .forEach((c) => (c.isVotoInfluente = true))
            iRiserve++
          }
        }
        if (iRiserve === countRiserve) break
      }
    }
  }
  for (const g of giocatoriFormazione.filter((c) => c.isVotoInfluente)) {
    console.info(
      `idgiocatore ${g.idGiocatore} ${g.votoBonus} - sostituito: ${g.isSostituito}`,
    )
  }
  return giocatoriFormazione
}

export function getCountRiserve(titolariInfluenti: number) {
  return 11 - titolariInfluenti > Configurazione.maxSostituzioni
    ? Configurazione.maxSostituzioni
    : 11 - titolariInfluenti
}

export function getVotoBonus(voto: Voti): number {
  let bonus = 0

  // Aggiungi gli altri valori al bonus, gestendo i Decimal e i valori null
  bonus += voto.voto ?? 0
  bonus += voto.ammonizione ?? 0
  bonus += voto.espulsione ?? 0
  bonus += voto.gol ?? 0
  bonus += voto.assist ?? 0
  bonus += voto.autogol ?? 0
  bonus += voto.altriBonus ?? 0
  return bonus
}

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
