import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Economia from '~/components/home/Economia'

vi.mock('@tanstack/react-query', () => ({
  useQuery: ({ kind }: { kind: 'teams' | 'results' }) => state[kind],
}))
vi.mock('~/utils/orpc', () => ({
  orpc: {
    squadre: { list: { queryOptions: () => ({ kind: 'teams' }) } },
    economia: {
      getRisultatiStagione: { queryOptions: () => ({ kind: 'results' }) },
    },
  },
}))

const teams = [
  {
    id: 1,
    squadra: 'Aurora',
    presidente: 'Uno',
    foto: null,
    importoAnnuale: 100,
    importoMulte: 0,
    importoMercato: 0,
    fantamilioni: 0,
    isAdmin: true,
  },
  {
    id: 2,
    squadra: 'Borgo',
    presidente: 'Due',
    foto: null,
    importoAnnuale: 100,
    importoMulte: 0,
    importoMercato: 0,
    fantamilioni: null,
    isAdmin: false,
  },
]
interface QueryState {
  data: unknown
  isError: boolean
  error: { message: string } | null
}

const state = vi.hoisted<{ teams: QueryState; results: QueryState }>(() => ({
  teams: {
    data: undefined,
    isError: false,
    error: null,
  },
  results: {
    data: undefined,
    isError: false,
    error: null,
  },
}))

function render() {
  return renderToStaticMarkup(createElement(Economia))
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/\u00a0/g, ' ')
}

beforeEach(() => {
  vi.stubEnv('NEXT_PUBLIC_COSTI_DOMINIO', '20')
  state.teams = { data: teams, isError: false, error: null }
  state.results = {
    data: {
      classificaMap: { 1: 1 },
      idVincitriceChampions: null,
      finaleGiocata: false,
    },
    isError: false,
    error: null,
  }
})

describe('Economia overview', () => {
  it('keeps contributions, rounded prizes and site reimbursement separate', () => {
    const text = render()
    expect(text).toContain('180,00 €')
    expect(text).toContain('Premi maturati94,00 €')
    expect(text).toContain('Da versare6,00 €')
    expect(text).toContain(
      'Rimborso sito separato: 20,00 €, non incluso nel saldo.',
    )
    expect(text).toContain('Budget mercato: 0 FM, separato dagli euro.')
    expect(text).toContain('Budget mercato: —, separato dagli euro.')
    expect(text).toContain('Saldo provvisorio')
    expect(text).toContain('Finale da giocare')
  })

  it('shows the Champions winner and final status', () => {
    state.results.data = {
      classificaMap: { 1: 1 },
      idVincitriceChampions: 2,
      finaleGiocata: true,
    }
    const text = render()
    expect(text).toContain('Saldo definitivo')
    expect(text).toContain('Champions · 15%Borgo')
    expect(text).not.toContain('Finale da giocare')
  })

  it('does not present zero amounts while data is loading', () => {
    state.results.data = undefined
    const text = render()
    expect(text).not.toContain('Montepremi della lega')
    expect(text).not.toContain('Saldo provvisorio')
  })

  it('surfaces query errors instead of showing an empty balance', () => {
    state.teams.isError = true
    state.teams.error = { message: 'Connessione non disponibile' }
    expect(render()).toContain(
      'Impossibile caricare i dati economici: Connessione non disponibile',
    )
  })

  it('explains an empty participant list', () => {
    state.teams.data = []
    expect(render()).toContain('Nessuna squadra partecipante.')
  })
})
