/**
 * Test per probabiliFormazioniSosfantaParser.
 *
 * Testa il parser HTML della fonte secondaria sosfanta.com.
 * Isolato: nessuna dipendenza da I/O, DB, fetch HTTP, ecc.
 */

import { describe, it, expect, vi } from 'vitest'
import {
  parseSosfantaProbabiliFormazioni,
  type SosfantaPlayer,
} from '../probabiliFormazioniSosfantaParser'

// ─── HTML fixtures ────────────────────────────────────────────────────────────

/** Genera un <li> con giocatore(i), percentuale(i), e nome(i) */
function playerLiHtml(opts: {
  names: string[] // nomi singoli, o coppia per ballottaggio "Name1 - Name2"
  percentages: number[] // percentuali
}): string {
  const nameHtml = opts.names.map((n) => n).join(' - ')
  const percentHtml = opts.percentages.map((p) => `<span>${p}%</span>`).join('\n        ')

  return `
      <li>
        ${percentHtml}
        <span class="truncate">${nameHtml}</span>
      </li>
  `
}

/** Genera una sezione (Titolari, Ballottaggi, o Panchina) con liste home/away */
function sectionHtml(opts: {
  label: string // "Titolari", "Ballottaggi", "Panchina"
  homePlayersHtml: string
  awayPlayersHtml: string
}): string {
  return `
    <section>
      <h3>${opts.label}</h3>
      <div class="grid grid-cols-2 gap-8">
        <ul>
          ${opts.homePlayersHtml}
        </ul>
        <ul>
          ${opts.awayPlayersHtml}
        </ul>
      </div>
    </section>
  `
}

/** Genera un articolo match completo con squadre e sezioni */
function articleHtml(opts: {
  matchId: string
  homeTeam: string
  awayTeam: string
  sections: string
}): string {
  return `
    <article data-match-id="${opts.matchId}">
      <header>
        <h2>${opts.homeTeam}</h2>
        <h2 class="text-right">${opts.awayTeam}</h2>
      </header>
      ${opts.sections}
    </article>
  `
}

/** Genera una pagina HTML completa con articoli */
function pageHtml(articlesHtml: string): string {
  return `
    <html>
      <body>
        <section class="flex flex-col gap-8 md:gap-16">
          ${articlesHtml}
        </section>
      </body>
    </html>
  `
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('parseSosfantaProbabiliFormazioni', () => {
  // ─── Caso base: un match con una sezione semplice ────────────────────────

  it('estrae un match con una sezione Titolari', () => {
    const html = pageHtml(
      articleHtml({
        matchId: 'fiorentina-atalanta',
        homeTeam: 'Fiorentina',
        awayTeam: 'Atalanta',
        sections: sectionHtml({
          label: 'Titolari',
          homePlayersHtml: playerLiHtml({
            names: ['Christensen O.'],
            percentages: [100],
          }),
          awayPlayersHtml: playerLiHtml({
            names: ['Carnesecchi'],
            percentages: [100],
          }),
        }),
      }),
    )

    const result = parseSosfantaProbabiliFormazioni(html)

    expect(result.players).toHaveLength(2)
    expect(result.players[0]).toEqual<SosfantaPlayer>({
      nome: 'Christensen O.',
      squadra: 'Fiorentina',
      probabilita: 100,
    })
    expect(result.players[1]).toEqual<SosfantaPlayer>({
      nome: 'Carnesecchi',
      squadra: 'Atalanta',
      probabilita: 100,
    })
  })

  // ─── Sezione Ballottaggi con duel (2 nomi, 2 percentuali) ─────────────────

  it('estrae un ballottaggio con 2 nomi e 2 percentuali come 2 SosfantaPlayer', () => {
    const html = pageHtml(
      articleHtml({
        matchId: 'test-duel',
        homeTeam: 'Fiorentina',
        awayTeam: 'Atalanta',
        sections: sectionHtml({
          label: 'Ballottaggi',
          homePlayersHtml: playerLiHtml({
            names: ['Dodò', 'Pongracic'],
            percentages: [60, 40],
          }),
          awayPlayersHtml: playerLiHtml({
            names: ['Scalvini'],
            percentages: [100],
          }),
        }),
      }),
    )

    const result = parseSosfantaProbabiliFormazioni(html)

    // Home: 2 giocatori dal duel (Dodò 60%, Pongracic 40%)
    // Away: 1 giocatore (Scalvini 100%)
    expect(result.players).toHaveLength(3)

    const homePlayerDuel = result.players.filter((p) => p.squadra === 'Fiorentina')
    expect(homePlayerDuel).toHaveLength(2)
    expect(homePlayerDuel[0].nome).toBe('Dodò')
    expect(homePlayerDuel[0].probabilita).toBe(60)
    expect(homePlayerDuel[1].nome).toBe('Pongracic')
    expect(homePlayerDuel[1].probabilita).toBe(40)
  })

  it('associa correttamente le percentuali ai nomi nei duelli', () => {
    const html = pageHtml(
      articleHtml({
        matchId: 'duel-order',
        homeTeam: 'Inter',
        awayTeam: 'Milan',
        sections: sectionHtml({
          label: 'Ballottaggi',
          homePlayersHtml: playerLiHtml({
            names: ['Moreno M. - Juan Jesus'],
            percentages: [60, 40],
          }),
          awayPlayersHtml: playerLiHtml({
            names: ['Player1'],
            percentages: [50],
          }),
        }),
      }),
    )

    const result = parseSosfantaProbabiliFormazioni(html)

    const interPlayers = result.players.filter((p) => p.squadra === 'Inter')
    expect(interPlayers).toHaveLength(2)
    // Il primo nome deve associarsi alla prima percentuale
    expect(interPlayers[0]).toEqual<SosfantaPlayer>({
      nome: 'Moreno M.',
      squadra: 'Inter',
      probabilita: 60,
    })
    // Il secondo nome deve associarsi alla seconda percentuale
    expect(interPlayers[1]).toEqual<SosfantaPlayer>({
      nome: 'Juan Jesus',
      squadra: 'Inter',
      probabilita: 40,
    })
  })

  // ─── Sezione Panchina (riserve) ────────────────────────────────────────────

  it('estrae giocatori dalla sezione Panchina', () => {
    const html = pageHtml(
      articleHtml({
        matchId: 'bench-test',
        homeTeam: 'Fiorentina',
        awayTeam: 'Atalanta',
        sections: sectionHtml({
          label: 'Panchina',
          homePlayersHtml: playerLiHtml({
            names: ['De Gea'],
            percentages: [5],
          }),
          awayPlayersHtml: playerLiHtml({
            names: ['Sportiello'],
            percentages: [10],
          }),
        }),
      }),
    )

    const result = parseSosfantaProbabiliFormazioni(html)

    expect(result.players).toHaveLength(2)
    const deGea = result.players.find((p) => p.nome === 'De Gea')
    const sportiello = result.players.find((p) => p.nome === 'Sportiello')
    expect(deGea?.probabilita).toBe(5)
    expect(sportiello?.probabilita).toBe(10)
  })

  // ─── Più sezioni nello stesso match ────────────────────────────────────────

  it('estrae giocatori da Titolari, Ballottaggi e Panchina nello stesso match', () => {
    const html = pageHtml(
      articleHtml({
        matchId: 'multi-section',
        homeTeam: 'Fiorentina',
        awayTeam: 'Atalanta',
        sections:
          sectionHtml({
            label: 'Titolari',
            homePlayersHtml: playerLiHtml({
              names: ['Christensen O.'],
              percentages: [100],
            }),
            awayPlayersHtml: playerLiHtml({
              names: ['Carnesecchi'],
              percentages: [100],
            }),
          }) +
          sectionHtml({
            label: 'Ballottaggi',
            homePlayersHtml: playerLiHtml({
              names: ['Dodò - Pongracic'],
              percentages: [75, 25],
            }),
            awayPlayersHtml: playerLiHtml({
              names: ['Scalvini'],
              percentages: [100],
            }),
          }) +
          sectionHtml({
            label: 'Panchina',
            homePlayersHtml: playerLiHtml({
              names: ['De Gea'],
              percentages: [5],
            }),
            awayPlayersHtml: playerLiHtml({
              names: ['Sportiello'],
              percentages: [10],
            }),
          }),
      }),
    )

    const result = parseSosfantaProbabiliFormazioni(html)

    // Fiorentina: Christensen (titolare) + Dodò, Pongracic (ballottaggio) + De Gea (panchina) = 4
    // Atalanta: Carnesecchi (titolare) + Scalvini (ballottaggio) + Sportiello (panchina) = 3
    expect(result.players).toHaveLength(7)

    const fioProduttori = result.players.filter((p) => p.squadra === 'Fiorentina')
    expect(fioProduttori).toHaveLength(4)
  })

  // ─── Anomalie: sezione con h3 non riconosciuto ─────────────────────────────

  it('ignora una sezione con h3 label non riconosciuto', () => {
    const html = pageHtml(
      articleHtml({
        matchId: 'unknown-section',
        homeTeam: 'Fiorentina',
        awayTeam: 'Atalanta',
        sections:
          sectionHtml({
            label: 'Indisponibili',
            homePlayersHtml: playerLiHtml({
              names: ['Unknown1'],
              percentages: [0],
            }),
            awayPlayersHtml: playerLiHtml({
              names: ['Unknown2'],
              percentages: [0],
            }),
          }) +
          sectionHtml({
            label: 'Titolari',
            homePlayersHtml: playerLiHtml({
              names: ['Christensen O.'],
              percentages: [100],
            }),
            awayPlayersHtml: playerLiHtml({
              names: ['Carnesecchi'],
              percentages: [100],
            }),
          }),
      }),
    )

    const result = parseSosfantaProbabiliFormazioni(html)

    // Solo i Titolari vengono estratti, gli Indisponibili ignorati
    expect(result.players).toHaveLength(2)
    expect(result.players.every((p) => p.nome !== 'Unknown1')).toBe(true)
    expect(result.players.every((p) => p.nome !== 'Unknown2')).toBe(true)
  })

  // ─── Anomalie: squadre mancanti ────────────────────────────────────────────

  it('salta un match se una squadra home è mancante', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn())

    const html = pageHtml(
      articleHtml({
        matchId: 'no-home-team',
        homeTeam: '', // vuoto
        awayTeam: 'Atalanta',
        sections: sectionHtml({
          label: 'Titolari',
          homePlayersHtml: playerLiHtml({
            names: ['Christensen O.'],
            percentages: [100],
          }),
          awayPlayersHtml: playerLiHtml({
            names: ['Carnesecchi'],
            percentages: [100],
          }),
        }),
      }) +
        articleHtml({
          matchId: 'valid-match',
          homeTeam: 'Fiorentina',
          awayTeam: 'Atalanta',
          sections: sectionHtml({
            label: 'Titolari',
            homePlayersHtml: playerLiHtml({
              names: ['Dodò'],
              percentages: [90],
            }),
            awayPlayersHtml: playerLiHtml({
              names: ['Scalvini'],
              percentages: [85],
            }),
          }),
        }),
    )

    const result = parseSosfantaProbabiliFormazioni(html)

    // Solo i 2 giocatori dal match valido
    expect(result.players).toHaveLength(2)
    expect(result.players[0].nome).toBe('Dodò')
    expect(result.players[1].nome).toBe('Scalvini')

    warnSpy.mockRestore()
  })

  it('salta un match se una squadra away è mancante', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn())

    const html = pageHtml(
      articleHtml({
        matchId: 'no-away-team',
        homeTeam: 'Fiorentina',
        awayTeam: '', // vuoto
        sections: sectionHtml({
          label: 'Titolari',
          homePlayersHtml: playerLiHtml({
            names: ['Christensen O.'],
            percentages: [100],
          }),
          awayPlayersHtml: playerLiHtml({
            names: ['Carnesecchi'],
            percentages: [100],
          }),
        }),
      }) +
        articleHtml({
          matchId: 'valid-match',
          homeTeam: 'Inter',
          awayTeam: 'Milan',
          sections: sectionHtml({
            label: 'Titolari',
            homePlayersHtml: playerLiHtml({
              names: ['Sommer'],
              percentages: [100],
            }),
            awayPlayersHtml: playerLiHtml({
              names: ['Maignan'],
              percentages: [100],
            }),
          }),
        }),
    )

    const result = parseSosfantaProbabiliFormazioni(html)

    // Solo i 2 giocatori dal match valido
    expect(result.players).toHaveLength(2)
    expect(result.players[0].nome).toBe('Sommer')
    expect(result.players[1].nome).toBe('Maignan')

    warnSpy.mockRestore()
  })

  // ─── Anomalie: giocatore con percentuale non estraibile ────────────────────

  it('salta un giocatore con percentuale non valida (non numero)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn())

    const html = pageHtml(
      articleHtml({
        matchId: 'bad-percentage',
        homeTeam: 'Fiorentina',
        awayTeam: 'Atalanta',
        sections: sectionHtml({
          label: 'Titolari',
          homePlayersHtml:
            `
              <li>
                <span>abc%</span>
                <span class="truncate">BadPlayer</span>
              </li>
            ` +
            playerLiHtml({
              names: ['Christensen O.'],
              percentages: [100],
            }),
          awayPlayersHtml: playerLiHtml({
            names: ['Carnesecchi'],
            percentages: [100],
          }),
        }),
      }),
    )

    const result = parseSosfantaProbabiliFormazioni(html)

    // Il giocatore con percentuale invalida viene saltato (warning loggato)
    expect(result.players).toHaveLength(2)
    expect(result.players.every((p) => p.nome !== 'BadPlayer')).toBe(true)

    warnSpy.mockRestore()
  })

  it('salta un giocatore con percentuale > 100', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn())

    const html = pageHtml(
      articleHtml({
        matchId: 'over-100',
        homeTeam: 'Fiorentina',
        awayTeam: 'Atalanta',
        sections: sectionHtml({
          label: 'Titolari',
          homePlayersHtml:
            `
              <li>
                <span>150%</span>
                <span class="truncate">OverPlayer</span>
              </li>
            ` +
            playerLiHtml({
              names: ['Christensen O.'],
              percentages: [100],
            }),
          awayPlayersHtml: playerLiHtml({
            names: ['Carnesecchi'],
            percentages: [100],
          }),
        }),
      }),
    )

    const result = parseSosfantaProbabiliFormazioni(html)

    // Il giocatore con percentuale > 100 viene saltato
    expect(result.players).toHaveLength(2)
    expect(result.players.every((p) => p.nome !== 'OverPlayer')).toBe(true)

    warnSpy.mockRestore()
  })

  it('salta un giocatore con percentuale negativa', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn())

    const html = pageHtml(
      articleHtml({
        matchId: 'negative',
        homeTeam: 'Fiorentina',
        awayTeam: 'Atalanta',
        sections: sectionHtml({
          label: 'Titolari',
          homePlayersHtml: playerLiHtml({
            names: ['Christensen O.'],
            percentages: [100],
          }),
          awayPlayersHtml:
            `
              <li>
                <span>-50%</span>
                <span class="truncate">NegativePlayer</span>
              </li>
            ` +
            playerLiHtml({
              names: ['Carnesecchi'],
              percentages: [100],
            }),
        }),
      }),
    )

    const result = parseSosfantaProbabiliFormazioni(html)

    // Il giocatore con percentuale negativa viene saltato
    expect(result.players).toHaveLength(2)
    expect(result.players.every((p) => p.nome !== 'NegativePlayer')).toBe(true)

    warnSpy.mockRestore()
  })

  // ─── Anomalie: giocatore senza nome ───────────────────────────────────────

  it('salta un giocatore senza nome (span.truncate vuoto)', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn())

    const html = pageHtml(
      articleHtml({
        matchId: 'no-name',
        homeTeam: 'Fiorentina',
        awayTeam: 'Atalanta',
        sections: sectionHtml({
          label: 'Titolari',
          homePlayersHtml:
            `
              <li>
                <span>100%</span>
                <span class="truncate"></span>
              </li>
            ` +
            playerLiHtml({
              names: ['Christensen O.'],
              percentages: [100],
            }),
          awayPlayersHtml: playerLiHtml({
            names: ['Carnesecchi'],
            percentages: [100],
          }),
        }),
      }),
    )

    const result = parseSosfantaProbabiliFormazioni(html)

    // Il giocatore senza nome viene saltato
    expect(result.players).toHaveLength(2)

    warnSpy.mockRestore()
  })

  // ─── Errore globale: pagina con zero giocatori ────────────────────────────

  it('lancia un Error se nessun giocatore viene estratto dall\'intera pagina', () => {
    const html = pageHtml(
      articleHtml({
        matchId: 'empty-match',
        homeTeam: 'Fiorentina',
        awayTeam: 'Atalanta',
        sections: '', // nessuna sezione
      }),
    )

    expect(() => parseSosfantaProbabiliFormazioni(html)).toThrow(
      '[probabiliFormazioniSosfantaParser] Nessun giocatore estratto dalla pagina',
    )
  })

  it('lancia un Error se tutte le sezioni di un match sono mal formate', () => {
    const html = pageHtml(
      articleHtml({
        matchId: 'malformed',
        homeTeam: 'Fiorentina',
        awayTeam: 'Atalanta',
        sections: `
          <section>
            <h3>Titolari</h3>
            <!-- Manca la struttura div.grid >  ul -->
          </section>
        `,
      }),
    )

    expect(() => parseSosfantaProbabiliFormazioni(html)).toThrow()
  })

  // ─── Più match nella stessa pagina ────────────────────────────────────────

  it('estrae giocatori da più match nella stessa pagina', () => {
    const html = pageHtml(
      articleHtml({
        matchId: 'match1',
        homeTeam: 'Fiorentina',
        awayTeam: 'Atalanta',
        sections: sectionHtml({
          label: 'Titolari',
          homePlayersHtml: playerLiHtml({
            names: ['Christensen O.'],
            percentages: [100],
          }),
          awayPlayersHtml: playerLiHtml({
            names: ['Carnesecchi'],
            percentages: [100],
          }),
        }),
      }) +
        articleHtml({
          matchId: 'match2',
          homeTeam: 'Inter',
          awayTeam: 'Milan',
          sections: sectionHtml({
            label: 'Titolari',
            homePlayersHtml: playerLiHtml({
              names: ['Sommer'],
              percentages: [100],
            }),
            awayPlayersHtml: playerLiHtml({
              names: ['Maignan'],
              percentages: [100],
            }),
          }),
        }),
    )

    const result = parseSosfantaProbabiliFormazioni(html)

    expect(result.players).toHaveLength(4)
    const nomySparse = result.players.map((p) => p.nome)
    expect(nomySparse).toContain('Christensen O.')
    expect(nomySparse).toContain('Carnesecchi')
    expect(nomySparse).toContain('Sommer')
    expect(nomySparse).toContain('Maignan')
  })

  // ─── Preservazione dei nomi e squadre ──────────────────────────────────────

  it('preserva il nome esatto come compare nella fonte', () => {
    const html = pageHtml(
      articleHtml({
        matchId: 'name-preservation',
        homeTeam: 'Fiorentina',
        awayTeam: 'Atalanta',
        sections: sectionHtml({
          label: 'Titolari',
          homePlayersHtml: playerLiHtml({
            names: ['Lautaro M.'],
            percentages: [100],
          }),
          awayPlayersHtml: playerLiHtml({
            names: ['De Roon'],
            percentages: [100],
          }),
        }),
      }),
    )

    const result = parseSosfantaProbabiliFormazioni(html)

    expect(result.players[0].nome).toBe('Lautaro M.')
    expect(result.players[1].nome).toBe('De Roon')
  })

  it('preserva il nome squadra come compare nella fonte', () => {
    const html = pageHtml(
      articleHtml({
        matchId: 'team-preservation',
        homeTeam: 'AS Roma',
        awayTeam: 'SSC Napoli',
        sections: sectionHtml({
          label: 'Titolari',
          homePlayersHtml: playerLiHtml({
            names: ['Pellegrini L.'],
            percentages: [100],
          }),
          awayPlayersHtml: playerLiHtml({
            names: ['Kvaratskhelia'],
            percentages: [100],
          }),
        }),
      }),
    )

    const result = parseSosfantaProbabiliFormazioni(html)

    expect(result.players[0].squadra).toBe('AS Roma')
    expect(result.players[1].squadra).toBe('SSC Napoli')
  })

  // ─── Normalizzazione di spazi nei nomi ────────────────────────────────────

  it('normalizza spazi multipli nel nome di un giocatore', () => {
    const html = pageHtml(
      articleHtml({
        matchId: 'spaces',
        homeTeam: 'Fiorentina',
        awayTeam: 'Atalanta',
        sections: sectionHtml({
          label: 'Titolari',
          homePlayersHtml: `
            <li>
              <span>100%</span>
              <span class="truncate">Player   With   Spaces</span>
            </li>
          `,
          awayPlayersHtml: playerLiHtml({
            names: ['Carnesecchi'],
            percentages: [100],
          }),
        }),
      }),
    )

    const result = parseSosfantaProbabiliFormazioni(html)

    // Gli spazi multipli vengono normalizzati a singolo spazio
    expect(result.players[0].nome).toBe('Player With Spaces')
  })

  // ─── Sezione senza liste (struttura anomala) ──────────────────────────────

  it('salta una sezione che ha una struttura di liste anomala', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(vi.fn())

    const html = pageHtml(
      articleHtml({
        matchId: 'malformed-lists',
        homeTeam: 'Fiorentina',
        awayTeam: 'Atalanta',
        sections:
          `
            <section>
              <h3>Titolari</h3>
              <div class="grid grid-cols-2 gap-8">
                <ul>
                  ${playerLiHtml({ names: ['BadPlayer'], percentages: [100] })}
                </ul>
                <!-- Manca la seconda ul -->
              </div>
            </section>
          ` +
          sectionHtml({
            label: 'Panchina',
            homePlayersHtml: playerLiHtml({
              names: ['Christensen O.'],
              percentages: [100],
            }),
            awayPlayersHtml: playerLiHtml({
              names: ['Carnesecchi'],
              percentages: [100],
            }),
          }),
      }),
    )

    const result = parseSosfantaProbabiliFormazioni(html)

    // La sezione Titolari malformata viene saltata, solo Panchina estratta
    expect(result.players).toHaveLength(2)
    expect(result.players.every((p) => p.nome !== 'BadPlayer')).toBe(true)

    warnSpy.mockRestore()
  })
})
