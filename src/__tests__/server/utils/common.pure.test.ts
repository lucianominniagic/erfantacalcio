/**
 * Tests for pure (non-async, no DB) functions exported from server/utils/common.ts
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

// getBonusModulo reads Configurazione at module load time, so we mock it before importing.
vi.mock('~/config', () => ({
  Configurazione: {
    bonusModulo: true,
    bonusModulo343: -1.5,
    bonusModulo433: -1,
    bonusModulo442: 0,
    bonusModulo352: -0.5,
    bonusModulo532: 0.5,
    bonusModulo451: 1,
    bonusModulo541: 1.5,
    bonusSenzaVoto: 1,
    maxSostituzioni: 6,
    importoMulta: 10,
    bonusFattoreCasalingo: 1,
  },
}))

import {
  getBonusModulo,
  getBonusSenzaVoto,
  getGolSegnati,
  getCountRiserve,
  getVotoBonus,
  getGiocatoriVotoInfluente,
} from '~/server/utils/common'

// ---------------------------------------------------------------------------
// getBonusModulo
// ---------------------------------------------------------------------------
describe('getBonusModulo', () => {
  it.each([
    ['3-4-3', -1.5],
    ['4-3-3', -1],
    ['4-4-2', 0],
    ['3-5-2', -0.5],
    ['5-3-2', 0.5],
    ['4-5-1', 1],
    ['5-4-1', 1.5],
  ])('returns the correct bonus for modulo %s when bonusModulo is enabled', (modulo, expected) => {
    expect(getBonusModulo(modulo)).toBe(expected)
  })

  it('returns 0 for an unknown modulo', () => {
    expect(getBonusModulo('1-2-3')).toBe(0)
  })

  it('returns 0 for an empty string', () => {
    expect(getBonusModulo('')).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// getBonusSenzaVoto
// ---------------------------------------------------------------------------
describe('getBonusSenzaVoto', () => {
  it('returns 0 when all 11 players have a voto', () => {
    expect(getBonusSenzaVoto(11)).toBe(0)
  })

  it('applies bonus for fewer than 11 influenti (no cap)', () => {
    // 11 - 9 = 2 riserve < maxSostituzioni(6) → 2 * bonusSenzaVoto(1) = 2
    expect(getBonusSenzaVoto(9)).toBe(2)
  })

  it('caps the bonus at maxSostituzioni', () => {
    // 11 - 0 = 11 riserve > maxSostituzioni(6) → 6 * bonusSenzaVoto(1) = 6
    expect(getBonusSenzaVoto(0)).toBe(6)
  })

  it('uses maxSostituzioni exactly when gap equals it', () => {
    // 11 - 5 = 6 = maxSostituzioni → 6 * 1 = 6
    expect(getBonusSenzaVoto(5)).toBe(6)
  })
})

// ---------------------------------------------------------------------------
// getGolSegnati
// ---------------------------------------------------------------------------
describe('getGolSegnati', () => {
  it('returns 0 below soglia1 (66)', () => {
    expect(getGolSegnati(65)).toBe(0)
    expect(getGolSegnati(0)).toBe(0)
  })

  it('returns 1 for fantapunti in [66, 72)', () => {
    expect(getGolSegnati(66)).toBe(1)
    expect(getGolSegnati(71)).toBe(1)
  })

  it('returns 2 for fantapunti in [72, 78)', () => {
    expect(getGolSegnati(72)).toBe(2)
    expect(getGolSegnati(77)).toBe(2)
  })

  it('returns 3 for fantapunti in [78, 82)', () => {
    expect(getGolSegnati(78)).toBe(3)
    expect(getGolSegnati(81)).toBe(3)
  })

  it('returns 4 for fantapunti in [82, 86)', () => {
    expect(getGolSegnati(82)).toBe(4)
    expect(getGolSegnati(85)).toBe(4)
  })

  it('returns 5 for fantapunti in [86, 90)', () => {
    expect(getGolSegnati(86)).toBe(5)
    expect(getGolSegnati(89)).toBe(5)
  })

  it('returns 6 for fantapunti in [90, 94)', () => {
    expect(getGolSegnati(90)).toBe(6)
    expect(getGolSegnati(93)).toBe(6)
  })

  it('returns 7 for fantapunti in [94, 98)', () => {
    expect(getGolSegnati(94)).toBe(7)
    expect(getGolSegnati(97)).toBe(7)
  })

  it('returns 8 for fantapunti >= 98', () => {
    expect(getGolSegnati(98)).toBe(8)
    expect(getGolSegnati(120)).toBe(8)
  })
})

// ---------------------------------------------------------------------------
// getCountRiserve
// ---------------------------------------------------------------------------
describe('getCountRiserve', () => {
  it('returns 0 when all 11 are titolari', () => {
    expect(getCountRiserve(11)).toBe(0)
  })

  it('returns the difference when below maxSostituzioni cap', () => {
    // 11 - 9 = 2
    expect(getCountRiserve(9)).toBe(2)
  })

  it('caps at maxSostituzioni (6)', () => {
    expect(getCountRiserve(0)).toBe(6)
    expect(getCountRiserve(4)).toBe(6)
  })
})

// ---------------------------------------------------------------------------
// getVotoBonus
// ---------------------------------------------------------------------------
describe('getVotoBonus', () => {
  const makeVoto = (overrides: Record<string, number | null>) =>
    ({
      voto: 0,
      ammonizione: 0,
      espulsione: 0,
      gol: 0,
      assist: 0,
      autogol: 0,
      altriBonus: 0,
      ...overrides,
    }) as any

  it('returns 0 when all fields are zero', () => {
    expect(getVotoBonus(makeVoto({}))).toBe(0)
  })

  it('sums all bonus fields correctly', () => {
    const voto = makeVoto({ voto: 6, gol: 3, assist: 1, ammonizione: -0.5 })
    expect(getVotoBonus(voto)).toBe(9.5)
  })

  it('treats null fields as 0', () => {
    const voto = makeVoto({ gol: null, assist: null })
    expect(getVotoBonus(voto)).toBe(0)
  })

  it('handles negative bonus correctly', () => {
    const voto = makeVoto({ voto: 6, espulsione: -1, autogol: -2 })
    expect(getVotoBonus(voto)).toBe(3)
  })
})

// ---------------------------------------------------------------------------
// getGiocatoriVotoInfluente
// ---------------------------------------------------------------------------
describe('getGiocatoriVotoInfluente', () => {
  const makeGiocatore = (isVotoInfluente: boolean, idGiocatore = 1) => ({
    ruolo: 'A',
    idVoto: 1,
    voto: 6,
    ammonizione: 0,
    espulsione: 0,
    gol: 0,
    assist: null,
    altriBonus: null,
    autogol: null,
    titolare: true,
    idGiocatore,
    votoBonus: 6,
    isSostituito: false,
    isVotoInfluente,
  })

  it('returns only players with isVotoInfluente=true', () => {
    const lista = [
      makeGiocatore(true, 1),
      makeGiocatore(false, 2),
      makeGiocatore(true, 3),
    ]
    const result = getGiocatoriVotoInfluente(lista)
    expect(result).toHaveLength(2)
    expect(result.every((g) => g.isVotoInfluente)).toBe(true)
  })

  it('returns an empty array when no player is influente', () => {
    const lista = [makeGiocatore(false), makeGiocatore(false)]
    expect(getGiocatoriVotoInfluente(lista)).toHaveLength(0)
  })

  it('returns an empty array for an empty input', () => {
    expect(getGiocatoriVotoInfluente([])).toHaveLength(0)
  })
})
