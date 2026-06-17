import { describe, it, expect } from 'vitest'
import { z } from 'zod'
import { calendarioSchema } from '~/schemas/calendario'
import {
  getDescrizioneGiornataCompact,
  getDescrizioneGiornataExtended,
  getNomeTorneo,
  getIdNextGiornata,
} from './torneo'

// ---------------------------------------------------------------------------
// getDescrizioneGiornataCompact (ex getDescrizioneGiornata in helper.ts)
// ---------------------------------------------------------------------------
describe('getDescrizioneGiornataCompact', () => {
  it('includes Serie A round, torneo name and round number', () => {
    const result = getDescrizioneGiornataCompact(10, 'Campionato', 3, null)
    expect(result).toContain('10')
    expect(result).toContain('Campionato')
    expect(result).toContain('3')
  })

  it('omits round number when giornata is 0', () => {
    const result = getDescrizioneGiornataCompact(10, 'Coppa', 0, null)
    expect(result).not.toMatch(/\b0\b/)
  })

  it('includes single-char gruppoFase as "girone X"', () => {
    const result = getDescrizioneGiornataCompact(5, 'Coppa', 1, 'A')
    expect(result).toContain('girone A')
  })

  it('includes multi-char gruppoFase verbatim', () => {
    const result = getDescrizioneGiornataCompact(5, 'Coppa', 1, 'Finale')
    expect(result).toContain('Finale')
    expect(result).not.toContain('girone Finale')
  })
})

// ---------------------------------------------------------------------------
// getDescrizioneGiornataExtended (ex getDescrizioneGiornata in torneo.ts)
// ---------------------------------------------------------------------------
describe('getDescrizioneGiornataExtended', () => {
  it('returns extended label without gruppoFase', () => {
    const result = getDescrizioneGiornataExtended('Campionato', 3, 25)
    expect(result).toBe('Campionato 3ª giornata (25ª giornata serie A)')
  })

  it('includes Gruppo prefix for single-char gruppoFase A or B', () => {
    const result = getDescrizioneGiornataExtended('Champions', 1, 10, 'A')
    expect(result).toBe('Gruppo A - Champions 1ª giornata (10ª giornata serie A)')
  })

  it('includes gruppoFase verbatim for non-A/B values', () => {
    const result = getDescrizioneGiornataExtended('Coppa', 2, 15, 'Finale')
    expect(result).toBe('Finale - Coppa 2ª giornata (15ª giornata serie A)')
  })
})

// ---------------------------------------------------------------------------
// getNomeTorneo
// ---------------------------------------------------------------------------
describe('getNomeTorneo', () => {
  it('returns only the name when gruppo is null', () => {
    expect(getNomeTorneo('Campionato', null)).toBe('Campionato')
  })

  it('appends "girone X" when gruppo is provided', () => {
    expect(getNomeTorneo('Coppa', 'A')).toBe('Coppa girone A')
  })
})

// ---------------------------------------------------------------------------
// getIdNextGiornata
// ---------------------------------------------------------------------------
describe('getIdNextGiornata', () => {
  const makeCalendario = (id: number, isSelected: boolean) =>
    ({ id, isSelected }) as z.infer<typeof calendarioSchema>

  it('returns the id of the selected giornata', () => {
    const list = [
      makeCalendario(1, false),
      makeCalendario(2, true),
      makeCalendario(3, false),
    ]
    expect(getIdNextGiornata(list)).toBe(2)
  })

  it('returns undefined when no giornata is selected', () => {
    const list = [makeCalendario(1, false), makeCalendario(2, false)]
    expect(getIdNextGiornata(list)).toBeUndefined()
  })

  it('returns undefined for an empty list', () => {
    expect(getIdNextGiornata([])).toBeUndefined()
  })
})
