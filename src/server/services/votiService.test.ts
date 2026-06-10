import { describe, it, expect } from 'vitest'
import type { BonusConfig } from '~/config/bonus'
import {
  calcBonusVoto,
  type VotoInput,
} from './votiService'

describe('votiService', () => {
  // Default bonus configuration for testing
  const defaultConfig: Pick<
    BonusConfig,
    | 'bonusGol'
    | 'bonusGolSubito'
    | 'bonusAssist'
    | 'bonusAmmonizione'
    | 'bonusEspulsione'
    | 'bonusRigoreParato'
    | 'bonusRigoreSbagliato'
    | 'bonusAutogol'
  > = {
    bonusGol: 3,
    bonusGolSubito: -1,
    bonusAssist: 1,
    bonusAmmonizione: -0.5,
    bonusEspulsione: -1,
    bonusRigoreParato: 4,
    bonusRigoreSbagliato: -1,
    bonusAutogol: -2,
  }

  describe('calcBonusVoto', () => {
    it('should calculate bonus for player with only positive bonus', () => {
      const input: VotoInput = {
        Voto: 6,
        Ruolo: 'D',
        Ammonizione: 0,
        Espulsione: 0,
        GolSegnati: 1,
        GolSubiti: 0,
        Assist: 1,
        Autogol: 0,
        RigoriParati: null,
        RigoriErrati: null,
      }

      const result = calcBonusVoto(input, defaultConfig)

      expect(result.voto).toBe(6)
      expect(result.gol).toBe(3) // 1 goal * 3
      expect(result.assist).toBe(1) // 1 assist * 1
      expect(result.ammonizione).toBe(0)
      expect(result.espulsione).toBe(0)
      expect(result.autogol).toBe(0)
      expect(result.altriBonus).toBe(0)
    })

    it('should handle yellow and red card penalties', () => {
      const input: VotoInput = {
        Voto: 6,
        Ruolo: 'D',
        Ammonizione: 1,
        Espulsione: 1,
        GolSegnati: 0,
        GolSubiti: 0,
        Assist: 0,
        Autogol: 0,
        RigoriParati: null,
        RigoriErrati: null,
      }

      const result = calcBonusVoto(input, defaultConfig)

      expect(result.ammonizione).toBe(-0.5)
      expect(result.espulsione).toBe(-1)
    })

    it('should calculate goal + assist for field players', () => {
      const input: VotoInput = {
        Voto: 7,
        Ruolo: 'A',
        Ammonizione: 0,
        Espulsione: 0,
        GolSegnati: 2,
        GolSubiti: 0,
        Assist: 2,
        Autogol: 0,
        RigoriParati: null,
        RigoriErrati: null,
      }

      const result = calcBonusVoto(input, defaultConfig)

      expect(result.gol).toBe(6) // 2 goals * 3
      expect(result.assist).toBe(2) // 2 assists * 1
    })

    it('should handle keeper (P) with goals-against', () => {
      const input: VotoInput = {
        Voto: 6.5,
        Ruolo: 'P',
        Ammonizione: 0,
        Espulsione: 0,
        GolSegnati: 0,
        GolSubiti: 3,
        Assist: 0,
        Autogol: 0,
        RigoriParati: null,
        RigoriErrati: null,
      }

      const result = calcBonusVoto(input, defaultConfig)

      expect(result.gol).toBe(-3) // 3 goals conceded * -1
      expect(result.voto).toBe(6.5)
    })

    it('should handle null voto as 0', () => {
      const input: VotoInput = {
        Voto: null,
        Ruolo: 'C',
        Ammonizione: 0,
        Espulsione: 0,
        GolSegnati: 0,
        GolSubiti: 0,
        Assist: 0,
        Autogol: 0,
        RigoriParati: null,
        RigoriErrati: null,
      }

      const result = calcBonusVoto(input, defaultConfig)

      expect(result.voto).toBe(0)
    })

    it('should calculate saved penalties', () => {
      const input: VotoInput = {
        Voto: 7,
        Ruolo: 'P',
        Ammonizione: 0,
        Espulsione: 0,
        GolSegnati: 0,
        GolSubiti: 0,
        Assist: 0,
        Autogol: 0,
        RigoriParati: 2,
        RigoriErrati: 0,
      }

      const result = calcBonusVoto(input, defaultConfig)

      expect(result.altriBonus).toBe(8) // 2 saved * 4
    })

    it('should calculate missed penalties', () => {
      const input: VotoInput = {
        Voto: 5,
        Ruolo: 'A',
        Ammonizione: 0,
        Espulsione: 0,
        GolSegnati: 0,
        GolSubiti: 0,
        Assist: 0,
        Autogol: 0,
        RigoriParati: null,
        RigoriErrati: 1,
      }

      const result = calcBonusVoto(input, defaultConfig)

      expect(result.altriBonus).toBe(-1) // 1 missed * -1
    })

    it('should calculate own goal penalty', () => {
      const input: VotoInput = {
        Voto: 4,
        Ruolo: 'D',
        Ammonizione: 0,
        Espulsione: 0,
        GolSegnati: 0,
        GolSubiti: 0,
        Assist: 0,
        Autogol: 1,
        RigoriParati: null,
        RigoriErrati: null,
      }

      const result = calcBonusVoto(input, defaultConfig)

      expect(result.autogol).toBe(-2) // 1 own goal * -2
    })

    it('should handle complex bonus combination', () => {
      const input: VotoInput = {
        Voto: 7,
        Ruolo: 'D',
        Ammonizione: 1,
        Espulsione: 0,
        GolSegnati: 1,
        GolSubiti: 0,
        Assist: 1,
        Autogol: 0,
        RigoriParati: 1,
        RigoriErrati: 0,
      }

      const result = calcBonusVoto(input, defaultConfig)

      expect(result.voto).toBe(7)
      expect(result.gol).toBe(3)
      expect(result.assist).toBe(1)
      expect(result.ammonizione).toBe(-0.5)
      expect(result.espulsione).toBe(0)
      expect(result.altriBonus).toBe(4)
    })

    it('should handle null RigoriParati and RigoriErrati correctly', () => {
      const input: VotoInput = {
        Voto: 6,
        Ruolo: 'P',
        Ammonizione: 0,
        Espulsione: 0,
        GolSegnati: 0,
        GolSubiti: 1,
        Assist: 0,
        Autogol: 0,
        RigoriParati: undefined,
        RigoriErrati: undefined,
      }

      const result = calcBonusVoto(input, defaultConfig)

      // Should use 0 as fallback for null/undefined
      expect(result.altriBonus).toBe(0)
    })
  })
})
