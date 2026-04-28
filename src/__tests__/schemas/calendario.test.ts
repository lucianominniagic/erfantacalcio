import { describe, it, expect } from 'vitest'
import { calendarioSchema, tabellinoSchema, giornataSchema } from '~/schemas/calendario'

// ---------------------------------------------------------------------------
// calendarioSchema
// ---------------------------------------------------------------------------
describe('calendarioSchema', () => {
  it('parses a minimal valid object (all defaults applied)', () => {
    const result = calendarioSchema.parse({})
    expect(result.id).toBe(0)
    expect(result.isSelected).toBe(false)
    expect(result.isGiocata).toBe(false)
    expect(result.gruppoFase).toBeNull()
  })

  it('parses a fully populated object', () => {
    const input = {
      id: 5,
      idTorneo: 2,
      nome: 'Campionato',
      gruppoFase: 'A',
      giornata: 3,
      giornataSerieA: 10,
      isGiocata: true,
      isSovrapposta: false,
      isRecupero: false,
      data: '2024-09-15',
      dataFine: '2024-09-22',
      girone: 1,
      isSelected: true,
    }
    const result = calendarioSchema.parse(input)
    expect(result.id).toBe(5)
    expect(result.nome).toBe('Campionato')
    expect(result.isSelected).toBe(true)
    expect(result.girone).toBe(1)
  })

  it('allows gruppoFase to be null', () => {
    const result = calendarioSchema.parse({ gruppoFase: null })
    expect(result.gruppoFase).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// tabellinoSchema
// ---------------------------------------------------------------------------
describe('tabellinoSchema', () => {
  const validTabellino = {
    idPartita: 1,
    escludi: false,
    calcoloGolSegnatiHome: 2,
    calcoloGolSegnatiAway: 0,
    fantapuntiHome: 75.5,
    fantapuntiAway: 60,
    multaHome: false,
    multaAway: false,
  }

  it('parses a valid tabellino', () => {
    expect(() => tabellinoSchema.parse(validTabellino)).not.toThrow()
  })

  it('rejects calcoloGolSegnatiHome > 10', () => {
    expect(() =>
      tabellinoSchema.parse({ ...validTabellino, calcoloGolSegnatiHome: 11 }),
    ).toThrow()
  })

  it('rejects calcoloGolSegnatiAway < 0', () => {
    expect(() =>
      tabellinoSchema.parse({ ...validTabellino, calcoloGolSegnatiAway: -1 }),
    ).toThrow()
  })

  it('rejects fantapuntiHome > 120', () => {
    expect(() =>
      tabellinoSchema.parse({ ...validTabellino, fantapuntiHome: 121 }),
    ).toThrow()
  })

  it('rejects fantapuntiAway < 0', () => {
    expect(() =>
      tabellinoSchema.parse({ ...validTabellino, fantapuntiAway: -1 }),
    ).toThrow()
  })

  it('rejects missing required fields', () => {
    expect(() => tabellinoSchema.parse({})).toThrow()
  })
})
