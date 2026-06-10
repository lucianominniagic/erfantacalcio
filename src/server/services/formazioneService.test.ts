import { describe, it, expect } from 'vitest'
import {
  buildFormazioneInsertData,
  buildVotiInsertData,
  type GiocatoreInput,
} from './formazioneService'

describe('formazioneService', () => {
  describe('buildFormazioneInsertData', () => {
    it('should build formazione insert data with correct structure', () => {
      const result = buildFormazioneInsertData(1, 10, '3-4-3', '2025-01-15T20:00:00Z')

      expect(result).toEqual({
        idPartita: 1,
        idSquadra: 10,
        modulo: '3-4-3',
        dataOra: '2025-01-15T20:00:00Z',
        hasBloccata: false,
      })
    })

    it('should always set hasBloccata to false', () => {
      const result = buildFormazioneInsertData(5, 20, '4-4-2', new Date())

      expect(result.hasBloccata).toBe(false)
    })

    it('should accept Date object for dataOra', () => {
      const date = new Date('2025-01-15T20:00:00Z')
      const result = buildFormazioneInsertData(1, 10, '3-4-3', date)

      expect(result.dataOra).toBe(date)
    })

    it('should accept string for dataOra', () => {
      const dateStr = '2025-01-15T20:00:00Z'
      const result = buildFormazioneInsertData(1, 10, '3-4-3', dateStr)

      expect(result.dataOra).toBe(dateStr)
    })

    it('should preserve modulo format', () => {
      const moduli = ['3-4-3', '4-4-2', '5-3-2', '3-5-2']

      moduli.forEach((modulo) => {
        const result = buildFormazioneInsertData(1, 10, modulo, '2025-01-15T20:00:00Z')
        expect(result.modulo).toBe(modulo)
      })
    })
  })

  describe('buildVotiInsertData', () => {
    it('should build voti insert data for single player', () => {
      const giocatori: GiocatoreInput[] = [
        { idGiocatore: 100, titolare: true, riserva: null },
      ]

      const result = buildVotiInsertData(giocatori, 50, 1)

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        idGiocatore: 100,
        idCalendario: 1,
        idFormazione: 50,
        titolare: true,
        riserva: null,
        voto: 0,
      })
    })

    it('should build voti insert data for multiple players', () => {
      const giocatori: GiocatoreInput[] = [
        { idGiocatore: 100, titolare: true, riserva: null },
        { idGiocatore: 101, titolare: true, riserva: null },
        { idGiocatore: 102, titolare: false, riserva: 1 },
        { idGiocatore: 103, titolare: false, riserva: 2 },
      ]

      const result = buildVotiInsertData(giocatori, 50, 1)

      expect(result).toHaveLength(4)
      expect(result[0].idGiocatore).toBe(100)
      expect(result[1].idGiocatore).toBe(101)
      expect(result[2].idGiocatore).toBe(102)
      expect(result[3].idGiocatore).toBe(103)
    })

    it('should always set voto to 0', () => {
      const giocatori: GiocatoreInput[] = [
        { idGiocatore: 100, titolare: true, riserva: null },
        { idGiocatore: 101, titolare: false, riserva: 1 },
      ]

      const result = buildVotiInsertData(giocatori, 50, 1)

      result.forEach((voto) => {
        expect(voto.voto).toBe(0)
      })
    })

    it('should handle riserva undefined as null', () => {
      const giocatori: GiocatoreInput[] = [
        { idGiocatore: 100, titolare: true }, // riserva undefined
      ]

      const result = buildVotiInsertData(giocatori, 50, 1)

      expect(result[0].riserva).toBeNull()
    })

    it('should preserve titolare flag', () => {
      const giocatori: GiocatoreInput[] = [
        { idGiocatore: 100, titolare: true, riserva: null },
        { idGiocatore: 101, titolare: false, riserva: 1 },
        { idGiocatore: 102, titolare: false, riserva: null },
      ]

      const result = buildVotiInsertData(giocatori, 50, 1)

      expect(result[0].titolare).toBe(true)
      expect(result[1].titolare).toBe(false)
      expect(result[2].titolare).toBe(false)
    })

    it('should set correct idFormazione and idCalendario', () => {
      const giocatori: GiocatoreInput[] = [
        { idGiocatore: 100, titolare: true, riserva: null },
      ]

      const result = buildVotiInsertData(giocatori, 123, 456)

      expect(result[0].idFormazione).toBe(123)
      expect(result[0].idCalendario).toBe(456)
    })

    it('should handle empty giocatori array', () => {
      const giocatori: GiocatoreInput[] = []

      const result = buildVotiInsertData(giocatori, 50, 1)

      expect(result).toHaveLength(0)
    })

    it('should not mutate input giocatori array', () => {
      const giocatori: GiocatoreInput[] = [
        { idGiocatore: 100, titolare: true, riserva: null },
      ]
      const originalCopy = JSON.parse(JSON.stringify(giocatori))

      buildVotiInsertData(giocatori, 50, 1)

      expect(giocatori).toEqual(originalCopy)
    })
  })
})
