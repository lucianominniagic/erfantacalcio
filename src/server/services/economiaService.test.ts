import { describe, it, expect } from 'vitest'
import {
  calcolaEconomia,
  type CalcolaEconomiaInput,
  type PremiStagionali,
} from './economiaService'

describe('economiaService', () => {
  describe('calcolaEconomia - premi stagionali', () => {
    it('calcola correttamente i 4 importi premi con montepremi 1000', () => {
      const input: CalcolaEconomiaInput = {
        montepremi: 1000,
        classificaMap: {},
        idVincitriceChampions: null,
        squadre: [],
      }

      const result = calcolaEconomia(input)

      expect(result.premi.primo).toBe(520) // 1000 * 52 / 100
      expect(result.premi.secondo).toBe(200) // 1000 * 20 / 100
      expect(result.premi.terzo).toBe(130) // 1000 * 13 / 100
      expect(result.premi.champions).toBe(150) // 1000 * 15 / 100
    })

    it('tutti i premi sono 0 con montepremi 0', () => {
      const input: CalcolaEconomiaInput = {
        montepremi: 0,
        classificaMap: {},
        idVincitriceChampions: null,
        squadre: [],
      }

      const result = calcolaEconomia(input)

      expect(result.premi.primo).toBe(0)
      expect(result.premi.secondo).toBe(0)
      expect(result.premi.terzo).toBe(0)
      expect(result.premi.champions).toBe(0)
    })

    it('applica Math.round correttamente con montepremi 333', () => {
      const input: CalcolaEconomiaInput = {
        montepremi: 333,
        classificaMap: {},
        idVincitriceChampions: null,
        squadre: [],
      }

      const result = calcolaEconomia(input)

      // Math.round(333 * 52 / 100) = Math.round(173.16) = 173
      expect(result.premi.primo).toBe(173)
      // Math.round(333 * 20 / 100) = Math.round(66.6) = 67
      expect(result.premi.secondo).toBe(67)
      // Math.round(333 * 13 / 100) = Math.round(43.29) = 43
      expect(result.premi.terzo).toBe(43)
      // Math.round(333 * 15 / 100) = Math.round(49.95) = 50
      expect(result.premi.champions).toBe(50)
    })
  })

  describe('calcolaEconomia - squadra senza premi', () => {
    it('squadra non classificata e non vincitrice champions ha premio=0, premiVinti=[], saldo negativo', () => {
      const input: CalcolaEconomiaInput = {
        montepremi: 1000,
        classificaMap: { 5: 10 }, // posizione 10, non conta per premi
        idVincitriceChampions: 99,
        squadre: [
          {
            id: 5,
            importoAnnuale: 200,
            importoMulte: 30,
            importoMercato: 20,
          },
        ],
      }

      const result = calcolaEconomia(input)

      expect(result.squadreCalcolate).toHaveLength(1)
      const squadra = result.squadreCalcolate[0]
      expect(squadra.id).toBe(5)
      expect(squadra.premio).toBe(0)
      expect(squadra.premiVinti).toHaveLength(0)
      expect(squadra.pagato).toBe(250)
      expect(squadra.saldo).toBe(-250) // 0 - 250
    })
  })

  describe('calcolaEconomia - primo classificato', () => {
    it('primo classificato ha premio corretto, label e color', () => {
      const input: CalcolaEconomiaInput = {
        montepremi: 1000,
        classificaMap: { 1: 1 },
        idVincitriceChampions: null,
        squadre: [
          {
            id: 1,
            importoAnnuale: 100,
            importoMulte: null,
            importoMercato: null,
          },
        ],
      }

      const result = calcolaEconomia(input)

      expect(result.squadreCalcolate).toHaveLength(1)
      const squadra = result.squadreCalcolate[0]
      expect(squadra.premio).toBe(520)
      expect(squadra.pagato).toBe(100)
      expect(squadra.saldo).toBe(420)
      expect(squadra.premiVinti).toHaveLength(1)
      expect(squadra.premiVinti[0]).toEqual({
        label: '1° Classificato',
        color: 'warning',
      })
    })
  })

  describe('calcolaEconomia - secondo classificato', () => {
    it('secondo classificato ha premio corretto, label e color default', () => {
      const input: CalcolaEconomiaInput = {
        montepremi: 1000,
        classificaMap: { 2: 2 },
        idVincitriceChampions: null,
        squadre: [
          {
            id: 2,
            importoAnnuale: 50,
            importoMulte: null,
            importoMercato: null,
          },
        ],
      }

      const result = calcolaEconomia(input)

      const squadra = result.squadreCalcolate[0]
      expect(squadra.premio).toBe(200)
      expect(squadra.premiVinti).toHaveLength(1)
      expect(squadra.premiVinti[0]).toEqual({
        label: '2° Classificato',
        color: 'default',
      })
    })
  })

  describe('calcolaEconomia - terzo classificato', () => {
    it('terzo classificato ha premio corretto, label e color default', () => {
      const input: CalcolaEconomiaInput = {
        montepremi: 1000,
        classificaMap: { 3: 3 },
        idVincitriceChampions: null,
        squadre: [
          {
            id: 3,
            importoAnnuale: 75,
            importoMulte: null,
            importoMercato: null,
          },
        ],
      }

      const result = calcolaEconomia(input)

      const squadra = result.squadreCalcolate[0]
      expect(squadra.premio).toBe(130)
      expect(squadra.premiVinti).toHaveLength(1)
      expect(squadra.premiVinti[0]).toEqual({
        label: '3° Classificato',
        color: 'default',
      })
    })
  })

  describe('calcolaEconomia - vincitore champions', () => {
    it('vincitore champions ha premio corretto, label e color info', () => {
      const input: CalcolaEconomiaInput = {
        montepremi: 1000,
        classificaMap: { 5: 5 },
        idVincitriceChampions: 5,
        squadre: [
          {
            id: 5,
            importoAnnuale: 100,
            importoMulte: null,
            importoMercato: null,
          },
        ],
      }

      const result = calcolaEconomia(input)

      const squadra = result.squadreCalcolate[0]
      expect(squadra.premio).toBe(150)
      expect(squadra.premiVinti).toHaveLength(1)
      expect(squadra.premiVinti[0]).toEqual({
        label: 'Vincitore Champions',
        color: 'info',
      })
    })
  })

  describe('calcolaEconomia - doppio premio', () => {
    it('squadra primo classificato e vincitore champions ha premio = primo + champions', () => {
      const input: CalcolaEconomiaInput = {
        montepremi: 1000,
        classificaMap: { 1: 1 },
        idVincitriceChampions: 1,
        squadre: [
          {
            id: 1,
            importoAnnuale: 150,
            importoMulte: null,
            importoMercato: null,
          },
        ],
      }

      const result = calcolaEconomia(input)

      const squadra = result.squadreCalcolate[0]
      expect(squadra.premio).toBe(670) // 520 + 150
      expect(squadra.saldo).toBe(520) // 670 - 150
      expect(squadra.premiVinti).toHaveLength(2)
      expect(squadra.premiVinti[0]).toEqual({
        label: '1° Classificato',
        color: 'warning',
      })
      expect(squadra.premiVinti[1]).toEqual({
        label: 'Vincitore Champions',
        color: 'info',
      })
    })
  })

  describe('calcolaEconomia - calcolo pagato', () => {
    it('pagato = importoAnnuale + importoMulte + importoMercato', () => {
      const input: CalcolaEconomiaInput = {
        montepremi: 1000,
        classificaMap: { 1: 1 },
        idVincitriceChampions: null,
        squadre: [
          {
            id: 1,
            importoAnnuale: 100,
            importoMulte: 20,
            importoMercato: 30,
          },
        ],
      }

      const result = calcolaEconomia(input)

      const squadra = result.squadreCalcolate[0]
      expect(squadra.pagato).toBe(150)
    })

    it('null fields contano come 0', () => {
      const input: CalcolaEconomiaInput = {
        montepremi: 1000,
        classificaMap: { 1: 1 },
        idVincitriceChampions: null,
        squadre: [
          {
            id: 1,
            importoAnnuale: 100,
            importoMulte: null,
            importoMercato: null,
          },
        ],
      }

      const result = calcolaEconomia(input)

      const squadra = result.squadreCalcolate[0]
      expect(squadra.pagato).toBe(100)
    })

    it('tutti null fields → pagato = 0', () => {
      const input: CalcolaEconomiaInput = {
        montepremi: 1000,
        classificaMap: { 1: 1 },
        idVincitriceChampions: null,
        squadre: [
          {
            id: 1,
            importoAnnuale: null,
            importoMulte: null,
            importoMercato: null,
          },
        ],
      }

      const result = calcolaEconomia(input)

      const squadra = result.squadreCalcolate[0]
      expect(squadra.pagato).toBe(0)
    })
  })

  describe('calcolaEconomia - calcolo saldo', () => {
    it('saldo = premio - pagato positivo quando squadra vince', () => {
      const input: CalcolaEconomiaInput = {
        montepremi: 1000,
        classificaMap: { 1: 1 },
        idVincitriceChampions: null,
        squadre: [
          {
            id: 1,
            importoAnnuale: 200,
            importoMulte: null,
            importoMercato: null,
          },
        ],
      }

      const result = calcolaEconomia(input)

      const squadra = result.squadreCalcolate[0]
      expect(squadra.saldo).toBe(320) // 520 - 200
    })

    it('saldo negativo quando squadra non vince', () => {
      const input: CalcolaEconomiaInput = {
        montepremi: 1000,
        classificaMap: { 5: 10 },
        idVincitriceChampions: null,
        squadre: [
          {
            id: 5,
            importoAnnuale: 200,
            importoMulte: null,
            importoMercato: null,
          },
        ],
      }

      const result = calcolaEconomia(input)

      const squadra = result.squadreCalcolate[0]
      expect(squadra.saldo).toBe(-200) // 0 - 200
    })
  })

  describe('calcolaEconomia - ordinamento', () => {
    it('squadreCalcolate ordinato per premio DESC', () => {
      const input: CalcolaEconomiaInput = {
        montepremi: 1000,
        classificaMap: { 1: 1, 2: 2, 3: 3, 4: 10 },
        idVincitriceChampions: null,
        squadre: [
          { id: 4, importoAnnuale: 50, importoMulte: null, importoMercato: null },
          { id: 1, importoAnnuale: 100, importoMulte: null, importoMercato: null },
          { id: 3, importoAnnuale: 75, importoMulte: null, importoMercato: null },
          { id: 2, importoAnnuale: 60, importoMulte: null, importoMercato: null },
        ],
      }

      const result = calcolaEconomia(input)

      expect(result.squadreCalcolate).toHaveLength(4)
      expect(result.squadreCalcolate[0].id).toBe(1) // premio 520
      expect(result.squadreCalcolate[1].id).toBe(2) // premio 200
      expect(result.squadreCalcolate[2].id).toBe(3) // premio 130
      expect(result.squadreCalcolate[3].id).toBe(4) // premio 0
    })

    it('a parità di premio, ordine rimane stabile', () => {
      const input: CalcolaEconomiaInput = {
        montepremi: 1000,
        classificaMap: { 1: 10, 2: 11 },
        idVincitriceChampions: null,
        squadre: [
          { id: 1, importoAnnuale: 100, importoMulte: null, importoMercato: null },
          { id: 2, importoAnnuale: 50, importoMulte: null, importoMercato: null },
        ],
      }

      const result = calcolaEconomia(input)

      // Entrambi hanno premio 0, order è stabile (id 1 prima di id 2)
      expect(result.squadreCalcolate[0].id).toBe(1)
      expect(result.squadreCalcolate[1].id).toBe(2)
    })
  })

  describe('calcolaEconomia - input edge case', () => {
    it('squadre vuoto → squadreCalcolate vuoto, premi calcolati comunque', () => {
      const input: CalcolaEconomiaInput = {
        montepremi: 1000,
        classificaMap: {},
        idVincitriceChampions: null,
        squadre: [],
      }

      const result = calcolaEconomia(input)

      expect(result.squadreCalcolate).toHaveLength(0)
      expect(result.premi.primo).toBe(520)
      expect(result.premi.secondo).toBe(200)
      expect(result.premi.terzo).toBe(130)
      expect(result.premi.champions).toBe(150)
    })

    it('multiplesquadre con distribuzione diversa di premi', () => {
      const input: CalcolaEconomiaInput = {
        montepremi: 1000,
        classificaMap: { 1: 1, 2: 2, 3: 3, 5: 150 },
        idVincitriceChampions: 5,
        squadre: [
          { id: 1, importoAnnuale: 100, importoMulte: null, importoMercato: null },
          { id: 2, importoAnnuale: 100, importoMulte: null, importoMercato: null },
          { id: 3, importoAnnuale: 100, importoMulte: null, importoMercato: null },
          { id: 5, importoAnnuale: 100, importoMulte: null, importoMercato: null },
        ],
      }

      const result = calcolaEconomia(input)

      expect(result.squadreCalcolate).toHaveLength(4)
      const sq1 = result.squadreCalcolate.find((s) => s.id === 1)!
      const sq2 = result.squadreCalcolate.find((s) => s.id === 2)!
      const sq3 = result.squadreCalcolate.find((s) => s.id === 3)!
      const sq5 = result.squadreCalcolate.find((s) => s.id === 5)!

      expect(sq1.premio).toBe(520)
      expect(sq2.premio).toBe(200)
      expect(sq3.premio).toBe(130)
      expect(sq5.premio).toBe(150) // solo champions, non classificato nel primo-terzo

      // Ordinamento: 520, 200, 150, 130
      expect(result.squadreCalcolate[0].id).toBe(1)
      expect(result.squadreCalcolate[1].id).toBe(2)
      expect(result.squadreCalcolate[2].id).toBe(5)
      expect(result.squadreCalcolate[3].id).toBe(3)
    })
  })

  describe('calcolaEconomia - isAdmin field', () => {
    it('ignora isAdmin field (non usato nei calcoli)', () => {
      const input: CalcolaEconomiaInput = {
        montepremi: 1000,
        classificaMap: { 1: 1 },
        idVincitriceChampions: null,
        squadre: [
          {
            id: 1,
            importoAnnuale: 100,
            importoMulte: null,
            importoMercato: null,
            isAdmin: true,
          },
        ],
      }

      const result = calcolaEconomia(input)

      const squadra = result.squadreCalcolate[0]
      expect(squadra.premio).toBe(520)
      expect(squadra.saldo).toBe(420)
    })
  })
})
