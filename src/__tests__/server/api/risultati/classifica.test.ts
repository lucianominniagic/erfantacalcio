import { describe, it, expect, vi } from 'vitest'
import { type EntityManager } from 'typeorm'

// Mock entities and config before importing the service
vi.mock('~/server/db/entities', () => ({
  Partite: class {},
  Classifiche: class {},
  Utenti: class {},
}))

vi.mock('~/config', () => ({
  Configurazione: {
    importoMulta: 10,
  },
}))

import { UpdateClassifica } from '~/server/api/risultati/services/classifica'
import { Classifiche, Utenti } from '~/server/db/entities'

// ---------------------------------------------------------------------------
// Helper factories
// ---------------------------------------------------------------------------

type PartitaStub = {
  idSquadraH: number
  idSquadraA: number
  golH: number | null
  golA: number | null
  puntiH: number | null
  puntiA: number | null
  hasMultaH: boolean
  hasMultaA: boolean
}

function makePartita(overrides: Partial<PartitaStub> = {}): PartitaStub {
  return {
    idSquadraH: 1,
    idSquadraA: 2,
    golH: 0,
    golA: 0,
    puntiH: 3,
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
// Tests
// ---------------------------------------------------------------------------

describe('UpdateClassifica', () => {
  const ID_SQUADRA = 1
  const ID_TORNEO = 10

  it('counts home wins correctly', async () => {
    const partite = [
      makePartita({ idSquadraH: 1, golH: 3, golA: 1, puntiH: 3 }),
      makePartita({ idSquadraH: 1, golH: 2, golA: 0, puntiH: 3 }),
    ]
    const trx = makeEntityManager(partite)

    await UpdateClassifica(trx, ID_SQUADRA, ID_TORNEO)

    const updateCall = (trx.update as ReturnType<typeof vi.fn>).mock.calls.find(
      (c) => c[0] === Classifiche,
    )
    expect(updateCall).toBeTruthy()
    const data = updateCall![2]
    expect(data.vinteCasa).toBe(2)
    expect(data.pareggiCasa).toBe(0)
    expect(data.perseCasa).toBe(0)
    expect(data.punti).toBe(6) // 3+3
  })

  it('counts away wins correctly', async () => {
    const partite = [
      makePartita({ idSquadraH: 2, idSquadraA: 1, golH: 0, golA: 2, puntiA: 3 }),
    ]
    const trx = makeEntityManager(partite)

    await UpdateClassifica(trx, ID_SQUADRA, ID_TORNEO)

    const updateCall = (trx.update as ReturnType<typeof vi.fn>).mock.calls.find(
      (c) => c[0] === Classifiche,
    )
    const data = updateCall![2]
    expect(data.vinteTrasferta).toBe(1)
    expect(data.punti).toBe(3)
  })

  it('counts draws correctly', async () => {
    const partite = [
      makePartita({ idSquadraH: 1, golH: 1, golA: 1, puntiH: 1 }),
    ]
    const trx = makeEntityManager(partite)

    await UpdateClassifica(trx, ID_SQUADRA, ID_TORNEO)

    const updateCall = (trx.update as ReturnType<typeof vi.fn>).mock.calls.find(
      (c) => c[0] === Classifiche,
    )
    const data = updateCall![2]
    expect(data.pareggiCasa).toBe(1)
    expect(data.vinteCasa).toBe(0)
    expect(data.perseCasa).toBe(0)
  })

  it('counts losses correctly', async () => {
    const partite = [
      makePartita({ idSquadraH: 1, golH: 0, golA: 3, puntiH: 0 }),
    ]
    const trx = makeEntityManager(partite)

    await UpdateClassifica(trx, ID_SQUADRA, ID_TORNEO)

    const updateCall = (trx.update as ReturnType<typeof vi.fn>).mock.calls.find(
      (c) => c[0] === Classifiche,
    )
    const data = updateCall![2]
    expect(data.perseCasa).toBe(1)
    expect(data.vinteCasa).toBe(0)
  })

  it('excludes points for a multa home', async () => {
    const partite = [
      makePartita({ idSquadraH: 1, golH: 3, golA: 0, puntiH: 3, hasMultaH: true }),
    ]
    const trx = makeEntityManager(partite)

    await UpdateClassifica(trx, ID_SQUADRA, ID_TORNEO)

    const updateCall = (trx.update as ReturnType<typeof vi.fn>).mock.calls.find(
      (c) => c[0] === Classifiche,
    )
    const data = updateCall![2]
    // hasMultaH=true → puntiH excluded from totals
    expect(data.punti).toBe(0)
  })

  it('calculates differenzaReti correctly', async () => {
    const partite = [
      makePartita({ idSquadraH: 1, idSquadraA: 2, golH: 3, golA: 1, puntiH: 3 }),
      makePartita({ idSquadraH: 2, idSquadraA: 1, golH: 1, golA: 2, puntiA: 3 }),
    ]
    const trx = makeEntityManager(partite)

    await UpdateClassifica(trx, ID_SQUADRA, ID_TORNEO)

    const updateCall = (trx.update as ReturnType<typeof vi.fn>).mock.calls.find(
      (c) => c[0] === Classifiche,
    )
    const data = updateCall![2]
    // golFattiH=3, golSubitiH=1, golFattiA=2, golSubitiA=1 → (3+2) - (1+1) = 3
    expect(data.differenzaReti).toBe(3)
  })

  it('calculates importoMulte correctly', async () => {
    const partite = [
      makePartita({ idSquadraH: 1, hasMultaH: true }),
      makePartita({ idSquadraA: 1, hasMultaA: true }),
    ]
    const trx = makeEntityManager(partite)

    await UpdateClassifica(trx, ID_SQUADRA, ID_TORNEO)

    const utentiUpdateCall = (trx.update as ReturnType<typeof vi.fn>).mock.calls.find(
      (c) => c[0] === Utenti,
    )
    // 2 multe × 10 = 20
    expect(utentiUpdateCall![2].importoMulte).toBe(20)
  })

  it('calculates giocate correctly', async () => {
    const partite = [
      makePartita({ idSquadraH: 1, idSquadraA: 2, golH: 1, golA: 0 }),
      makePartita({ idSquadraH: 2, idSquadraA: 1, golH: 2, golA: 3 }),
    ]
    const trx = makeEntityManager(partite)

    await UpdateClassifica(trx, ID_SQUADRA, ID_TORNEO)

    const updateCall = (trx.update as ReturnType<typeof vi.fn>).mock.calls.find(
      (c) => c[0] === Classifiche,
    )
    const data = updateCall![2]
    expect(data.giocate).toBe(2)
  })
})
