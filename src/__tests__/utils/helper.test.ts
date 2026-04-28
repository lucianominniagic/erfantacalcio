import { describe, it, expect } from 'vitest'
import {
  getRuoloEsteso,
  normalizeCampioncinoUrl,
  normalizeNomeGiocatore,
  getShortName,
  getDescrizioneGiornata,
  convertiStringaInRuolo,
  getNomeTorneo,
  getIdNextGiornata,
} from '~/utils/helper'
import { z } from 'zod'
import { calendarioSchema } from '~/schemas/calendario'

// ---------------------------------------------------------------------------
// getRuoloEsteso
// ---------------------------------------------------------------------------
describe('getRuoloEsteso', () => {
  it.each([
    ['P', false, 'Portiere'],
    ['D', false, 'Difensore'],
    ['C', false, 'Centrocampista'],
    ['A', false, 'Attaccante'],
  ])('returns singular for %s', (ruolo, pluralize, expected) => {
    expect(getRuoloEsteso(ruolo, pluralize)).toBe(expected)
  })

  it.each([
    ['P', true, 'Portieri'],
    ['D', true, 'Difensori'],
    ['C', true, 'Centrocampisti'],
    ['A', true, 'Attaccanti'],
  ])('returns plural for %s', (ruolo, pluralize, expected) => {
    expect(getRuoloEsteso(ruolo, pluralize)).toBe(expected)
  })

  it('returns a fallback for an invalid role', () => {
    expect(getRuoloEsteso('X')).toBe('Ruolo non valido')
  })
})

// ---------------------------------------------------------------------------
// normalizeCampioncinoUrl
// ---------------------------------------------------------------------------
describe('normalizeCampioncinoUrl', () => {
  const BASE_URL = 'https://example.com/card/{giocatore}'
  const SMALL_URL = 'https://example.com/small/{giocatore}'

  it('returns nomeFantagazzetta as-is when it is an absolute URL (card link)', () => {
    const nomeUrl = 'https://cdn.example.com/card/totti.png'
    const result = normalizeCampioncinoUrl(BASE_URL, 'TOTTI', nomeUrl)
    expect(result).toBe(nomeUrl)
  })

  it('replaces /card/ with /small/ when link contains "small" and nomeFantagazzetta is a URL', () => {
    const nomeUrl = 'https://cdn.example.com/card/totti.png'
    const result = normalizeCampioncinoUrl(SMALL_URL, 'TOTTI', nomeUrl)
    expect(result).toBe('https://cdn.example.com/small/totti.png')
  })

  it('handles a single-word name without nomeFantagazzetta', () => {
    const result = normalizeCampioncinoUrl(BASE_URL, 'TOTTI')
    expect(result).toBe('https://example.com/card/TOTTI')
  })

  it('handles "COGNOME I." — extracts surname before the dot', () => {
    const result = normalizeCampioncinoUrl(BASE_URL, 'TOTTI F.')
    expect(result).toBe('https://example.com/card/TOTTI')
  })

  it('handles "DE VRIJ J." — joins double surname with hyphen', () => {
    const result = normalizeCampioncinoUrl(BASE_URL, 'DE VRIJ J.')
    expect(result).toBe('https://example.com/card/DE-VRIJ')
  })

  it('handles "ALEX SANDRO" — two words, no dot → joined with hyphen', () => {
    const result = normalizeCampioncinoUrl(BASE_URL, 'ALEX SANDRO')
    expect(result).toBe('https://example.com/card/ALEX-SANDRO')
  })

  it('uses nomeFantagazzetta string directly as slug when not a URL', () => {
    const result = normalizeCampioncinoUrl(BASE_URL, 'TOTTI', 'totti-f')
    expect(result).toBe('https://example.com/card/totti-f')
  })
})

// ---------------------------------------------------------------------------
// normalizeNomeGiocatore
// ---------------------------------------------------------------------------
describe('normalizeNomeGiocatore', () => {
  it('converts to uppercase', () => {
    expect(normalizeNomeGiocatore('totti')).toBe('TOTTI')
  })

  it('trims surrounding whitespace', () => {
    expect(normalizeNomeGiocatore('  TOTTI  ')).toBe('TOTTI')
  })

  it.each([
    ['À', "A'"],
    ['Á', "A'"],
    ['È', "E'"],
    ['É', "E'"],
    ['Ì', "I'"],
    ['Í', "I'"],
    ['Ò', "O'"],
    ['Ó', "O'"],
    ['Ú', "O'"],
    ['Ù', "O'"],
  ])('replaces %s with %s', (input, expected) => {
    expect(normalizeNomeGiocatore(input)).toBe(expected)
  })
})

// ---------------------------------------------------------------------------
// getShortName
// ---------------------------------------------------------------------------
describe('getShortName', () => {
  it('returns the longest significant word', () => {
    expect(getShortName('DE VRIJ J.')).toBe('VRIJ')
  })

  it('returns the single word when only one significant word is present', () => {
    expect(getShortName('TOTTI')).toBe('TOTTI')
  })

  it('truncates to maxLength when provided', () => {
    // getShortName picks the LONGEST word, so 'ALEX SANDRO' → 'SANDRO' → truncated to 4 = 'SAND'
    expect(getShortName('ALEX SANDRO', 4)).toBe('SAND')
  })

  it('does not truncate when word length <= maxLength', () => {
    expect(getShortName('ALEX SANDRO', 10)).toBe('SANDRO')
  })

  it('returns the input unchanged for an empty string', () => {
    expect(getShortName('')).toBe('')
  })

  it('skips words with length <= 2', () => {
    expect(getShortName('DE LA PENA')).toBe('PENA')
  })

  it('skips words containing a dot (abbreviations)', () => {
    // "F." contains a dot — should be skipped
    expect(getShortName('TOTTI F.')).toBe('TOTTI')
  })
})

// ---------------------------------------------------------------------------
// getDescrizioneGiornata
// ---------------------------------------------------------------------------
describe('getDescrizioneGiornata', () => {
  it('includes Serie A round, torneo name and round number', () => {
    const result = getDescrizioneGiornata(10, 'Campionato', 3, null)
    expect(result).toContain('10')
    expect(result).toContain('Campionato')
    expect(result).toContain('3')
  })

  it('omits round number when giornata is 0', () => {
    const result = getDescrizioneGiornata(10, 'Coppa', 0, null)
    expect(result).not.toMatch(/\b0\b/)
  })

  it('includes single-char gruppoFase as "girone X"', () => {
    const result = getDescrizioneGiornata(5, 'Coppa', 1, 'A')
    expect(result).toContain('girone A')
  })

  it('includes multi-char gruppoFase verbatim', () => {
    const result = getDescrizioneGiornata(5, 'Coppa', 1, 'Finale')
    expect(result).toContain('Finale')
    expect(result).not.toContain('girone Finale')
  })
})

// ---------------------------------------------------------------------------
// convertiStringaInRuolo
// ---------------------------------------------------------------------------
describe('convertiStringaInRuolo', () => {
  it.each(['P', 'D', 'C', 'A'])('returns the ruolo for uppercase %s', (r) => {
    expect(convertiStringaInRuolo(r)).toBe(r)
  })

  it.each(['p', 'd', 'c', 'a'])('handles lowercase %s', (r) => {
    expect(convertiStringaInRuolo(r)).toBe(r.toUpperCase())
  })

  it('returns null for an invalid role', () => {
    expect(convertiStringaInRuolo('X')).toBeNull()
    expect(convertiStringaInRuolo('')).toBeNull()
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
    ({
      id,
      isSelected,
    }) as z.infer<typeof calendarioSchema>

  it('returns the id of the selected giornata', () => {
    const list = [makeCalendario(1, false), makeCalendario(2, true), makeCalendario(3, false)]
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
