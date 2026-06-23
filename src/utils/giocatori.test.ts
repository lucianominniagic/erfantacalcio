import { describe, it, expect } from 'vitest'
import {
  normalizeCampioncinoUrl,
  normalizeNomeGiocatore,
  getShortName,
} from './giocatori'

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
    expect(getShortName('TOTTI F.')).toBe('TOTTI')
  })
})
