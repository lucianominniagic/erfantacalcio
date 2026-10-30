import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import {
  filtraOrdinaGiocatori,
  type GiocatoreStats,
} from '~/components/giocatori/giocatoriRanking'
import GiocatoriRankingList from '~/components/giocatori/GiocatoriRankingList'

const players: GiocatoreStats[] = [
  {
    id: 1,
    nome: 'ALFA',
    squadra: null,
    squadraSerieA: 'Roma',
    media: '7.20',
    giocate: '2',
    golfatti: '3',
    golsubiti: '9',
    assist: '0',
  },
  {
    id: 2,
    nome: 'BETA',
    squadra: 'Aurora',
    squadraSerieA: 'Inter',
    media: 6.5,
    giocate: 10,
    golfatti: 10,
    golsubiti: 2,
    assist: 5,
  },
  {
    id: 3,
    nome: 'GAMMA',
    squadra: 'Borgo',
    media: null,
    giocate: null,
    golfatti: null,
    golsubiti: null,
  },
]

describe('Player ranking filters and sorting', () => {
  it('filters by name, club, fantasy team and free agent status, ignoring case and whitespace', () => {
    for (const query of [' alfa ', ' ROMA ', ' SVINCOLATO ']) {
      expect(
        filtraOrdinaGiocatori(players, query, 'media', 'C').map((p) => p.id),
      ).toEqual([1])
    }
    expect(
      filtraOrdinaGiocatori(players, 'aurora', 'media', 'C').map((p) => p.id),
    ).toEqual([2])
    expect(filtraOrdinaGiocatori(players, 'missing', 'media', 'C')).toEqual([])
  })

  it('sorts numeric API strings correctly and keeps missing values last', () => {
    expect(
      filtraOrdinaGiocatori(players, '', 'media', 'C').map((p) => p.id),
    ).toEqual([1, 2, 3])
    expect(
      filtraOrdinaGiocatori(players, '', 'presenze', 'C').map((p) => p.id),
    ).toEqual([2, 1, 3])
    expect(
      filtraOrdinaGiocatori(players, '', 'gol', 'A').map((p) => p.id),
    ).toEqual([2, 1, 3])
    expect(
      filtraOrdinaGiocatori(players, '', 'gol', 'P').map((p) => p.id),
    ).toEqual([2, 1, 3])
  })

  it('preserves server tie ordering and never mutates cached query data', () => {
    const tied = players.map((p) => ({ ...p, media: 6 }))
    expect(
      filtraOrdinaGiocatori(tied, '', 'media', 'C').map((p) => p.id),
    ).toEqual([1, 2, 3])
    filtraOrdinaGiocatori(players, '', 'presenze', 'C')
    expect(players.map((p) => p.id)).toEqual([1, 2, 3])
  })
})

describe('Compact player ranking', () => {
  function render(ruolo: 'P' | 'C', data = players, loading = false) {
    return renderToStaticMarkup(
      createElement(GiocatoriRankingList, {
        giocatori: data,
        isLoading: loading,
        ruolo,
        onNomeClick: () => undefined,
      }),
    )
  }

  it('renders keyboard-accessible player buttons and all outfield statistics', () => {
    const html = render('C')
    expect(html).toContain('<button')
    expect(html).toContain('Apri statistiche di ALFA')
    expect(html).toContain('7,20')
    expect(html).toContain('0 assist')
    expect(html).toContain('2 presenze')
    expect(html).toContain('3 gol')
    expect(html).toContain('Media')
    expect(html).toContain('Svincolato')
  })

  it('uses goals conceded for goalkeepers, without displaying assists', () => {
    const html = render('P')
    expect(html).toContain('9 gol subiti')
    expect(html).not.toContain('assist')
  })

  it('distinguishes loading from empty results', () => {
    expect(render('C', [], true)).toContain('aria-busy="true"')
    expect(render('C', [])).toContain('Nessun giocatore corrisponde ai filtri.')
  })
})
