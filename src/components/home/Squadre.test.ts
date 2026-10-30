import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Squadre from '~/components/home/Squadre'

vi.mock('@tanstack/react-query', () => ({ useQuery: () => state }))
vi.mock('~/utils/orpc', () => ({
  orpc: { squadre: { list: { queryOptions: (options: unknown) => options } } },
}))

interface Team {
  id: number
  squadra: string
  presidente: string
  foto: string | null
}

const state = vi.hoisted<{
  data: Team[]
  isLoading: boolean
  isError: boolean
  error: { message: string } | null
}>(() => ({ data: [], isLoading: false, isError: false, error: null }))

beforeEach(() => {
  state.data = [
    {
      id: 8,
      squadra: 'Nome squadra molto lungo',
      presidente: 'Presidente Uno',
      foto: null,
    },
    { id: 2, squadra: 'Seconda', presidente: 'Presidente Due', foto: null },
  ]
  state.isLoading = false
  state.isError = false
  state.error = null
})

function render() {
  const html = renderToStaticMarkup(createElement(Squadre))
  const text = html
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]*>/g, '')
  return { html, text }
}

describe('Squadre album', () => {
  it('renders real teams in API order with single accessible links and presidents', () => {
    const { html, text } = render()
    expect(text.indexOf('Nome squadra molto lungo')).toBeLessThan(
      text.indexOf('Seconda'),
    )
    expect(text).toContain('Presidente Uno')
    expect(text).toContain('Presidente Due')
    expect(text).not.toContain('2 squadre')
    expect(html.match(/<a\b/g)).toHaveLength(2)
    expect(html).toContain('href="/squadra/8"')
    expect(html).toContain('href="/squadra/2"')
    expect(html).toContain('aria-label="Squadre della lega"')
    expect(html).not.toContain('Cerca squadra o presidente')
    expect(html).not.toContain('<input')
    expect(html).toContain('repeat(2, minmax(0, 1fr))')
    expect(html).toContain('repeat(4, minmax(0, 1fr))')
    expect(html).toContain('object-fit:contain')
    expect(html).toContain('overflow-wrap:anywhere')
    expect(text).not.toContain('MOCK')
    expect(text).not.toContain('Anteprima')
  })

  it('shows loading, empty and failed states explicitly', () => {
    state.isLoading = true
    expect(render().html).toContain('aria-busy="true"')
    state.isLoading = false
    state.data = []
    expect(render().text).toContain('Nessuna squadra disponibile.')
    state.isError = true
    state.error = { message: 'Connessione non disponibile' }
    expect(render().text).toContain(
      'Impossibile caricare le squadre: Connessione non disponibile',
    )
  })
})
