/**
 * probabiliFormazioniSosfantaParser — parser HTML per le probabili formazioni
 * Serie A dalla fonte secondaria sosfanta.com.
 *
 * Sorgente: https://www.sosfanta.com/lista-formazioni/probabili-formazioni-serie-a/
 * Pagina server-rendered. Usa cheerio per il parsing del DOM.
 *
 * Struttura HTML rilevante (verificata via fetch live):
 *   section.flex.flex-col.gap-8.md\:gap-16
 *     article[data-match-id="{home-slug}-{away-slug}"]
 *       header
 *         h2  → nome squadra home (prima occorrenza)
 *         h2  → nome squadra away (seconda occorrenza, class "text-right")
 *       section (una per ciascuna delle 3 possibili, individuata da h3):
 *         h3 → "Titolari" | "Ballottaggi" | "Panchina"
 *         div.grid.grid-cols-2.gap-8
 *           ul  → giocatori squadra home
 *           ul  → giocatori squadra away
 *             li
 *               span (testo "NN%")            → probabilità
 *               span.truncate                  → nome giocatore
 *
 * NOTA "Ballottaggi": a differenza di Titolari/Panchina, ogni <li> di questa
 * sezione rappresenta un DUELLO tra due giocatori per lo stesso posto: contiene
 * 2 span di percentuale e un unico span.truncate con i due nomi separati da
 * " - " (es. "Moreno M. - Juan Jesus" con percentuali "60%"/"40%"). Vengono
 * quindi generati 2 SosfantaPlayer da un solo <li>, associando le percentuali
 * ai nomi nello stesso ordine in cui compaiono nel markup.
 *
 * Questa fonte è secondaria/best-effort: non lancia eccezioni per anomalie
 * strutturali puntuali (match o giocatori singoli), che vengono solo loggate
 * con console.warn e scartate. Lancia solo se l'intera pagina non produce
 * nessun giocatore, segnale che la struttura del sito è cambiata radicalmente.
 */

import * as cheerio from 'cheerio'
import type { Cheerio } from 'cheerio'
import type { AnyNode, Element } from 'domhandler'

// ─── Tipi pubblici ────────────────────────────────────────────────────────────

export interface SosfantaPlayer {
  /** Nome come appare nella fonte, es. "Stankovic F.", "Lautaro Martinez" */
  nome: string
  /** Nome squadra come appare nella fonte, es. "Fiorentina" */
  squadra: string
  /** Probabilità 0-100 */
  probabilita: number
}

export interface SosfantaParseResult {
  players: SosfantaPlayer[]
}

// ─── Costanti ─────────────────────────────────────────────────────────────────

const SEZIONI_NOTE = new Set(['Titolari', 'Ballottaggi', 'Panchina'])
const PERCENTUALE_REGEX = /^(\d{1,3})%$/

// ─── Parser principale ────────────────────────────────────────────────────────

/**
 * Parsa l'HTML della pagina probabili formazioni di sosfanta.com.
 * Best-effort: logga e scarta match/giocatori anomali invece di lanciare,
 * salvo il caso di zero giocatori estratti sull'intera pagina.
 */
export function parseSosfantaProbabiliFormazioni(
  html: string,
): SosfantaParseResult {
  const $ = cheerio.load(html)
  const players: SosfantaPlayer[] = []

  $('article[data-match-id]').each((_, matchEl) => {
    const $match = $(matchEl)
    const matchId = $match.attr('data-match-id') ?? '(sconosciuto)'

    const $teamHeadings = $match.find('header h2')
    const homeName = $teamHeadings.eq(0).text().trim()
    const awayName = $teamHeadings.eq(1).text().trim()

    if (!homeName || !awayName) {
      console.warn(
        `[probabiliFormazioniSosfantaParser] Match ${matchId}: squadre home/away mancanti, skip`,
      )
      return // continue each
    }

    $match.find('section').each((_, sectionEl) => {
      const $section = $(sectionEl)
      const label = $section.find('h3').first().text().trim()

      if (!SEZIONI_NOTE.has(label)) return // sezione non riconosciuta, ignora

      const $uls = $section.find('div.grid.grid-cols-2 ul')
      if ($uls.length < 2) {
        console.warn(
          `[probabiliFormazioniSosfantaParser] Match ${matchId} sezione "${label}": ` +
            `struttura liste inattesa (trovate ${$uls.length}), skip`,
        )
        return
      }

      extractPlayersFromList($, $uls.eq(0), homeName, matchId, label, players)
      extractPlayersFromList($, $uls.eq(1), awayName, matchId, label, players)
    })
  })

  if (players.length === 0) {
    throw new Error(
      '[probabiliFormazioniSosfantaParser] Nessun giocatore estratto dalla pagina. ' +
        'Controllare che la struttura HTML non sia cambiata.',
    )
  }

  return { players }
}

// ─── Helper privati ───────────────────────────────────────────────────────────

function extractPlayersFromList(
  $: ReturnType<typeof cheerio.load>,
  $ul: Cheerio<Element>,
  squadra: string,
  matchId: string,
  sezione: string,
  out: SosfantaPlayer[],
): void {
  $ul.find('li').each((_, liEl) => {
    const player = extractPlayersFromLi($, liEl, squadra, matchId, sezione)
    out.push(...player)
  })
}

function extractPlayersFromLi(
  $: ReturnType<typeof cheerio.load>,
  liEl: AnyNode,
  squadra: string,
  matchId: string,
  sezione: string,
): SosfantaPlayer[] {
  const $li = $(liEl)

  const nomeText = $li
    .find('span.truncate')
    .first()
    .text()
    .trim()
    .replace(/\s+/g, ' ')

  const percentuali = $li
    .find('span')
    .filter((_, el) => PERCENTUALE_REGEX.test($(el).text().trim()))
    .map((_, el) => Number($(el).text().trim().replace('%', '')))
    .get()

  if (!nomeText || percentuali.length === 0) {
    console.warn(
      `[probabiliFormazioniSosfantaParser] Match ${matchId} sezione "${sezione}": ` +
        `giocatore non estraibile (nome="${nomeText}"), skip`,
    )
    return []
  }

  // Caso "Ballottaggi": un <li> con 2 nomi separati da " - " e 2 percentuali.
  const nomiDuello = nomeText.split(' - ').map((n) => n.trim())
  if (nomiDuello.length === 2 && percentuali.length === 2) {
    const risultato: SosfantaPlayer[] = []
    for (let i = 0; i < 2; i++) {
      const player = buildPlayer(
        nomiDuello[i],
        squadra,
        percentuali[i],
        matchId,
        sezione,
      )
      if (player) risultato.push(player)
    }
    return risultato
  }

  // Caso semplice: 1 nome, 1 percentuale
  if (nomiDuello.length === 1 && percentuali.length === 1) {
    const player = buildPlayer(
      nomeText,
      squadra,
      percentuali[0],
      matchId,
      sezione,
    )
    return player ? [player] : []
  }

  console.warn(
    `[probabiliFormazioniSosfantaParser] Match ${matchId} sezione "${sezione}": ` +
      `struttura giocatore anomala (nome="${nomeText}", percentuali=${percentuali.length}), skip`,
  )
  return []
}

function buildPlayer(
  nome: string,
  squadra: string,
  probabilita: number,
  matchId: string,
  sezione: string,
): SosfantaPlayer | null {
  if (
    !nome ||
    !Number.isInteger(probabilita) ||
    probabilita < 0 ||
    probabilita > 100
  ) {
    console.warn(
      `[probabiliFormazioniSosfantaParser] Match ${matchId} sezione "${sezione}": ` +
        `probabilità non valida per "${nome}" (${probabilita}), skip`,
    )
    return null
  }

  return { nome, squadra, probabilita }
}
