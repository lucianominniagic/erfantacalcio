import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DataGrid, type DataGridProps } from '@mui/x-data-grid'
import Classifica from '~/components/home/Classifica'

const viewport = vi.hoisted(() => ({ mobile: true }))
vi.mock('@mui/material', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@mui/material')>()),
  useMediaQuery: () => viewport.mobile,
}))
vi.mock('@mui/x-data-grid', () => ({
  DataGrid: vi.fn((props: DataGridProps) =>
    createElement('div', { 'aria-labelledby': props['aria-labelledby'] }),
  ),
}))
vi.mock('@tanstack/react-query', () => ({ useQuery: () => state }))
vi.mock('~/utils/orpc', () => ({
  orpc: {
    classifica: { list: { queryOptions: (options: unknown) => options } },
  },
}))

interface Row {
  idSquadra: number
  squadra: string
  foto: string | null
  punti: number
  giocate: number
  golFatti: number
  golSubiti: number
  fantapunti: number
}
const state = vi.hoisted<{
  data: Row[]
  isError: boolean
  isLoading: boolean
  error: { message: string } | null
}>(() => ({ data: [], isError: false, isLoading: false, error: null }))

beforeEach(() => {
  vi.clearAllMocks()
  viewport.mobile = true
  state.data = [
    {
      idSquadra: 9,
      squadra: 'Prima',
      foto: null,
      punti: 7,
      giocate: 6,
      golFatti: 10,
      golSubiti: 11,
      fantapunti: 439.75,
    },
    {
      idSquadra: 2,
      squadra: 'Seconda',
      foto: null,
      punti: 7,
      giocate: 6,
      golFatti: 7,
      golSubiti: 7,
      fantapunti: 416.25,
    },
  ]
  state.isError = false
  state.isLoading = false
  state.error = null
})

function render(gruppo: string | null = null) {
  return renderToStaticMarkup(
    createElement(Classifica, {
      nomeTorneo: gruppo ? 'Champions' : 'Campionato',
      idTorneo: 1,
      gruppo,
    }),
  )
}

describe('Classifica original compact table', () => {
  it('keeps API ordering and all original columns with narrow mobile widths', () => {
    const html = render()
    const props = vi.mocked(DataGrid).mock.calls.at(-1)?.[0]
    expect(props?.rows).toEqual(state.data)
    expect(props?.getRowId?.(state.data[0])).toBe(9)
    expect(props?.columns.map((column) => column.field)).toEqual([
      'squadra',
      'punti',
      'golFatti',
      'golSubiti',
      'giocate',
      'fantapunti',
    ])
    expect(props?.columns.map((column) => column.headerName)).toEqual([
      'Squadra',
      'P.',
      'Gol+',
      'Gol-',
      'G.',
      'FP.',
    ])
    expect(props?.columns.map((column) => column.minWidth)).toEqual([
      0, 24, 30, 30, 24, 58,
    ])
    expect(props?.autoHeight).toBe(true)
    expect(props?.disableColumnSorting).toBe(true)
    expect(props?.hideFooter).toBe(true)
    expect(html).not.toContain('<ol')
    expect(html).not.toContain('Scorri')
    expect(html).not.toContain('demo')
    expect(html).not.toContain('Evidenzia')
    expect(html).not.toContain('Ordine dimostrativo')
  })

  it('retains the original desktop avatar and longer headers', () => {
    viewport.mobile = false
    render()
    const props = vi.mocked(DataGrid).mock.calls.at(-1)?.[0]
    expect(props?.columns.map((column) => column.field)).toContain('foto')
    expect(props?.columns.map((column) => column.headerName)).toEqual([
      'Squadra',
      '',
      'Punti',
      'Gol+',
      'Gol-',
      'Giocate',
      'Fantapunti',
    ])
  })

  it('uses the Champions group title', () => {
    expect(render('B')).toContain('Champions girone B')
  })

  it('distinguishes loading, empty and failed queries', () => {
    state.isLoading = true
    expect(render()).toContain('aria-busy="true"')
    state.isLoading = false
    state.data = []
    expect(render()).toContain('Classifica non ancora disponibile.')
    state.isError = true
    state.error = { message: 'Connessione non disponibile' }
    expect(render()).toContain(
      'Impossibile caricare la classifica: Connessione non disponibile',
    )
  })
})
