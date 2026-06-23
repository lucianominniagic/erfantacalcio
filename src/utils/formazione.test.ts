import { describe, it, expect } from 'vitest'
import { getRuoloEsteso, convertiStringaInRuolo } from './formazione'

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
