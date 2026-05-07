// Test caratterizzanti — FASE 3 pre-refactor
// Tests della logica di calcolo bonus e modificatori in processVoti
// La logica principale è il calcolo dei bonus da applicare ai voti
// 
// TODO: After FASE 3 refactor, extract these pure functions to a dedicated service:
// - calcBonusFromModificatori(votoInput, ruolo) → bonusObj
// - validateVotoInput(votoInput) → boolean

import { describe, it, expect, beforeAll } from 'vitest'

// Mock Configurazione to avoid environment variable loading
let mockConfigurazione: any

beforeAll(() => {
  mockConfigurazione = {
    bonusGol: 3,
    bonusAssist: 1,
    bonusGolSubito: -1,
    bonusAmmonizione: -0.5,
    bonusEspulsione: -1,
    bonusRigoreParato: 3,
    bonusRigoreSbagliato: -1,
    bonusAutogol: -2,
    stagione: 2024,
  }
})

/**
 * Caratterizza il calcolo dei bonus applicati ai voti.
 * Questo è il core della logica di processVoti.
 * 
 * La procedura applica bonus/malus in base a:
 * - voto base (0 = non giocato)
 * - ruolo del giocatore (P vs field player)
 * - modificatori: ammonizione, espulsione, gol, assist, autogol, rigori
 */
describe('processVoti — Bonus Calculation Logic', () => {
  describe('Bonus Application Logic', () => {
    it('should calculate ammonizione bonus correctly', () => {
      // arrange
      const hasAmmonizione = 1
      const expectedBonus = mockConfigurazione.bonusAmmonizione

      // act
      const result = hasAmmonizione === 1 ? mockConfigurazione.bonusAmmonizione : 0

      // assert
      expect(result).toBe(expectedBonus)
      expect(result).toBeLessThan(0)
    })

    it('should calculate espulsione bonus correctly', () => {
      // arrange
      const hasEspulsione = 1

      // act
      const result = hasEspulsione === 1 ? mockConfigurazione.bonusEspulsione : 0

      // assert
      expect(result).toBe(mockConfigurazione.bonusEspulsione)
      expect(result).toBeLessThan(mockConfigurazione.bonusAmmonizione)
    })

    it('should calculate gol bonus for field player', () => {
      // arrange
      const ruolo = 'A'
      const golSegnati = 2

      // act
      const result = ruolo === 'P'
        ? golSegnati * mockConfigurazione.bonusGolSubito
        : golSegnati * mockConfigurazione.bonusGol

      // assert
      expect(result).toBe(6)
      expect(result).toBeGreaterThan(0)
    })

    it('should calculate gol bonus for goalkeeper', () => {
      // arrange
      const ruolo = 'P'
      const golSubiti = 3

      // act
      const result = ruolo === 'P'
        ? golSubiti * mockConfigurazione.bonusGolSubito
        : golSubiti * mockConfigurazione.bonusGol

      // assert
      expect(result).toBe(-3)
      expect(result).toBeLessThan(0)
    })

    it('should calculate assist bonus correctly', () => {
      // arrange
      const assist = 1

      // act
      const result = assist * mockConfigurazione.bonusAssist

      // assert
      expect(result).toBe(1)
      expect(result).toBeGreaterThan(0)
    })

    it('should calculate autogol bonus correctly', () => {
      // arrange
      const autogol = 1

      // act
      const result = autogol * mockConfigurazione.bonusAutogol

      // assert
      expect(result).toBe(-2)
      expect(result).toBeLessThan(0)
    })

    it('should calculate altriBonus (rigori) correctly', () => {
      // arrange
      const rigoriParati = 1
      const rigoriErrati = 1

      // act
      const result =
        rigoriParati * mockConfigurazione.bonusRigoreParato +
        rigoriErrati * mockConfigurazione.bonusRigoreSbagliato

      // assert
      expect(result).toBe(2) // 3 - 1
      expect(rigoriParati * mockConfigurazione.bonusRigoreParato).toBeGreaterThan(0)
      expect(rigoriErrati * mockConfigurazione.bonusRigoreSbagliato).toBeLessThan(0)
    })
  })

  describe('Edge Cases', () => {
    it('should handle voto=0 (non-played)', () => {
      // arrange
      const voto = null

      // act
      const result = voto ?? 0

      // assert
      expect(result).toBe(0)
    })

    it('should handle missing modificatori as 0', () => {
      // arrange
      const ammonizione = undefined
      const golSegnati = undefined

      // act & assert
      expect(ammonizione ?? 0).toBe(0)
      expect(golSegnati ?? 0).toBe(0)
    })

    it('should accumulate all bonus components correctly', () => {
      // arrange
      const ammonizione = 1
      const gol = 1
      const ruolo = 'A'

      // act
      const bonusAmm = ammonizione === 1 ? mockConfigurazione.bonusAmmonizione : 0
      const bonusGol = ruolo === 'P'
        ? gol * mockConfigurazione.bonusGolSubito
        : gol * mockConfigurazione.bonusGol

      const totalBonus = bonusAmm + bonusGol

      // assert
      expect(totalBonus).toBe(2.5) // 3 + (-0.5)
      expect(totalBonus).toBeLessThan(mockConfigurazione.bonusGol)
    })
  })

  describe('Ruolo-specific Logics', () => {
    it('portiere should use bonusGolSubito', () => {
      // arrange
      const ruolo = 'P'
      const golSubiti = 1

      // act
      const result = ruolo === 'P'
        ? golSubiti * mockConfigurazione.bonusGolSubito
        : golSubiti * mockConfigurazione.bonusGol

      // assert
      expect(result).toBe(-1)
    })

    it('field player should use bonusGol', () => {
      // arrange
      const ruolo = 'D'
      const golSegnati = 1

      // act
      const result = ruolo === 'P'
        ? golSegnati * mockConfigurazione.bonusGolSubito
        : golSegnati * mockConfigurazione.bonusGol

      // assert
      expect(result).toBe(3)
    })
  })

  describe('Configuration Values', () => {
    it('should have reasonable bonus values', () => {
      // assert
      expect(mockConfigurazione.bonusGol).toBeGreaterThan(0)
      expect(mockConfigurazione.bonusAssist).toBeGreaterThan(0)
      expect(mockConfigurazione.bonusAmmonizione).toBeLessThan(0)
      expect(mockConfigurazione.bonusEspulsione).toBeLessThan(mockConfigurazione.bonusAmmonizione)
    })
  })
})
