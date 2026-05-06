import { describe, it, expect } from 'vitest'
import {
  calendarioSchema,
  tabellinoSchema,
  serieASchema,
  giornataSchema,
} from './index'

describe('calendario — Schema validation', () => {
  describe('calendarioSchema', () => {
    it('should validate minimal calendario object with defaults', () => {
      const minimal = {}

      const result = calendarioSchema.safeParse(minimal)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.id).toBe(0)
        expect(result.data.nome).toBe('')
        expect(result.data.isGiocata).toBe(false)
      }
    })

    it('should validate full calendario object', () => {
      const full = {
        id: 5,
        idTorneo: 2,
        nome: 'Giornata 5',
        gruppoFase: 'Fase 1',
        giornata: 5,
        giornataSerieA: 15,
        isGiocata: true,
        isSovrapposta: false,
        isRecupero: false,
        data: '2025-01-15T20:00:00Z',
        dataFine: '2025-01-16T00:00:00Z',
        girone: 1,
        isSelected: true,
      }

      const result = calendarioSchema.safeParse(full)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.nome).toBe('Giornata 5')
        expect(result.data.isGiocata).toBe(true)
      }
    })

    it('should handle null gruppoFase and girone', () => {
      const withNulls = {
        id: 1,
        gruppoFase: null,
        girone: null,
      }

      const result = calendarioSchema.safeParse(withNulls)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.gruppoFase).toBeNull()
        expect(result.data.girone).toBeNull()
      }
    })
  })

  describe('tabellinoSchema', () => {
    it('should validate valid tabellino object', () => {
      const validTabellino = {
        idPartita: 1,
        escludi: false,
        calcoloGolSegnatiHome: 2,
        calcoloGolSegnatiAway: 1,
        fantapuntiHome: 75,
        fantapuntiAway: 65,
        multaHome: false,
        multaAway: false,
      }

      const result = tabellinoSchema.safeParse(validTabellino)

      expect(result.success).toBe(true)
    })

    it('should reject tabellino with gol outside range', () => {
      const invalidTabellino = {
        idPartita: 1,
        escludi: false,
        calcoloGolSegnatiHome: 15, // > 10
        calcoloGolSegnatiAway: 1,
        fantapuntiHome: 75,
        fantapuntiAway: 65,
        multaHome: false,
        multaAway: false,
      }

      const result = tabellinoSchema.safeParse(invalidTabellino)

      expect(result.success).toBe(false)
    })

    it('should reject tabellino with fantapunti outside range', () => {
      const invalidTabellino = {
        idPartita: 1,
        escludi: false,
        calcoloGolSegnatiHome: 2,
        calcoloGolSegnatiAway: 1,
        fantapuntiHome: 150, // > 120
        fantapuntiAway: 65,
        multaHome: false,
        multaAway: false,
      }

      const result = tabellinoSchema.safeParse(invalidTabellino)

      expect(result.success).toBe(false)
    })

    it('should accept minimum gol values (0)', () => {
      const validTabellino = {
        idPartita: 1,
        escludi: true,
        calcoloGolSegnatiHome: 0,
        calcoloGolSegnatiAway: 0,
        fantapuntiHome: 0,
        fantapuntiAway: 0,
        multaHome: true,
        multaAway: true,
      }

      const result = tabellinoSchema.safeParse(validTabellino)

      expect(result.success).toBe(true)
    })

    it('should accept maximum gol values (10)', () => {
      const validTabellino = {
        idPartita: 1,
        escludi: false,
        calcoloGolSegnatiHome: 10,
        calcoloGolSegnatiAway: 10,
        fantapuntiHome: 120,
        fantapuntiAway: 120,
        multaHome: false,
        multaAway: false,
      }

      const result = tabellinoSchema.safeParse(validTabellino)

      expect(result.success).toBe(true)
    })
  })

  describe('serieASchema', () => {
    it('should validate valid SerieA match object', () => {
      const validMatch = {
        giornata: 1,
        squadraHome: 'Milan',
        squadraAway: 'Inter',
      }

      const result = serieASchema.safeParse(validMatch)

      expect(result.success).toBe(true)
    })

    it('should require all fields', () => {
      const incomplete = {
        giornata: 1,
        squadraHome: 'Milan',
        // Missing squadraAway
      }

      const result = serieASchema.safeParse(incomplete)

      expect(result.success).toBe(false)
    })
  })

  describe('giornataSchema', () => {
    it('should validate valid giornata object with partite', () => {
      const validGiornata = {
        idCalendario: 1,
        idTorneo: 1,
        giornata: 1,
        giornataSerieA: 1,
        isGiocata: true,
        isSovrapposta: false,
        isRecupero: false,
        data: '2025-01-15T20:00:00Z',
        dataFine: '2025-01-16T00:00:00Z',
        girone: 'A',
        partite: [
          {
            idPartita: 1,
            idHome: 1,
            squadraHome: 'Team A',
            fotoHome: null,
            magliaHome: null,
            multaHome: false,
            golHome: 2,
            idAway: 2,
            squadraAway: 'Team B',
            fotoAway: null,
            magliaAway: null,
            multaAway: false,
            golAway: 1,
            isFattoreHome: true,
          },
        ],
        Torneo: 'Torneo Test',
        Descrizione: 'Test Description',
        Title: 'Test Title',
        SubTitle: 'Test Subtitle',
      }

      const result = giornataSchema.safeParse(validGiornata)

      expect(result.success).toBe(true)
    })

    it('should require mandatory giornata fields', () => {
      const incomplete = {
        idCalendario: 1,
        // Missing other required fields
      }

      const result = giornataSchema.safeParse(incomplete)

      expect(result.success).toBe(false)
    })

    it('should handle null golHome/golAway', () => {
      const giornataWithNullGol = {
        idCalendario: 1,
        idTorneo: 1,
        giornata: 1,
        giornataSerieA: 1,
        isGiocata: false,
        isSovrapposta: false,
        isRecupero: false,
        girone: null,
        partite: [
          {
            idPartita: 1,
            idHome: 1,
            multaHome: false,
            golHome: null,
            idAway: 2,
            multaAway: false,
            golAway: null,
            isFattoreHome: false,
          },
        ],
        Torneo: 'Torneo',
        Descrizione: 'Desc',
        Title: 'Title',
        SubTitle: 'SubTitle',
      }

      const result = giornataSchema.safeParse(giornataWithNullGol)

      expect(result.success).toBe(true)
    })

    it('should handle optional SerieA array', () => {
      const giornataWithSerieA = {
        idCalendario: 1,
        idTorneo: 1,
        giornata: 1,
        giornataSerieA: 1,
        isGiocata: true,
        isSovrapposta: false,
        isRecupero: false,
        girone: 1,
        partite: [],
        Torneo: 'Torneo',
        Descrizione: 'Desc',
        Title: 'Title',
        SubTitle: 'SubTitle',
        SerieA: [
          {
            giornata: 1,
            squadraHome: 'Milan',
            squadraAway: 'Inter',
          },
        ],
      }

      const result = giornataSchema.safeParse(giornataWithSerieA)

      expect(result.success).toBe(true)
    })

    it('should accept girone as string, number, or null', () => {
      const gironeAsString = {
        idCalendario: 1,
        idTorneo: 1,
        giornata: 1,
        giornataSerieA: 1,
        isGiocata: false,
        isSovrapposta: false,
        isRecupero: false,
        girone: 'Group A',
        partite: [],
        Torneo: 'Torneo',
        Descrizione: 'Desc',
        Title: 'Title',
        SubTitle: 'SubTitle',
      }

      const result1 = giornataSchema.safeParse(gironeAsString)
      expect(result1.success).toBe(true)

      const gironeAsNumber = {
        ...gironeAsString,
        girone: 1,
      }

      const result2 = giornataSchema.safeParse(gironeAsNumber)
      expect(result2.success).toBe(true)

      const gironeAsNull = {
        ...gironeAsString,
        girone: null,
      }

      const result3 = giornataSchema.safeParse(gironeAsNull)
      expect(result3.success).toBe(true)
    })
  })
})
