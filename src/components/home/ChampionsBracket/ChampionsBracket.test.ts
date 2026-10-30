import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { describe, expect, it } from 'vitest'
import { themeOptions } from '~/theme'
import ChampionsBracket from './ChampionsBracket'
import { ChampionsBracketProps, GiornataType, PartitaType } from './types'

const theme = createTheme(themeOptions)

function partita(overrides: Partial<PartitaType> = {}): PartitaType {
  return {
    idPartita: 10,
    idHome: 1,
    idAway: 2,
    squadraHome: 'Home Uno',
    squadraAway: 'Away Due',
    golHome: 3,
    golAway: 3,
    multaHome: false,
    multaAway: false,
    isFattoreHome: false,
    ...overrides,
  }
}

function giornata(overrides: Partial<GiornataType> = {}): GiornataType {
  return {
    idCalendario: 100,
    idTorneo: 4,
    giornata: 1,
    giornataSerieA: 35,
    isGiocata: true,
    isSovrapposta: false,
    isRecupero: false,
    girone: null,
    Torneo: 'Champions',
    Descrizione: '',
    Title: '',
    SubTitle: '',
    partite: [partita()],
    ...overrides,
  }
}

function render(overrides: Partial<ChampionsBracketProps> = {}) {
  const html = renderToStaticMarkup(
    createElement(ThemeProvider, {
      theme,
      children: createElement(ChampionsBracket, {
        titolo: 'Fase finale Champions',
        semifinaliAndata: giornata(),
        semifinaliRitorno: giornata({
          idCalendario: 101,
          partite: [
            partita({
              idPartita: 11,
              idHome: 2,
              idAway: 1,
              golHome: 1,
              golAway: 4,
            }),
          ],
        }),
        finale: null,
        ...overrides,
      }),
    }),
  )
  const text = html
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]*>/g, '')
  return { html, text }
}

describe('Knockout sports bracket', () => {
  it('renders the chosen scrollable bracket and correct title for either cup, without prototype copy', () => {
    for (const titolo of ['Fase finale Champions', 'Coppa dei Perdenti']) {
      const { html, text } = render({ titolo })
      expect(html).toContain(`aria-label="Tabellone ${titolo}"`)
      expect(html).toContain('tabindex="0"')
      expect(html).toContain('overflow-x:auto')
      expect(html).toContain('min-width:622px')
      expect(text).toContain(titolo)
      expect(text).toContain('Semifinali')
      expect(text).toContain('Finale · gara unica')
      expect(html).toContain('title="Andata"')
      expect(html).toContain('title="Ritorno"')
      expect(html).toContain('title="Totale"')
      expect(text).not.toContain('Scorri il tabellone')
      expect(text).not.toContain('MOCK')
    }
  })

  it('maps return scores by team ID, shows aggregates and keeps both match links', () => {
    const { html, text } = render()
    expect(text).toContain('Home Uno347')
    expect(text).toContain('Away Due314')
    expect(text).toContain('In finale: Home Uno')
    expect(html).toContain('/tabellini?idPartita=10&amp;idCalendario=100')
    expect(html).toContain('/tabellini?idPartita=11&amp;idCalendario=101')
  })

  it('does not show stale return scores, totals or a winner before the return is played', () => {
    const { html, text } = render({
      semifinaliRitorno: giornata({ idCalendario: 101, isGiocata: false }),
    })
    expect(text).toContain('Ritorno da giocare')
    expect(text).toContain('Home Uno3——')
    expect(text).not.toContain('In finale:')
    expect(html).toContain('/formazioni?idPartita=10&amp;idCalendario=101')
  })

  it('does not calculate totals from missing scores or declare an aggregate tie winner', () => {
    const missing = render({
      semifinaliRitorno: giornata({ partite: [partita({ golHome: null })] }),
    })
    expect(missing.text).toContain('Risultati in aggiornamento')
    expect(missing.text).toContain('Home Uno3——')
    expect(missing.text).not.toContain('In finale:')
    const tie = render({ semifinaliRitorno: giornata() })
    expect(tie.text).toContain('Parità nel complessivo')
    expect(tie.text).not.toContain('In finale:')
  })

  it('handles a missing second semifinal, missing return, and unassigned finalists', () => {
    const { text } = render({ semifinaliRitorno: null })
    expect(text).toContain('Semifinale 1')
    expect(text).not.toContain('Semifinale 2')
    expect(text).toContain('Finaliste da determinare')
    expect(text).toContain('Vincente semifinale 1')
    expect(text).toContain('Vincente semifinale 2')
    expect(text).toContain('Data da definire')
    expect(render({ semifinaliAndata: null }).html).toBe('')
    expect(render({ semifinaliAndata: giornata({ partite: [] }) }).html).toBe(
      '',
    )
  })

  it('uses the real final assignments and links to formations or the played match', () => {
    const finale = giornata({
      idCalendario: 102,
      isGiocata: false,
      data: '2026-05-24T18:00:00',
      partite: [
        partita({
          idPartita: 12,
          squadraHome: 'Finalista reale',
          golHome: 2,
          golAway: 1,
        }),
      ],
    })
    const pending = render({ finale })
    expect(pending.text).toContain('Da giocare')
    expect(pending.text).toContain('Finalista reale')
    expect(pending.text).toContain('24/05, 18:00')
    expect(pending.html).toContain(
      '/formazioni?idPartita=12&amp;idCalendario=102',
    )
    const played = render({ finale: { ...finale, isGiocata: true } })
    expect(played.html).toContain(
      '/tabellini?idPartita=12&amp;idCalendario=102',
    )
    expect(played.text).toContain('Finalista reale2')
    const unassigned = render({
      finale: {
        ...finale,
        partite: [
          partita({
            idHome: null,
            idAway: null,
            squadraHome: null,
            squadraAway: null,
          }),
        ],
      },
    })
    expect(unassigned.text).toContain('Finaliste da determinare')
    expect(unassigned.html).not.toContain('aria-label="Finale: formazioni"')
  })
})
