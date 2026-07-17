/**
 * probabiliFormazioniParser — parser HTML per le probabili formazioni Serie A.
 *
 * Sorgente: https://www.fantacalcio.it/probabili-formazioni-serie-a
 * Pagina server-rendered. Usa cheerio per il parsing del DOM.
 *
 * Struttura HTML rilevante:
 *   ul.match-list
 *     li.match.match-item[id="match-{id}"]
 *       h2.h5 > div.match-pill
 *         label.team-home > a.team-name > meta[itemprop="name"][content="..."]
 *         label.team-away > a.team-name > meta[itemprop="name"][content="..."]
 *       div.row.col-sm
 *         div.card.team-card.dark  (ripetuto 2 volte: home, away)
 *           header > h3.team-name
 *           ul.player-list.starters > li.player-item.pill[data-status]
 *           ul.player-list.reserves > li.player-item.pill[data-status]
 *             span.role[data-value="p|d|c|a"]
 *             a.player-name > span  (testo nome)
 *             div.progress-bar[aria-valuenow="{0-100}"]
 */

import * as cheerio from 'cheerio'
import type { AnyNode } from 'domhandler'

// ─── Tipi pubblici ────────────────────────────────────────────────────────────

export interface GiocatoreProbabile {
  /** Nome come appare nella fonte, es. "Lautaro Martinez", "De Gea" */
  nome: string
  /** Ruolo normalizzato uppercase: P, D, C, A */
  ruolo: string
  /** Probabilità 0-100 */
  probabilita: number
  /** Stato fonte (data-status): "success", "warn", "danger", … */
  statoSorgente: string
  /** Stato così come esposto dalla fonte; fallback sul tipo di lista. */
  stato: string
  /** Nome squadra come appare nella fonte, es. "Fiorentina" */
  squadra: string
}

export interface MatchProbabile {
  /** Nome match nel formato "Home-Away", es. "Fiorentina-Atalanta" */
  partita: string
  squadraHome: string
  squadraAway: string
  giocatori: GiocatoreProbabile[]
}

export interface ParseResult {
  matches: MatchProbabile[]
}

export interface ParseOptions {
  expectedMatchCount?: number
  minimumPlayersPerTeam?: number
}

// ─── Parser principale ────────────────────────────────────────────────────────

/**
 * Parsa l'HTML della pagina probabili formazioni di fantacalcio.it.
 * Lancia un errore esplicito se non produce match validi, entrambe le squadre
 * per match, o giocatori — evitando una sostituzione vuota.
 */
export function parseProbabiliFormazioni(
  html: string,
  options: ParseOptions = {},
): ParseResult {
  const $ = cheerio.load(html)
  const matches: MatchProbabile[] = []

  $('li.match.match-item').each((_, matchEl) => {
    const $match = $(matchEl)

    // ── Nomi squadre dal match-pill ──────────────────────────────────────────
    const homeName = $match
      .find('label.team-home meta[itemprop="name"]')
      .attr('content')
      ?.trim()
    const awayName = $match
      .find('label.team-away meta[itemprop="name"]')
      .attr('content')
      ?.trim()

    if (!homeName || !awayName) {
      console.warn(
        '[probabiliFormazioniParser] Match senza squadre home/away, skip',
      )
      return // continue each
    }

    const partita = `${homeName}-${awayName}`
    const giocatori: GiocatoreProbabile[] = []

    // ── Team cards (home = prima, away = seconda) ────────────────────────────
    $match.find('div.card.team-card').each((_, teamCardEl) => {
      const $card = $(teamCardEl)
      const teamName = $card.find('h3.team-name').first().text().trim()

      if (!teamName) return

      // Titolari
      $card
        .find('ul.player-list.starters li.player-item')
        .each((_, playerEl) => {
          const player = extractPlayer($, playerEl, teamName, 'titolare')
          if (player) giocatori.push(player)
        })

      // Riserve / panchina
      $card
        .find('ul.player-list.reserves li.player-item')
        .each((_, playerEl) => {
          const player = extractPlayer($, playerEl, teamName, 'riserva')
          if (player) giocatori.push(player)
        })
    })

    // Verifica minima: almeno 1 giocatore per ciascuna squadra
    const homeCount = giocatori.filter((g) => g.squadra === homeName).length
    const awayCount = giocatori.filter((g) => g.squadra === awayName).length

    const minimumPlayersPerTeam = options.minimumPlayersPerTeam ?? 1
    if (
      homeCount < minimumPlayersPerTeam ||
      awayCount < minimumPlayersPerTeam
    ) {
      console.warn(
        `[probabiliFormazioniParser] Match ${partita}: home=${homeCount} ` +
          `away=${awayCount} giocatori, minimo=${minimumPlayersPerTeam} — skip`,
      )
      return
    }

    matches.push({
      partita,
      squadraHome: homeName,
      squadraAway: awayName,
      giocatori,
    })
  })

  // ── Validazione finale ───────────────────────────────────────────────────────
  if (matches.length === 0) {
    throw new Error(
      '[probabiliFormazioniParser] Nessun match valido estratto dalla pagina. ' +
        'Controllare che la struttura HTML non sia cambiata.',
    )
  }

  if (
    options.expectedMatchCount !== undefined &&
    matches.length !== options.expectedMatchCount
  ) {
    throw new Error(
      `[probabiliFormazioniParser] Estratti ${matches.length} match, ` +
        `attesi ${options.expectedMatchCount}. Import annullato.`,
    )
  }

  const matchSenzaGiocatori = matches.filter((m) => m.giocatori.length === 0)
  if (matchSenzaGiocatori.length > 0) {
    throw new Error(
      `[probabiliFormazioniParser] Match senza giocatori: ${matchSenzaGiocatori.map((m) => m.partita).join(', ')}`,
    )
  }

  return { matches }
}

// ─── Helper privati ───────────────────────────────────────────────────────────

function extractPlayer(
  $: ReturnType<typeof cheerio.load>,
  playerEl: AnyNode,
  squadra: string,
  listType: 'titolare' | 'riserva',
): GiocatoreProbabile | null {
  const $p = $(playerEl)

  const ruoloRaw = $p.find('span.role').attr('data-value') ?? ''
  const ruolo = ruoloRaw.toUpperCase()

  // Prende il primo <span> diretto dentro .player-name (non gli img/altri)
  const nome = $p.find('a.player-name span').first().text().trim()

  const probabilitaStr = $p.find('div.progress-bar').attr('aria-valuenow')
  const probabilita = Number(probabilitaStr)

  const statoSorgente = ($p.attr('data-status') ?? '').trim()
  const stato = statoSorgente || listType

  if (
    !nome ||
    !ruolo ||
    !Number.isInteger(probabilita) ||
    probabilita < 0 ||
    probabilita > 100
  ) {
    throw new Error(
      `[probabiliFormazioniParser] Giocatore non valido per ${squadra}: ` +
        `nome="${nome}", ruolo="${ruolo}", probabilita="${probabilitaStr ?? ''}"`,
    )
  }

  return { nome, ruolo, probabilita, statoSorgente, stato, squadra }
}
