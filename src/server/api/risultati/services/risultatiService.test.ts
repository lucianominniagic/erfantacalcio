import { describe, it, expect, beforeEach, vi } from 'vitest'
import { type EntityManager } from 'typeorm'

// Mock entities and config before importing the service
vi.mock('~/server/db/entities', () => ({
  Partite: class {},
  Classifiche: class {},
  Utenti: class {},
}))

vi.mock('~/config', () => ({
  Configurazione: {
    importoMulta: 5,
    stagione: '2024/25',
  },
}))

import { punteggioPartita, aggiornaClassifica, aggiornaMulte } from './risultatiService'
import { Classifiche, Utenti } from '~/server/db/entities'

// ---------------------------------------------------------------------------
// Helper factories
// ---------------------------------------------------------------------------

interface PartitaStub {
  idPartita: number
  idSquadraH: number
  idSquadraA: number
  golH: number
  golA: number
  puntiH: number
  puntiA: number
  hasMultaH: boolean
  hasMultaA: boolean
}

function makePartita(overrides: Partial<PartitaStub> = {}): PartitaStub {
  return {
    idPartita: 1,
    idSquadraH: 1,
    idSquadraA: 2,
    golH: 0,
    golA: 0,
    puntiH: 0,
    puntiA: 0,
    hasMultaH: false,
    hasMultaA: false,
    ...overrides,
  }
}

function makeEntityManager(partite: PartitaStub[]) {
  return {
    find: vi.fn().mockResolvedValue(partite),
    update: vi.fn().mockResolvedValue(undefined),
  } as unknown as EntityManager
}

// ---------------------------------------------------------------------------
// Tests for punteggioPartita
// ---------------------------------------------------------------------------

describe('punteggioPartita', () => {
  it('returns 0 when hasClassifica is false (regardless of gol and multa)', () => {
    const result = punteggioPartita(false, false, 3, 1)
    expect(result).toBe(0)
  })

  it('returns 0 when hasClassifica is false and multa is true', () => {
    const result = punteggioPartita(false, true, 5, 0)
    expect(result).toBe(0)
  })

  it('returns 0 when multa is true (multa has precedence)', () => {
    const result = punteggioPartita(true, true, 3, 1)
    expect(result).toBe(0)
  })

  it('returns 3 for a home win (golFatti > golSubiti)', () => {
    const result = punteggioPartita(true, false, 3, 1)
    expect(result).toBe(3)
  })

  it('returns 1 for a draw (golFatti === golSubiti)', () => {
    const result = punteggioPartita(true, false, 2, 2)
    expect(result).toBe(1)
  })

  it('returns 1 for a 0-0 draw', () => {
    const result = punteggioPartita(true, false, 0, 0)
    expect(result).toBe(1)
  })

  it('returns 0 for a loss (golFatti < golSubiti)', () => {
    const result = punteggioPartita(true, false, 1, 3)
    expect(result).toBe(0)
  })

  it('returns 0 for multa even with a win', () => {
    const result = punteggioPartita(true, true, 5, 2)
    expect(result).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Tests for aggiornaClassifica
// ---------------------------------------------------------------------------

describe('aggiornaClassifica', () => {
  const ID_SQUADRA = 1
  const ID_TORNEO = 10

  it('updates Classifiche with correct stats for 1 home win (3-1)', async () => {
    const partite = [makePartita({ idSquadraH: 1, golH: 3, golA: 1, puntiH: 3 })]
    const trx = makeEntityManager(partite)

    await aggiornaClassifica(trx, ID_SQUADRA, ID_TORNEO)

    const updateCall = (trx.update as ReturnType<typeof vi.fn>).mock.calls.find(
      (c) => c[0] === Classifiche,
    )
    expect(updateCall).toBeTruthy()
    const data = updateCall![2]
    expect(data.punti).toBe(3)
    expect(data.vinteCasa).toBe(1)
    expect(data.pareggiCasa).toBe(0)
    expect(data.perseCasa).toBe(0)
    expect(data.golFatti).toBe(3)
    expect(data.golSubiti).toBe(1)
    expect(data.differenzaReti).toBe(2)
    expect(data.giocate).toBe(1)
  })

  it('updates Classifiche with correct stats for 1 away draw (2-2)', async () => {
    const partite = [
      makePartita({
        idSquadraH: 2,
        idSquadraA: 1,
        golH: 2,
        golA: 2,
        puntiA: 1,
      }),
    ]
    const trx = makeEntityManager(partite)

    await aggiornaClassifica(trx, ID_SQUADRA, ID_TORNEO)

    const updateCall = (trx.update as ReturnType<typeof vi.fn>).mock.calls.find(
      (c) => c[0] === Classifiche,
    )
    expect(updateCall).toBeTruthy()
    const data = updateCall![2]
    expect(data.punti).toBe(1)
    expect(data.vinteTrasferta).toBe(0)
    expect(data.pareggiTrasferta).toBe(1)
    expect(data.perseTrasferta).toBe(0)
    expect(data.golFatti).toBe(2)
    expect(data.golSubiti).toBe(2)
    expect(data.giocate).toBe(1)
  })

  it('returns 0 punti when home team has multa (hasMultaH=true)', async () => {
    const partite = [
      makePartita({
        idSquadraH: 1,
        golH: 3,
        golA: 1,
        puntiH: 3,
        hasMultaH: true,
      }),
    ]
    const trx = makeEntityManager(partite)

    await aggiornaClassifica(trx, ID_SQUADRA, ID_TORNEO)

    const updateCall = (trx.update as ReturnType<typeof vi.fn>).mock.calls.find(
      (c) => c[0] === Classifiche,
    )
    const data = updateCall![2]
    expect(data.punti).toBe(0)
  })
})

// ---------------------------------------------------------------------------
// Tests for aggiornaMulte
// ---------------------------------------------------------------------------

describe('aggiornaMulte', () => {
  const ID_SQUADRA = 1

  it('updates Utenti.importoMulte correctly with 2 partite with multa', async () => {
    const partite = [
      makePartita({ idSquadraH: 1, hasMultaH: true }),
      makePartita({ idSquadraA: 1, hasMultaA: true }),
    ]
    const trx = makeEntityManager(partite)

    await aggiornaMulte(trx, ID_SQUADRA)

    const updateCall = (trx.update as ReturnType<typeof vi.fn>).mock.calls.find(
      (c) => c[0] === Utenti,
    )
    expect(updateCall).toBeTruthy()
    const data = updateCall![2]
    // 2 partite con multa × 5 (importoMulta da config) = 10
    expect(data.importoMulte).toBe(10)
  })

  it('sets importoMulte to 0 when no partite with multa', async () => {
    const partite = [
      makePartita({ idSquadraH: 1, hasMultaH: false }),
      makePartita({ idSquadraA: 1, hasMultaA: false }),
    ]
    const trx = makeEntityManager(partite)

    await aggiornaMulte(trx, ID_SQUADRA)

    const updateCall = (trx.update as ReturnType<typeof vi.fn>).mock.calls.find(
      (c) => c[0] === Utenti,
    )
    expect(updateCall).toBeTruthy()
    const data = updateCall![2]
    expect(data.importoMulte).toBe(0)
  })
})
