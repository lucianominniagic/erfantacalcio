import { describe, it, expect } from 'vitest'
import {
  initStats,
  accumulate,
  round2,
  type SquadraStats,
} from './statisticheService'

describe('statisticheService', () => {
  describe('initStats', () => {
    it('should initialize stats with all fields to zero/null', () => {
      const result = initStats(1, 'FC Test', null)

      expect(result.idSquadra).toBe(1)
      expect(result.squadra).toBe('FC Test')
      expect(result.foto).toBeNull()
      expect(result.giocate).toBe(0)
      expect(result.vittorie).toBe(0)
      expect(result.pareggi).toBe(0)
      expect(result.sconfitte).toBe(0)
      expect(result.vittorieCasa).toBe(0)
      expect(result.giocateCasa).toBe(0)
      expect(result.vittorieTrasferta).toBe(0)
      expect(result.giocateTrasferta).toBe(0)
      expect(result.fantapuntiTot).toBe(0)
      expect(result.golFatti).toBe(0)
      expect(result.golSubiti).toBe(0)
      expect(result.cleanSheet).toBe(0)
      expect(result.partiteSenzaGol).toBe(0)
      expect(result.miglioreGiornata).toBeNull()
      expect(result.miglioreFantapunti).toBeNull()
      expect(result.peggioreGiornata).toBeNull()
      expect(result.peggioreFantapunti).toBeNull()
      expect(result.miglioreVittoriaScarto).toBe(-Infinity)
      expect(result.miglioreVittoriaLabel).toBeNull()
      expect(result.peggioreSconfittaScarto).toBe(Infinity)
      expect(result.peggioreSconfittaLabel).toBeNull()
    })

    it('should accept foto string', () => {
      const foto = 'https://example.com/foto.jpg'
      const result = initStats(2, 'FC Another', foto)

      expect(result.foto).toBe(foto)
    })
  })

  describe('accumulate', () => {
    it('should accumulate home win correctly', () => {
      const stats = initStats(1, 'FC Test', null)

      accumulate(stats, true, 75, 2, 0, 'Inter', 1)

      expect(stats.giocate).toBe(1)
      expect(stats.vittorie).toBe(1)
      expect(stats.vittorieCasa).toBe(1)
      expect(stats.giocateCasa).toBe(1)
      expect(stats.fantapuntiTot).toBe(75)
      expect(stats.golFatti).toBe(2)
      expect(stats.golSubiti).toBe(0)
      expect(stats.cleanSheet).toBe(1)
      expect(stats.miglioreFantapunti).toBe(75)
      expect(stats.miglioreGiornata).toBe(1)
      expect(stats.miglioreVittoriaLabel).toBe('2-0 vs Inter (G1)')
    })

    it('should accumulate away draw correctly', () => {
      const stats = initStats(1, 'FC Test', null)

      accumulate(stats, false, 65, 1, 1, 'AC Milan', 2)

      expect(stats.giocate).toBe(1)
      expect(stats.pareggi).toBe(1)
      expect(stats.giocateTrasferta).toBe(1)
      expect(stats.fantapuntiTot).toBe(65)
      expect(stats.golFatti).toBe(1)
      expect(stats.golSubiti).toBe(1)
      expect(stats.cleanSheet).toBe(0)
      expect(stats.partiteSenzaGol).toBe(0)
    })

    it('should accumulate loss correctly', () => {
      const stats = initStats(1, 'FC Test', null)

      accumulate(stats, true, 45, 1, 3, 'Juventus', 3)

      expect(stats.giocate).toBe(1)
      expect(stats.sconfitte).toBe(1)
      expect(stats.fantapuntiTot).toBe(45)
      expect(stats.golFatti).toBe(1)
      expect(stats.golSubiti).toBe(3)
      expect(stats.peggioreFantapunti).toBe(45)
      expect(stats.peggioreGiornata).toBe(3)
      expect(stats.peggioreSconfittaLabel).toBe('1-3 vs Juventus (G3)')
    })

    it('should track cleanSheet (goals conceded = 0)', () => {
      const stats = initStats(1, 'FC Test', null)

      accumulate(stats, true, 70, 2, 0, 'Roma', 1)
      accumulate(stats, false, 75, 1, 1, 'Napoli', 2)
      accumulate(stats, true, 80, 3, 0, 'Lazio', 3)

      expect(stats.cleanSheet).toBe(2)
    })

    it('should track partiteSenzaGol (goals scored = 0)', () => {
      const stats = initStats(1, 'FC Test', null)

      accumulate(stats, true, 50, 0, 1, 'Roma', 1)
      accumulate(stats, false, 55, 1, 0, 'Napoli', 2)
      accumulate(stats, true, 60, 0, 0, 'Lazio', 3)

      expect(stats.partiteSenzaGol).toBe(2)
    })

    it('should update best fantapunti match', () => {
      const stats = initStats(1, 'FC Test', null)

      accumulate(stats, true, 60, 1, 0, 'Roma', 1)
      accumulate(stats, false, 85, 2, 1, 'Napoli', 2)
      accumulate(stats, true, 70, 1, 0, 'Lazio', 3)

      expect(stats.miglioreFantapunti).toBe(85)
      expect(stats.miglioreGiornata).toBe(2)
    })

    it('should update worst fantapunti match', () => {
      const stats = initStats(1, 'FC Test', null)

      accumulate(stats, true, 60, 1, 0, 'Roma', 1)
      accumulate(stats, false, 35, 0, 2, 'Napoli', 2)
      accumulate(stats, true, 70, 1, 0, 'Lazio', 3)

      expect(stats.peggioreFantapunti).toBe(35)
      expect(stats.peggioreGiornata).toBe(2)
    })

    it('should track biggest win', () => {
      const stats = initStats(1, 'FC Test', null)

      accumulate(stats, true, 70, 2, 1, 'Roma', 1)
      accumulate(stats, false, 80, 4, 0, 'Napoli', 2)
      accumulate(stats, true, 75, 3, 1, 'Lazio', 3)

      expect(stats.miglioreVittoriaScarto).toBe(4)
      expect(stats.miglioreVittoriaLabel).toBe('4-0 vs Napoli (G2)')
    })

    it('should track biggest loss (most negative diff)', () => {
      const stats = initStats(1, 'FC Test', null)

      accumulate(stats, true, 40, 1, 2, 'Roma', 1)
      accumulate(stats, false, 30, 0, 3, 'Napoli', 2)
      accumulate(stats, true, 50, 2, 1, 'Lazio', 3)

      expect(stats.peggioreSconfittaScarto).toBe(-3)
      expect(stats.peggioreSconfittaLabel).toBe('0-3 vs Napoli (G2)')
    })

    it('should accumulate multiple matches correctly', () => {
      const stats = initStats(1, 'FC Test', null)

      accumulate(stats, true, 70, 2, 0, 'Roma', 1)
      accumulate(stats, false, 65, 1, 1, 'Napoli', 2)
      accumulate(stats, true, 50, 0, 2, 'Lazio', 3)

      expect(stats.giocate).toBe(3)
      expect(stats.vittorie).toBe(1)
      expect(stats.pareggi).toBe(1)
      expect(stats.sconfitte).toBe(1)
      expect(stats.vittorieCasa).toBe(1)
      expect(stats.giocateCasa).toBe(2)
      expect(stats.giocateTrasferta).toBe(1)
      expect(stats.fantapuntiTot).toBe(185)
      expect(stats.golFatti).toBe(3)
      expect(stats.golSubiti).toBe(3)
      expect(stats.cleanSheet).toBe(1)
    })
  })

  describe('round2', () => {
    it('should round to 2 decimal places', () => {
      expect(round2(3.14159)).toBe(3.14)
      expect(round2(2.99999)).toBe(3)
      // Note: 1.005 has floating-point precision issue (1.005 * 100 = 100.49999...)
      // So Math.round() returns 1, not 1.01
      expect(round2(1.005)).toBe(1)
    })

    it('should handle integers', () => {
      expect(round2(5)).toBe(5)
      expect(round2(10)).toBe(10)
    })

    it('should handle negative numbers', () => {
      expect(round2(-3.14159)).toBe(-3.14)
      // Same floating-point precision issue
      expect(round2(-1.005)).toBe(-1)
    })

    it('should handle zero', () => {
      expect(round2(0)).toBe(0)
    })

    it('should handle very small numbers', () => {
      expect(round2(0.001)).toBe(0)
      expect(round2(0.005)).toBe(0.01)
    })

    it('should handle large numbers', () => {
      expect(round2(12345.6789)).toBe(12345.68)
    })

    it('should keep trailing zeros only in JS representation', () => {
      // In JavaScript, 3.10 === 3.1, so we check the value
      expect(round2(3.1)).toBe(3.1)
      expect(round2(3.1)).toBe(3.1)
    })
  })
})
