/**
 * Test per probabiliFormazioniParser e probabiliFormazioniMatcher.
 *
 * Isolato: nessuna connessione DB, nessuna fetch HTTP.
 */

import { describe, it, expect } from 'vitest'
import { parseProbabiliFormazioni } from '../probabiliFormazioniParser'
import {
  calcolaSomiglianza,
  tokenizza,
  normalizzaNomePerMatch,
  normalizzaSquadra,
  matchGiocatore,
  type CandidatesByTeam,
} from '../probabiliFormazioniMatcher'
import { isInProbabiliFormazioniWindow } from '../probabiliFormazioniWindow'

// ─── HTML fixtures ────────────────────────────────────────────────────────────

/** Genera un li.player-item.pill minimal valido */
function playerItemHtml(opts: {
  role: string
  name: string
  probability: number
  status: string
}): string {
  return `
    <li class="player-item pill" data-status="${opts.status}">
      <span class="role" data-value="${opts.role}"></span>
      <a class="player-name player-link" href="#">
        <span>${opts.name}</span>
      </a>
      <div class="progress progress-starter">
        <div class="progress-bar" role="progressbar"
          style="--value:${opts.probability}"
          aria-valuenow="${opts.probability}"
          aria-valuemin="0"
          aria-valuemax="100"></div>
      </div>
      <div class="progress-value">${opts.probability}%</div>
    </li>
  `
}

/** Genera un div.card.team-card.dark minimal con starters e riserve */
function teamCardHtml(
  teamName: string,
  starters: string,
  reserves: string,
): string {
  return `
    <div class="card team-card dark col mt-4">
      <header>
        <h3 class="h6 team-name">${teamName}</h3>
      </header>
      <ul class="player-list starters">
        ${starters}
      </ul>
      <label class="mb-2">Panchina</label>
      <ul class="player-list reserves">
        ${reserves}
      </ul>
    </div>
  `
}

/** Genera il match-pill con meta itemprop */
function matchPillHtml(home: string, away: string): string {
  return `
    <div class="match-pill theme-light size-large match-status-0" data-match-status="0">
      <label itemprop="homeTeam" itemscope itemtype="http://schema.org/SportsTeam"
        for="team-1" class="team-home">
        <a class="team-name team-link" href="#">
          <meta itemprop="name" content="${home}" />
          ${home.substring(0, 3)}
        </a>
      </label>
      <label itemprop="awayTeam" itemscope itemtype="http://schema.org/SportsTeam"
        for="team-2" class="team-away">
        <a class="team-name team-link" href="#">
          <meta itemprop="name" content="${away}" />
          ${away.substring(0, 3)}
        </a>
      </label>
    </div>
  `
}

/** Genera un li.match.match-item completo */
function matchItemHtml(
  home: string,
  away: string,
  homeStarters: string,
  homeReserves: string,
  awayStarters: string,
  awayReserves: string,
): string {
  return `
    <li class="match match-item" id="match-1" data-match-id="1">
      <h2 class="h5">
        ${matchPillHtml(home, away)}
      </h2>
      <div class="row col-sm">
        ${teamCardHtml(home, homeStarters, homeReserves)}
        ${teamCardHtml(away, awayStarters, awayReserves)}
      </div>
    </li>
  `
}

/** Genera la pagina HTML completa con ul.match-list */
function pageHtml(matchItems: string): string {
  return `
    <html><body>
      <ul class="match-list">
        ${matchItems}
      </ul>
    </body></html>
  `
}

// ─── Fixtures concrete ────────────────────────────────────────────────────────

const FIORENTINA_STARTERS = `
  ${playerItemHtml({ role: 'p', name: 'Christensen O.', probability: 100, status: 'success' })}
  ${playerItemHtml({ role: 'd', name: 'Dodò', probability: 100, status: 'success' })}
  ${playerItemHtml({ role: 'd', name: 'Comuzzo', probability: 100, status: 'success' })}
  ${playerItemHtml({ role: 'c', name: 'Fabbian', probability: 100, status: 'success' })}
  ${playerItemHtml({ role: 'a', name: 'Gudmundsson A.', probability: 100, status: 'success' })}
`

const FIORENTINA_RESERVES = `
  ${playerItemHtml({ role: 'p', name: 'De Gea', probability: 5, status: 'warn' })}
  ${playerItemHtml({ role: 'd', name: 'Pongracic', probability: 50, status: 'warn' })}
`

const ATALANTA_STARTERS = `
  ${playerItemHtml({ role: 'p', name: 'Carnesecchi', probability: 100, status: 'success' })}
  ${playerItemHtml({ role: 'd', name: 'Scalvini', probability: 100, status: 'success' })}
  ${playerItemHtml({ role: 'c', name: 'De Roon', probability: 100, status: 'success' })}
  ${playerItemHtml({ role: 'a', name: 'Lookman', probability: 100, status: 'success' })}
`

const ATALANTA_RESERVES = `
  ${playerItemHtml({ role: 'p', name: 'Sportiello', probability: 5, status: 'warn' })}
`

const FULL_PAGE_HTML = pageHtml(
  matchItemHtml(
    'Fiorentina',
    'Atalanta',
    FIORENTINA_STARTERS,
    FIORENTINA_RESERVES,
    ATALANTA_STARTERS,
    ATALANTA_RESERVES,
  ),
)

// ─── Parser tests ─────────────────────────────────────────────────────────────

describe('parseProbabiliFormazioni', () => {
  it('estrae un match con partita Home-Away', () => {
    const { matches } = parseProbabiliFormazioni(FULL_PAGE_HTML, {
      expectedMatchCount: 1,
    })
    expect(matches).toHaveLength(1)
    expect(matches[0].partita).toBe('Fiorentina-Atalanta')
    expect(matches[0].squadraHome).toBe('Fiorentina')
    expect(matches[0].squadraAway).toBe('Atalanta')
  })

  it('estrae i giocatori di entrambe le squadre', () => {
    const { matches } = parseProbabiliFormazioni(FULL_PAGE_HTML, {
      expectedMatchCount: 1,
    })
    const giocatori = matches[0].giocatori
    const fiorentina = giocatori.filter((g) => g.squadra === 'Fiorentina')
    const atalanta = giocatori.filter((g) => g.squadra === 'Atalanta')
    expect(fiorentina.length).toBeGreaterThanOrEqual(5)
    expect(atalanta.length).toBeGreaterThanOrEqual(4)
  })

  it('normalizza il ruolo in uppercase', () => {
    const { matches } = parseProbabiliFormazioni(FULL_PAGE_HTML, {
      expectedMatchCount: 1,
    })
    const portiere = matches[0].giocatori.find(
      (g) => g.nome === 'Christensen O.',
    )
    expect(portiere?.ruolo).toBe('P')
  })

  it('estrae la probabilità corretta', () => {
    const { matches } = parseProbabiliFormazioni(FULL_PAGE_HTML, {
      expectedMatchCount: 1,
    })
    const deGea = matches[0].giocatori.find((g) => g.nome === 'De Gea')
    expect(deGea?.probabilita).toBe(5)
  })

  it('salva lo stato sorgente dei titolari', () => {
    const { matches } = parseProbabiliFormazioni(FULL_PAGE_HTML, {
      expectedMatchCount: 1,
    })
    const carnesecchi = matches[0].giocatori.find(
      (g) => g.nome === 'Carnesecchi',
    )
    expect(carnesecchi?.stato).toBe('success')
  })

  it('salva lo stato sorgente delle riserve', () => {
    const { matches } = parseProbabiliFormazioni(FULL_PAGE_HTML, {
      expectedMatchCount: 1,
    })
    const sportiello = matches[0].giocatori.find((g) => g.nome === 'Sportiello')
    expect(sportiello?.stato).toBe('warn')
  })

  it('preserva data-status originale in statoSorgente', () => {
    const { matches } = parseProbabiliFormazioni(FULL_PAGE_HTML, {
      expectedMatchCount: 1,
    })
    const starter = matches[0].giocatori.find((g) => g.nome === 'Lookman')
    const reserve = matches[0].giocatori.find((g) => g.nome === 'Sportiello')
    expect(starter?.statoSorgente).toBe('success')
    expect(reserve?.statoSorgente).toBe('warn')
  })

  it('lancia un errore se il DOM non produce match', () => {
    expect(() =>
      parseProbabiliFormazioni('<html><body></body></html>'),
    ).toThrow()
  })

  it('salta i match con una squadra senza giocatori', () => {
    const partialHtml = pageHtml(
      matchItemHtml(
        'Fiorentina',
        'Atalanta',
        FIORENTINA_STARTERS,
        '', // homeReserves ok
        '', // awayStarters vuoto → atalanta ha 0 giocatori
        '',
      ),
    )
    // Il match viene saltato perché awayCount = 0 → nessun match valido → errore
    expect(() => parseProbabiliFormazioni(partialHtml)).toThrow()
  })

  it('parsifica più match nella stessa pagina', () => {
    const twoMatchHtml = pageHtml(
      matchItemHtml(
        'Fiorentina',
        'Atalanta',
        FIORENTINA_STARTERS,
        '',
        ATALANTA_STARTERS,
        '',
      ) +
        matchItemHtml(
          'Bologna',
          'Inter',
          ATALANTA_STARTERS,
          '',
          FIORENTINA_STARTERS,
          '',
        ),
    )
    const { matches } = parseProbabiliFormazioni(twoMatchHtml, {
      expectedMatchCount: 2,
    })
    expect(matches).toHaveLength(2)
    expect(matches[0].partita).toBe('Fiorentina-Atalanta')
    expect(matches[1].partita).toBe('Bologna-Inter')
  })
})

// ─── Matcher tests ────────────────────────────────────────────────────────────

describe('normalizzaNomePerMatch', () => {
  it('porta in uppercase e rimuove diacritici', () => {
    expect(normalizzaNomePerMatch('Dodò')).toBe('DODO')
    expect(normalizzaNomePerMatch('Martínez')).toBe('MARTINEZ')
    expect(normalizzaNomePerMatch('Ñiguez')).toBe('NIGUEZ')
  })

  it('rimuove apostrofi', () => {
    expect(normalizzaNomePerMatch("D'Ambrosio")).toBe('DAMBROSIO')
  })

  it('converte trattini in spazio', () => {
    expect(normalizzaNomePerMatch('Ben-Yedder')).toBe('BEN YEDDER')
  })

  it('rimuove i punti', () => {
    expect(normalizzaNomePerMatch('Lautaro M.')).toBe('LAUTARO M')
  })
})

describe('tokenizza', () => {
  it('restituisce token >= 2 caratteri', () => {
    expect(tokenizza('Lautaro Martinez')).toEqual(['LAUTARO', 'MARTINEZ'])
  })

  it('mantiene particelle come DE, VAN', () => {
    expect(tokenizza('De Vrij')).toEqual(['DE', 'VRIJ'])
  })

  it('gestisce iniziali (rimuove lettere singole)', () => {
    // "L." → normalizzato "L" → 1 char → rimosso
    expect(tokenizza('Lautaro L.')).toEqual(['LAUTARO'])
  })

  it('gestisce nomi con iniziale solo come secondo token', () => {
    // "CHRISTENSEN O." → tokens: CHRISTENSEN (O rimosso - 1 char)
    expect(tokenizza('Christensen O.')).toEqual(['CHRISTENSEN'])
  })
})

describe('calcolaSomiglianza', () => {
  it('match perfetto: score = 1', () => {
    expect(
      calcolaSomiglianza(['LAUTARO', 'MARTINEZ'], 'LAUTARO MARTINEZ'),
    ).toBe(1)
  })

  it('match parziale per iniziale DB: L. → LAUTARO', () => {
    // DB: "MARTINEZ L." → tokenizza DB: ["MARTINEZ", "L"]
    // Source tokens: ["LAUTARO", "MARTINEZ"]
    // LAUTARO matches "L" (dt="L", st.startsWith(dt)) → match
    // MARTINEZ matches "MARTINEZ" → match
    expect(calcolaSomiglianza(['LAUTARO', 'MARTINEZ'], 'MARTINEZ L.')).toBe(1)
  })

  it('match su cognome unico', () => {
    expect(calcolaSomiglianza(['COMUZZO'], 'COMUZZO')).toBe(1)
    expect(calcolaSomiglianza(['CHRISTENSEN'], 'CHRISTENSEN O.')).toBe(1)
  })

  it('nessun match → score = 0', () => {
    expect(calcolaSomiglianza(['RONALDO'], 'MESSI')).toBe(0)
  })

  it('match parziale: metà dei token', () => {
    const score = calcolaSomiglianza(['LAUTARO', 'MARTINEZ'], 'MARTINEZ')
    expect(score).toBe(0.5)
  })

  it('gestisce nomi composti con DE', () => {
    expect(calcolaSomiglianza(['DE', 'VRIJ'], 'DE VRIJ')).toBe(1)
    expect(calcolaSomiglianza(['DE', 'VRIJ'], 'DE VRIJ S.')).toBe(1)
  })
})

describe('normalizzaSquadra', () => {
  it('riconosce Inter con varianti', () => {
    expect(normalizzaSquadra('Inter')).toBe('inter')
    expect(normalizzaSquadra('FC Internazionale')).toBe('inter')
    expect(normalizzaSquadra('internazionale')).toBe('inter')
  })

  it('riconosce Milan', () => {
    expect(normalizzaSquadra('Milan')).toBe('milan')
    expect(normalizzaSquadra('AC Milan')).toBe('milan')
  })

  it('riconosce Hellas Verona da entrambe le varianti (stessa chiave canonica)', () => {
    // Sia "Verona" che "Hellas Verona" si riferiscono alla stessa squadra →
    // entrambi devono restituire la stessa chiave canonica.
    const veronaKey = normalizzaSquadra('Verona')
    const hellasKey = normalizzaSquadra('Hellas Verona')
    expect(veronaKey).toBeTruthy()
    expect(hellasKey).toBeTruthy()
    // Devono puntare alla stessa squadra (stessa chiave)
    expect(veronaKey).toBe(hellasKey)
  })

  it('ritorna lowercase per squadre non mappate', () => {
    expect(normalizzaSquadra('Siracusa')).toBe('siracusa')
  })

  it('gestisce stringa vuota', () => {
    expect(normalizzaSquadra('')).toBe('')
  })
})

describe('matchGiocatore', () => {
  const candidati: CandidatesByTeam = {
    byTeam: {
      inter: [
        { idGiocatore: 1, nome: 'LAUTARO MARTINEZ', ruolo: 'A' },
        { idGiocatore: 2, nome: 'MARTINEZ L.', ruolo: 'A' },
        { idGiocatore: 3, nome: 'DUMFRIES', ruolo: 'D' },
        { idGiocatore: 4, nome: 'DE VRIJ', ruolo: 'D' },
      ],
      fiorentina: [
        { idGiocatore: 10, nome: 'CHRISTENSEN O.', ruolo: 'P' },
        { idGiocatore: 11, nome: 'DODO', ruolo: 'D' },
      ],
    },
  }

  it('trova il giocatore per nome esatto', () => {
    const result = matchGiocatore('Lautaro Martinez', 'A', 'Inter', candidati)
    expect(result.idGiocatore).toBe(1)
    expect(result.score).toBe(1)
  })

  describe('isInProbabiliFormazioniWindow', () => {
    const dataInizio = new Date('2026-08-22T18:45:00.000Z')

    it('include esattamente le 48 ore precedenti', () => {
      expect(
        isInProbabiliFormazioniWindow(
          new Date('2026-08-20T18:45:00.000Z'),
          dataInizio,
        ),
      ).toBe(true)
    })

    it('esclude gli istanti precedenti alle 48 ore', () => {
      expect(
        isInProbabiliFormazioniWindow(
          new Date('2026-08-20T18:44:59.999Z'),
          dataInizio,
        ),
      ).toBe(false)
    })

    it('esclude il momento di inizio e gli istanti successivi', () => {
      expect(isInProbabiliFormazioniWindow(dataInizio, dataInizio)).toBe(false)
      expect(
        isInProbabiliFormazioniWindow(
          new Date('2026-08-22T18:45:00.001Z'),
          dataInizio,
        ),
      ).toBe(false)
    })
  })

  it('trova il portiere con iniziale nel nome DB', () => {
    const result = matchGiocatore(
      'Christensen O.',
      'P',
      'Fiorentina',
      candidati,
    )
    expect(result.idGiocatore).toBe(10)
    expect(result.score).toBe(1)
  })

  it('trova Dodo nonostante accento rimosso', () => {
    const result = matchGiocatore('Dodò', 'D', 'Fiorentina', candidati)
    expect(result.idGiocatore).toBe(11)
    expect(result.score).toBe(1)
  })

  it('trova De Vrij per nome composto', () => {
    const result = matchGiocatore('De Vrij', 'D', 'Inter', candidati)
    expect(result.idGiocatore).toBe(4)
    expect(result.score).toBe(1)
  })

  it('restituisce idGiocatore=null per squadra sconosciuta', () => {
    const result = matchGiocatore('Messi', 'A', 'Barcellona', candidati)
    expect(result.idGiocatore).toBeNull()
    expect(result.score).toBe(0)
  })

  it('restituisce idGiocatore=null se nessun token corrisponde', () => {
    const result = matchGiocatore('Bonucci', 'D', 'Inter', candidati)
    expect(result.idGiocatore).toBeNull()
  })

  it('ignora le particelle comuni quando esistono token più significativi', () => {
    const result = matchGiocatore(
      'De Roon',
      'C',
      'Atalanta',
      {
        byTeam: {
          atalanta: [
            { idGiocatore: 20, nome: 'DE KETELAERE C.', ruolo: 'C' },
          ],
        },
      },
    )
    expect(result.idGiocatore).toBeNull()
  })

  it('sceglie deterministicamente tra candidati con stesso score (idGiocatore ASC)', () => {
    // LAUTARO MARTINEZ (id=1) e MARTINEZ L. (id=2) hanno entrambi score=1 per "Martinez"
    // ma solo id=1 "LAUTARO MARTINEZ" ha score=1 per "Lautaro Martinez" completo
    const result = matchGiocatore('Lautaro Martinez', 'A', 'Inter', candidati)
    // Entrambi i candidati 1 e 2 → score di 1 per tokens ["LAUTARO","MARTINEZ"]
    // id=1 LAUTARO MARTINEZ: LAUTARO matches LAUTARO → 2/2 = 1.0
    // id=2 MARTINEZ L.: LAUTARO matches L (iniziale) → 2/2 = 1.0
    // Tie → ASC idGiocatore → id=1
    expect(result.idGiocatore).toBe(1)
  })

  it('usa il ruolo solo come bonus, non come filtro obbligatorio', () => {
    // Dumfries è D ma fonte dice "C" - deve trovarlo ugualmente
    const result = matchGiocatore('Dumfries', 'C', 'Inter', candidati)
    expect(result.idGiocatore).toBe(3)
    expect(result.score).toBeGreaterThan(0)
  })
})
