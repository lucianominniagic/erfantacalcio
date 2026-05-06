import { describe, it, expect } from 'vitest'
import type { GiocatoreFormazioneType } from '~/types/squadre'
import {
  calcolaCodiceFormazione,
  formatModulo,
  allowedFormations,
  sortPlayersByRoleDescThenCostoDesc,
  sortPlayersByRoleDescThenRiserva,
  checkDataFormazione,
} from './utils'

describe('squadra/utils — Pure Functions', () => {
  describe('calcolaCodiceFormazione', () => {
    it('should calculate formation code correctly with empty campo', () => {
      const result = calcolaCodiceFormazione([], 'P')
      // Expected: P=1 (adding 1 for P), D=0, C=0, A=0 -> "1000"
      expect(result).toBe(1000)
    })

    it('should calculate formation code correctly with multiple players', () => {
      const campo: GiocatoreFormazioneType[] = [
        { ruolo: 'D', nome: 'Player1', costo: 1, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'D', nome: 'Player2', costo: 1, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'C', nome: 'Player3', costo: 1, riserva: null } as GiocatoreFormazioneType,
      ]
      const result = calcolaCodiceFormazione(campo, 'A')
      // P=0, D=2, C=1, A=1 (adding 1 for A) -> "0211"
      expect(result).toBe(211)
    })

    it('should increment count for ruoloGiocatore only', () => {
      const campo: GiocatoreFormazioneType[] = [
        { ruolo: 'D', nome: 'Player1', costo: 1, riserva: null } as GiocatoreFormazioneType,
      ]
      const result = calcolaCodiceFormazione(campo, 'D')
      // P=0, D=2 (1 existing + 1 for D), C=0, A=0 -> "0200"
      expect(result).toBe(200)
    })

    it('should handle formation code with all player types', () => {
      const campo: GiocatoreFormazioneType[] = [
        { ruolo: 'P', nome: 'GK', costo: 1, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'D', nome: 'Defender1', costo: 1, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'D', nome: 'Defender2', costo: 1, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'D', nome: 'Defender3', costo: 1, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'C', nome: 'Mid1', costo: 1, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'C', nome: 'Mid2', costo: 1, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'C', nome: 'Mid3', costo: 1, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'C', nome: 'Mid4', costo: 1, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'A', nome: 'Forward1', costo: 1, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'A', nome: 'Forward2', costo: 1, riserva: null } as GiocatoreFormazioneType,
      ]
      const result = calcolaCodiceFormazione(campo, 'P')
      // P=2 (1 existing + 1 for P), D=3, C=4, A=2 -> "2342"
      expect(result).toBe(2342)
    })
  })

  describe('formatModulo', () => {
    // BUG FIXED: formatModulo now correctly splits on '-' instead of ''
    // Expected: formatModulo('13-4-3') -> '3-4-3'
    // Root cause was: .split('') splits every character, parseInt('-') returns NaN
    // Fix applied: Changed split('') to split('-')

    it('should format modulo string correctly', () => {
      const result = formatModulo('13-4-3')
      expect(result).toBe('3-4-3')
    })

    it('should handle different modulo formats', () => {
      const result = formatModulo('11-4-4-1')
      expect(result).toBe('1-4-4-1')
    })

    it('should format modulo with single digit', () => {
      const result = formatModulo('13-5-2')
      expect(result).toBe('3-5-2')
    })

    it('should handle modulo with leading 1', () => {
      const result = formatModulo('15-3-2')
      expect(result).toBe('5-3-2')
    })

    it('should work with 3-4-3 standard formation', () => {
      const result = formatModulo('13-4-3')
      expect(result).toBe('3-4-3')
    })
  })

  describe('allowedFormations', () => {
    it('should contain valid formations', () => {
      expect(allowedFormations).toContain(1343)
      expect(allowedFormations).toContain(1352)
      expect(allowedFormations).toContain(1451)
      expect(allowedFormations).toContain(1442)
      expect(allowedFormations).toContain(1433)
      expect(allowedFormations).toContain(1541)
      expect(allowedFormations).toContain(1532)
    })

    it('should have exactly 7 allowed formations', () => {
      expect(allowedFormations).toHaveLength(7)
    })

    it('should not contain invalid formations', () => {
      expect(allowedFormations).not.toContain(1000)
      expect(allowedFormations).not.toContain(2000)
    })
  })

  describe('sortPlayersByRoleDescThenCostoDesc', () => {
    it('should sort players by role descending then cost descending', () => {
      const players: GiocatoreFormazioneType[] = [
        { ruolo: 'A', nome: 'Forward', costo: 5, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'C', nome: 'Mid', costo: 3, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'D', nome: 'Defender', costo: 2, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'P', nome: 'Keeper', costo: 1, riserva: null } as GiocatoreFormazioneType,
      ]

      const sorted = sortPlayersByRoleDescThenCostoDesc(players)

      expect(sorted[0].ruolo).toBe('P')
      expect(sorted[1].ruolo).toBe('D')
      expect(sorted[2].ruolo).toBe('C')
      expect(sorted[3].ruolo).toBe('A')
    })

    it('should sort same roles by cost descending', () => {
      const players: GiocatoreFormazioneType[] = [
        { ruolo: 'D', nome: 'Defender1', costo: 2, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'D', nome: 'Defender2', costo: 5, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'D', nome: 'Defender3', costo: 3, riserva: null } as GiocatoreFormazioneType,
      ]

      const sorted = sortPlayersByRoleDescThenCostoDesc(players)

      expect(sorted[0].costo).toBe(5)
      expect(sorted[1].costo).toBe(3)
      expect(sorted[2].costo).toBe(2)
    })

    it('should sort same role and cost by name alphabetically', () => {
      const players: GiocatoreFormazioneType[] = [
        { ruolo: 'D', nome: 'Zebra', costo: 5, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'D', nome: 'Alice', costo: 5, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'D', nome: 'Bob', costo: 5, riserva: null } as GiocatoreFormazioneType,
      ]

      const sorted = sortPlayersByRoleDescThenCostoDesc(players)

      expect(sorted[0].nome).toBe('Alice')
      expect(sorted[1].nome).toBe('Bob')
      expect(sorted[2].nome).toBe('Zebra')
    })

    it('should handle mixed roles and costs', () => {
      const players: GiocatoreFormazioneType[] = [
        { ruolo: 'A', nome: 'Forward1', costo: 3, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'D', nome: 'Defender1', costo: 5, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'A', nome: 'Forward2', costo: 5, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'D', nome: 'Defender2', costo: 2, riserva: null } as GiocatoreFormazioneType,
      ]

      const sorted = sortPlayersByRoleDescThenCostoDesc(players)

      // P > D > C > A, within same role: costo desc, within same role+costo: nome asc
      expect(sorted[0].ruolo).toBe('D')
      expect(sorted[0].costo).toBe(5)
      expect(sorted[1].ruolo).toBe('D')
      expect(sorted[1].costo).toBe(2)
      expect(sorted[2].ruolo).toBe('A')
      expect(sorted[2].costo).toBe(5)
      expect(sorted[3].ruolo).toBe('A')
      expect(sorted[3].costo).toBe(3)
    })
  })

  describe('sortPlayersByRoleDescThenRiserva', () => {
    // FIXED: Now correctly sorts roles in order P > D > C > A
    // The function maintains this order explicitly rather than relying on Set insertion order

    it('should sort players by role then riserva', () => {
      const players: GiocatoreFormazioneType[] = [
        { ruolo: 'A', nome: 'Forward', costo: 5, riserva: 1 } as GiocatoreFormazioneType,
        { ruolo: 'D', nome: 'Defender', costo: 2, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'C', nome: 'Mid', costo: 3, riserva: 1 } as GiocatoreFormazioneType,
        { ruolo: 'P', nome: 'Keeper', costo: 1, riserva: null } as GiocatoreFormazioneType,
      ]

      const sorted = sortPlayersByRoleDescThenRiserva(players)

      // NOW: P > D > C > A guaranteed order
      expect(sorted[0].ruolo).toBe('P')
      expect(sorted[1].ruolo).toBe('D')
      expect(sorted[2].ruolo).toBe('C')
      expect(sorted[3].ruolo).toBe('A')
    })

    it('should place null riserva before numbered riserva within same role', () => {
      const players: GiocatoreFormazioneType[] = [
        { ruolo: 'D', nome: 'Defender1', costo: 5, riserva: 2 } as GiocatoreFormazioneType,
        { ruolo: 'D', nome: 'Defender2', costo: 4, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'D', nome: 'Defender3', costo: 3, riserva: 1 } as GiocatoreFormazioneType,
      ]

      const sorted = sortPlayersByRoleDescThenRiserva(players)

      // Within same role, null riserva should come first
      expect(sorted[0].riserva).toBeNull()
      expect(sorted[1].riserva).toBe(1)
      expect(sorted[2].riserva).toBe(2)
    })

    it('should reassign riserva indices for each role', () => {
      const players: GiocatoreFormazioneType[] = [
        { ruolo: 'D', nome: 'Defender1', costo: 5, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'D', nome: 'Defender2', costo: 4, riserva: 5 } as GiocatoreFormazioneType,
        { ruolo: 'D', nome: 'Defender3', costo: 3, riserva: 10 } as GiocatoreFormazioneType,
        { ruolo: 'C', nome: 'Mid1', costo: 5, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'C', nome: 'Mid2', costo: 4, riserva: 8 } as GiocatoreFormazioneType,
      ]

      const sorted = sortPlayersByRoleDescThenRiserva(players)

      // For each role, riserva indices should be reassigned sequentially starting from 1
      const defenders = sorted.filter((p) => p.ruolo === 'D')
      const mids = sorted.filter((p) => p.ruolo === 'C')

      // First element with null riserva, then 1, 2
      expect(defenders[0].riserva).toBeNull()
      expect(defenders[1].riserva).toBe(1)
      expect(defenders[2].riserva).toBe(2)

      expect(mids[0].riserva).toBeNull()
      expect(mids[1].riserva).toBe(1)
    })

    it('should handle players with all null riserva', () => {
      const players: GiocatoreFormazioneType[] = [
        { ruolo: 'D', nome: 'Defender1', costo: 5, riserva: null } as GiocatoreFormazioneType,
        { ruolo: 'D', nome: 'Defender2', costo: 4, riserva: null } as GiocatoreFormazioneType,
      ]

      const sorted = sortPlayersByRoleDescThenRiserva(players)

      expect(sorted[0].riserva).toBeNull()
      expect(sorted[1].riserva).toBeNull()
    })

    it('should not mutate the original player objects', () => {
      const players: GiocatoreFormazioneType[] = [
        { ruolo: 'A', nome: 'Attacker1', costo: 5, riserva: 3 } as GiocatoreFormazioneType,
        { ruolo: 'A', nome: 'Attacker2', costo: 4, riserva: 1 } as GiocatoreFormazioneType,
      ]
      const originalRiserva0 = players[0].riserva
      const originalRiserva1 = players[1].riserva

      sortPlayersByRoleDescThenRiserva(players)

      expect(players[0].riserva).toBe(originalRiserva0)
      expect(players[1].riserva).toBe(originalRiserva1)
    })
  })

  describe('checkDataFormazione', () => {
    it('should return true for future date', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)
      const isoString = futureDate.toISOString()

      const result = checkDataFormazione(isoString)
      expect(result).toBe(true)
    })

    it('should return false for past date', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)
      const isoString = pastDate.toISOString()

      const result = checkDataFormazione(isoString)
      expect(result).toBe(false)
    })

    it('should handle today date (within same day)', () => {
      const today = new Date()
      const isoString = today.toISOString()

      const result = checkDataFormazione(isoString)
      // Date comparison should work - exact time matching
      expect(typeof result).toBe('boolean')
    })

    it('should handle undefined input gracefully', () => {
      const result = checkDataFormazione(undefined)
      // undefined creates today, so should be around now
      expect(typeof result).toBe('boolean')
    })

    it('should handle valid ISO date string correctly', () => {
      // Create a date far in the future to avoid timezone edge cases
      const futureDate = new Date()
      futureDate.setFullYear(futureDate.getFullYear() + 1)
      const result = checkDataFormazione(futureDate.toISOString())
      // Future date should return true
      expect(result).toBe(true)
    })

    it('should handle past ISO date string correctly', () => {
      const result = checkDataFormazione('2020-01-01T00:00:00Z')
      // Past date should return false
      expect(result).toBe(false)
    })
  })
})
