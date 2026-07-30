import { describe, it, expect, vi, beforeEach } from 'vitest'
import { type EntityManager } from 'typeorm'

// ============================================================================
// Mocks (setup BEFORE imports that depend on these modules)
// ============================================================================

const mockEntityManager = {
  find: vi.fn(),
  findOne: vi.fn(),
  save: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
  decrement: vi.fn(),
  increment: vi.fn(),
  // Usato da createPropostaAstaInChiaro per il lock di sessione
  query: vi.fn().mockResolvedValue(undefined),
} as unknown as EntityManager

vi.mock('~/data-source', () => ({
  AppDataSource: {
    transaction: vi.fn((cb) => cb(mockEntityManager)),
  },
}))

vi.mock('~/server/db/entities', () => ({
  SessioneMercato: {
    findOne: vi.fn(),
    find: vi.fn(),
    save: vi.fn(),
    create: vi.fn(),
  },
  PropostaMercato: {
    findOne: vi.fn(),
    find: vi.fn(),
    count: vi.fn(),
    save: vi.fn(),
    create: vi.fn(),
  },
  Trasferimento: {
    findOne: vi.fn(),
    find: vi.fn(),
  },
  Utente: {
    findOne: vi.fn(),
    find: vi.fn(),
  },
  // Utenti è un alias di Utente — deve comparire nel mock esplicitamente
  Utenti: {
    find: vi.fn(),
  },
}))

vi.mock('~/schemas/mercato', () => ({
  createPropostaSchema: {
    parse: vi.fn((data) => data),
  },
  deletePropostaSchema: {
    parse: vi.fn((data) => data),
  },
  getProposteSessioneSchema: {
    parse: vi.fn((data) => data),
  },
  getSessioneAttivaSchema: {
    parse: vi.fn((data) => data),
  },
  getGiocatoriSvincolatiSchema: {
    parse: vi.fn((data) => data),
  },
}))

vi.mock('~/server/services/mailSender', () => ({
  ReSendMailAsync: vi.fn().mockResolvedValue(undefined),
}))

// Import AFTER mocks are defined
import { createProposta, createSessione, deleteProposta, getSessioneAttiva, getSessioniMercato, getMieProposte, getGiocatoriSvincolati, riordinaProposte } from './mercatoService'

import { SessioneMercato, PropostaMercato, Trasferimento, Utente, Utenti } from '~/server/db/entities'
import { ReSendMailAsync } from '~/server/services/mailSender'

// ============================================================================
// Mock Context Builder
// ============================================================================

interface MockContext {
  session: {
    user: {
      id: string
      ruolo: 'admin' | 'contributor'
      idSquadra: number
    }
  }
}

function makeMockContext(overrides: Partial<MockContext> = {}): MockContext {
  return {
    session: {
      user: {
        id: '1',
        ruolo: 'contributor',
        idSquadra: 1,
        ...overrides.session?.user,
      },
    },
    ...overrides,
  }
}

// ============================================================================
// Fixture Builders
// ============================================================================

interface SessioneMercatoStub {
  id: number
  dataApertura: Date
  dataChiusura: Date
  maxProposte: number
  tipoValuta: 'fantamilioni' | 'euro'
  ProposteMercato: PropostaMercatoStub[]
}

interface PropostaMercatoStub {
  id: number
  idSessione: number
  idSquadra: number
  idGiocatore: number
  prezzoOfferto: number
  createdAt: Date
  deletedAt: Date | null
}

interface TrasferimentoStub {
  idTrasferimento: number
  idGiocatore: number
  idSquadra: number | null
  dataCessione: Date | null
}

interface UtenteStub {
  idUtente: number
  idSquadra: number
  fantaMilioni: number
}

function makeSessioneMercato(overrides: Partial<SessioneMercatoStub> = {}): SessioneMercatoStub {
  const now = new Date()
  return {
    id: 1,
    dataApertura: new Date(now.getTime() - 86400000), // 1 day ago (open)
    dataChiusura: new Date(now.getTime() + 86400000), // 1 day from now (still open)
    maxProposte: 5,
    tipoValuta: 'fantamilioni',
    ProposteMercato: [],
    ...overrides,
  }
}

function makePropostaMercato(overrides: Partial<PropostaMercatoStub> = {}): PropostaMercatoStub {
  return {
    id: 1,
    idSessione: 1,
    idSquadra: 1,
    idGiocatore: 100,
    prezzoOfferto: 50,
    createdAt: new Date(),
    deletedAt: null,
    ...overrides,
  }
}

function makeTrasferimento(overrides: Partial<TrasferimentoStub> = {}): TrasferimentoStub {
  return {
    idTrasferimento: 1,
    idGiocatore: 100,
    idSquadra: null, // null = svincolato (free agent)
    dataCessione: null, // null = active
    ...overrides,
  }
}

function makeUtente(overrides: Partial<UtenteStub> = {}): UtenteStub {
  return {
    idUtente: 1,
    idSquadra: 1,
    fantaMilioni: 1000,
    ...overrides,
  }
}

// ============================================================================
// Tests: createProposta
// ============================================================================

describe('createProposta', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should throw BAD_REQUEST when max proposte is reached', async () => {
    const ctx = makeMockContext()
    const sessione = makeSessioneMercato({
      maxProposte: 2,
      ProposteMercato: [
        makePropostaMercato({ idSquadra: 1, deletedAt: null }),
        makePropostaMercato({ id: 2, idSquadra: 1, deletedAt: null }),
      ],
    })

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)

    const input = {
      idGiocatore: 100,
      prezzoOfferto: 50,
    }

    // Should throw BAD_REQUEST when trying to create proposta
    await expect(
      createProposta.bind(null)({ ctx, input })
    ).rejects.toThrow()
  })

  it('should throw BAD_REQUEST when sessione is closed', async () => {
    const ctx = makeMockContext()
    const now = new Date()
    const sessione = makeSessioneMercato({
      dataApertura: new Date(now.getTime() - 172800000), // 2 days ago
      dataChiusura: new Date(now.getTime() - 86400000), // 1 day ago (CLOSED)
    })

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)

    const input = {
      idGiocatore: 100,
      prezzoOfferto: 50,
    }

    // Should throw BAD_REQUEST when session is closed
    await expect(
      createProposta.bind(null)({ ctx, input })
    ).rejects.toThrow()
  })

  it('should throw NOT_FOUND when no active sessione exists', async () => {
    const ctx = makeMockContext()

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(null)

    const input = {
      idGiocatore: 100,
      prezzoOfferto: 50,
    }

    // Should throw NOT_FOUND when sessione doesn't exist
    await expect(
      createProposta.bind(null)({ ctx, input })
    ).rejects.toThrow()
  })

  it('should throw BAD_REQUEST when giocatore is not svincolato (not free agent)', async () => {
    const ctx = makeMockContext()
    const sessione = makeSessioneMercato()

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    // Giocatore WITH squadra = not free agent
    vi.mocked(Trasferimento.findOne).mockResolvedValue(
      makeTrasferimento({
        idSquadra: 5, // HAS A TEAM
        dataCessione: null,
      }) as any
    )

    const input = {
      idGiocatore: 100,
      prezzoOfferto: 50,
    }

    // Should throw BAD_REQUEST when player is not free
    await expect(
      createProposta.bind(null)({ ctx, input })
    ).rejects.toThrow()
  })

  it('should throw BAD_REQUEST when fantamilioni budget is exceeded (type=fantamilioni)', async () => {
    const ctx = makeMockContext({ session: { user: { id: '1', ruolo: 'contributor', idSquadra: 1 } } })
    const sessione = makeSessioneMercato({ tipoValuta: 'fantamilioni' })
    const utente = makeUtente({ fantaMilioni: 100 }) // Only 100 available

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(Trasferimento.findOne).mockResolvedValue(
      makeTrasferimento({ idSquadra: null, dataCessione: null }) as any // Free agent
    )
    vi.mocked(Utente.findOne).mockResolvedValue(utente as any)
    vi.mocked(PropostaMercato.find).mockResolvedValue([
      makePropostaMercato({ idSquadra: 1, prezzoOfferto: 80, deletedAt: null }) as any, // Already spent 80
    ])

    const input = {
      idGiocatore: 100,
      prezzoOfferto: 50, // 80 + 50 = 130 > 100 budget
    }

    // Should throw BAD_REQUEST when budget is exceeded
    await expect(
      createProposta.bind(null)({ ctx, input })
    ).rejects.toThrow()
  })

  it('should succeed when type is euro (no budget constraint)', async () => {
    const ctx = makeMockContext({ session: { user: { id: '1', ruolo: 'contributor', idSquadra: 1 } } })
    const sessione = makeSessioneMercato({ tipoValuta: 'euro' })
    const utente = makeUtente({ fantaMilioni: 10 }) // Very low fantamilioni

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(Trasferimento.findOne).mockResolvedValue(
      makeTrasferimento({ idSquadra: null, dataCessione: null }) as any // Free agent
    )
    vi.mocked(Utente.findOne).mockResolvedValue(utente as any)
    vi.mocked(PropostaMercato.find).mockResolvedValue([
      makePropostaMercato({ idSquadra: 1, prezzoOfferto: 100, deletedAt: null }) as any,
    ])
    vi.mocked(PropostaMercato.create).mockReturnValue(makePropostaMercato() as any)
    vi.mocked(PropostaMercato.save).mockResolvedValue(makePropostaMercato() as any)
    vi.mocked(mockEntityManager.find).mockResolvedValue([])
    vi.mocked(mockEntityManager.create).mockReturnValue(makePropostaMercato() as any)
    vi.mocked(mockEntityManager.save).mockResolvedValue(makePropostaMercato() as any)

    const input = {
      idGiocatore: 100,
      prezzoOfferto: 9999, // Huge amount, but tipo='euro' so no constraint
    }

    // Should succeed (proposta is created)
    const result = await createProposta.bind(null)({ ctx, input })
    expect(result).toBeDefined()
    expect(result.id).toEqual(1)
  })

  it('should successfully create proposta with valid inputs', async () => {
    const ctx = makeMockContext()
    const sessione = makeSessioneMercato()
    const utente = makeUtente()

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(Trasferimento.findOne).mockResolvedValue(
      makeTrasferimento({ idSquadra: null, dataCessione: null }) as any // Free agent
    )
    vi.mocked(Utente.findOne).mockResolvedValue(utente as any)
    vi.mocked(PropostaMercato.find).mockResolvedValue([]) // No existing proposte
    vi.mocked(PropostaMercato.create).mockReturnValue(makePropostaMercato() as any)
    vi.mocked(PropostaMercato.save).mockResolvedValue(makePropostaMercato() as any)
    vi.mocked(mockEntityManager.find).mockResolvedValue([])
    vi.mocked(mockEntityManager.create).mockReturnValue(makePropostaMercato() as any)
    vi.mocked(mockEntityManager.save).mockResolvedValue(makePropostaMercato() as any)

    const input = {
      idGiocatore: 100,
      prezzoOfferto: 50,
    }

    const result = await createProposta.bind(null)({ ctx, input })
    expect(result).toBeDefined()
    expect(result.id).toEqual(1)
    expect(result.prezzoOfferto).toEqual(50)
  })
})

// ============================================================================
// Tests: deleteProposta
// ============================================================================

describe('deleteProposta', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should throw NOT_FOUND when proposta does not exist', async () => {
    const ctx = makeMockContext()

    vi.mocked(PropostaMercato.findOne).mockResolvedValue(null)

    const input = {
      idProposta: 999,
    }

    // Should throw NOT_FOUND
    await expect(
      deleteProposta.bind(null)({ ctx, input })
    ).rejects.toThrow()
  })

  it('should throw FORBIDDEN when proposta belongs to another squadra', async () => {
    const ctx = makeMockContext({ session: { user: { id: '1', ruolo: 'contributor', idSquadra: 1 } } })
    const proposta = makePropostaMercato({ idSquadra: 5 }) // Different squad

    vi.mocked(PropostaMercato.findOne).mockResolvedValue(proposta as any)

    const input = {
      idProposta: 1,
    }

    // Should throw FORBIDDEN when not owner
    await expect(
      deleteProposta.bind(null)({ ctx, input })
    ).rejects.toThrow()
  })

  it('should throw BAD_REQUEST when proposta is already deleted', async () => {
    const ctx = makeMockContext()
    const proposta = makePropostaMercato({
      idSquadra: 1,
      deletedAt: new Date(), // Already deleted
    })

    vi.mocked(PropostaMercato.findOne).mockResolvedValue(proposta as any)

    const input = {
      idProposta: 1,
    }

    // Should throw BAD_REQUEST when already deleted
    await expect(
      deleteProposta.bind(null)({ ctx, input })
    ).rejects.toThrow()
  })

  it('should successfully soft-delete proposta', async () => {
    const ctx = makeMockContext()
    const proposta = makePropostaMercato({ idSquadra: 1, deletedAt: null })

    vi.mocked(PropostaMercato.findOne).mockResolvedValue(proposta as any)
    vi.mocked(PropostaMercato.save).mockResolvedValue({
      ...proposta,
      deletedAt: new Date(),
    } as any)
    vi.mocked(mockEntityManager.save).mockResolvedValue({
      ...proposta,
      deletedAt: new Date(),
    } as any)
    vi.mocked(mockEntityManager.decrement).mockResolvedValue({ affected: 0 } as any)

    const input = {
      idProposta: 1,
    }

    const result = await deleteProposta.bind(null)({ ctx, input })
    expect(result).toBeDefined()
    expect(result.deletedAt).toBeDefined()
  })
})

// ============================================================================
// Tests: getSessioneAttiva
// ============================================================================

describe('getSessioneAttiva', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return null when no sessione exists', async () => {
    const ctx = makeMockContext()

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(null)

    const result = await getSessioneAttiva.bind(null)({ ctx, input: {} })

    expect(result).toBeNull()
  })

  it('should return null when sessione is in future (not yet open)', async () => {
    const ctx = makeMockContext()

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(null)

    const result = await getSessioneAttiva.bind(null)({ ctx, input: {} })

    expect(result).toBeNull()
  })

  it('should return null when sessione is closed (in past)', async () => {
    const ctx = makeMockContext()

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(null)

    const result = await getSessioneAttiva.bind(null)({ ctx, input: {} })

    expect(result).toBeNull()
  })

  it('should return sessione with metadata when active', async () => {
    const ctx = makeMockContext({ session: { user: { id: '1', ruolo: 'contributor', idSquadra: 1 } } })
    const now = new Date()
    const sessione = makeSessioneMercato({
      id: 1,
      dataApertura: new Date(now.getTime() - 86400000), // 1 day ago (open)
      dataChiusura: new Date(now.getTime() + 86400000), // 1 day from now (still open)
      maxProposte: 5,
      tipoValuta: 'fantamilioni',
    })

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(PropostaMercato.find).mockResolvedValue([
      { ...makePropostaMercato({ idSquadra: 1, deletedAt: null }), Utente: { nomeSquadra: 'Squadra Alpha' } },
      { ...makePropostaMercato({ id: 2, idSquadra: 1, deletedAt: null }), Utente: { nomeSquadra: 'Squadra Alpha' } },
      { ...makePropostaMercato({ id: 3, idSquadra: 2, deletedAt: null }), Utente: { nomeSquadra: 'Squadra Beta' } },
    ] as any)

    const result = await getSessioneAttiva.bind(null)({ ctx, input: {} })

    expect(result).toBeDefined()
    if (result) {
      expect(result.tipoValuta).toEqual('fantamilioni')
      expect(result.myCount).toEqual(2) // 2 proposte from squadra 1
      expect(result.countPerSquadra).toMatchObject({ 'Squadra Alpha': 2, 'Squadra Beta': 1 })
    }
  })
})

// ============================================================================
// Tests: getSessioniMercato
// ============================================================================

describe('getSessioniMercato', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should not reveal proposte when sessione is still open', async () => {
    const ctx = makeMockContext()
    const now = new Date()
    const sessione = makeSessioneMercato({
      id: 1,
      dataApertura: new Date(now.getTime() - 86400000),
      dataChiusura: new Date(now.getTime() + 86400000), // Still open
      tipoValuta: 'fantamilioni',
      ProposteMercato: [
        makePropostaMercato({ idSquadra: 1, deletedAt: null }),
        makePropostaMercato({ id: 2, idSquadra: 2, deletedAt: null }),
      ],
    })

    vi.mocked(SessioneMercato.find).mockResolvedValue([sessione as any])

    const result = await getSessioniMercato.bind(null)({ ctx, input: {} })

    expect(result).toBeDefined()
    const session = result.find((s) => s.id === 1)
    // Proposte should NOT be included when session is open
    expect(session?.proposte).toBeUndefined()
  })

  it('should reveal proposte when sessione is closed', async () => {
    const ctx = makeMockContext()
    const now = new Date()
    const sessione = makeSessioneMercato({
      id: 1,
      dataApertura: new Date(now.getTime() - 172800000),
      dataChiusura: new Date(now.getTime() - 86400000), // CLOSED
      tipoValuta: 'fantamilioni',
      ProposteMercato: [
        { ...makePropostaMercato({ id: 101, idSquadra: 1, idGiocatore: 50, prezzoOfferto: 100, deletedAt: null }), Giocatore: { nome: 'Player1' }, Utente: { presidente: 'President1' } },
        { ...makePropostaMercato({ id: 102, idSquadra: 2, idGiocatore: 51, prezzoOfferto: 150, deletedAt: null }), Giocatore: { nome: 'Player2' }, Utente: { presidente: 'President2' } },
      ] as any,
    })

    vi.mocked(SessioneMercato.find).mockResolvedValue([sessione as any])

    const result = await getSessioniMercato.bind(null)({ ctx, input: {} })

    expect(result).toBeDefined()
    const session = result.find((s) => s.id === 1)
    // Proposte should be included (with giocatore, prezzo, squadra) when session is closed
    expect(session?.proposte).toBeDefined()
    if (session?.proposte) {
      expect(session.proposte.length).toEqual(2)
      expect(session.proposte[0]).toHaveProperty('idGiocatore')
      expect(session.proposte[0]).toHaveProperty('prezzoOfferto')
      expect(session.proposte[0]).toHaveProperty('idSquadra')
    }
  })

  it('should include banner for active/future sessione only', async () => {
    const ctx = makeMockContext()
    const now = new Date()

    const openSessione = makeSessioneMercato({
      id: 1,
      dataApertura: new Date(now.getTime() - 86400000),
      dataChiusura: new Date(now.getTime() + 86400000), // Active
    })

    const closedSessione = makeSessioneMercato({
      id: 2,
      dataApertura: new Date(now.getTime() - 172800000),
      dataChiusura: new Date(now.getTime() - 86400000), // Closed
    })

    vi.mocked(SessioneMercato.find).mockResolvedValue([openSessione as any, closedSessione as any])

    const result = await getSessioniMercato.bind(null)({ ctx, input: {} })

    expect(result).toBeDefined()
    const open = result.find((s) => s.id === 1)
    const closed = result.find((s) => s.id === 2)

    // Active session should have banner info (dates)
    expect(open?.dataApertura).toBeDefined()
    expect(open?.dataChiusura).toBeDefined()

    // Closed session should not have banner
    expect(closed?.dataApertura).toBeUndefined()
  })
})

// ============================================================================
// Tests: getMieProposte
// ============================================================================

describe('getMieProposte', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return [] when no sessione exists', async () => {
    const ctx = makeMockContext()
    vi.mocked(SessioneMercato.findOne).mockResolvedValue(null)

    const result = await getMieProposte({ ctx, input: {} })

    expect(result).toEqual([])
  })

  it('should return [] when sessione is closed', async () => {
    const ctx = makeMockContext()

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(null)

    const result = await getMieProposte({ ctx, input: {} })

    expect(result).toEqual([])
  })

  it('should return user proposals when sessione is active', async () => {
    const ctx = makeMockContext({ session: { user: { id: '1', ruolo: 'contributor', idSquadra: 1 } } })
    const sessione = makeSessioneMercato()
    const myProposta = makePropostaMercato({ idSquadra: 1, deletedAt: null })

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(PropostaMercato.find).mockResolvedValue([myProposta as any])

    const result = await getMieProposte({ ctx, input: {} })

    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ idSquadra: 1, idGiocatore: 100 })
  })

  it('should return [] when sessione is active but user has no proposals', async () => {
    const ctx = makeMockContext()
    const sessione = makeSessioneMercato()
    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(PropostaMercato.find).mockResolvedValue([])

    const result = await getMieProposte({ ctx, input: {} })

    expect(result).toEqual([])
  })
})

// ============================================================================
// Tests: getGiocatoriSvincolati
// ============================================================================

describe('getGiocatoriSvincolati', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return empty array when no free agents exist', async () => {
    const ctx = makeMockContext()
    vi.mocked(Trasferimento.find).mockResolvedValue([])

    const result = await getGiocatoriSvincolati({ ctx, input: { ruolo: 'A', stagione: '2025-2026' } })

    expect(result).toEqual([])
  })

  it('should handle missing Giocatore relation gracefully', async () => {
    const ctx = makeMockContext()
    const trasf = {
      ...makeTrasferimento({ idSquadra: null, dataCessione: null }),
      costo: 10,
      stagione: '2025-2026',
      Giocatore: undefined,
    }
    vi.mocked(Trasferimento.find).mockResolvedValue([trasf as any])

    const result = await getGiocatoriSvincolati({ ctx, input: { ruolo: 'P', stagione: '2025-2026' } })

    expect(result).toHaveLength(1)
    expect(result[0].nome).toBeUndefined()
    expect(result[0].ruolo).toBeUndefined()
  })

  it('should return null maglia when SquadraSerieA is missing', async () => {
    const ctx = makeMockContext()
    const trasf = {
      ...makeTrasferimento({ idSquadra: null, dataCessione: null }),
      costo: 10,
      stagione: '2025-2026',
      Giocatore: { nome: 'Test', ruolo: 'C' },
      SquadraSerieA: undefined,
    }
    vi.mocked(Trasferimento.find).mockResolvedValue([trasf as any])

    const result = await getGiocatoriSvincolati({ ctx, input: { ruolo: 'C', stagione: '2025-2026' } })

    expect(result[0]?.maglia).toBeNull()
    expect(result[0]?.nomeSquadraSerieA).toBeUndefined()
  })

  it('should pass ruolo to TypeORM find as where condition', async () => {
    const ctx = makeMockContext()
    vi.mocked(Trasferimento.find).mockResolvedValue([])

    await getGiocatoriSvincolati({ ctx, input: { ruolo: 'C', stagione: '2025-2026' } })

    expect(vi.mocked(Trasferimento.find)).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ Giocatore: { ruolo: 'C' } }),
        relations: expect.objectContaining({ SquadraSerieA: true }),
      }),
    )
  })
})

// ============================================================================
// Tests: createProposta — priorità auto-assegnate
// ============================================================================

describe('createProposta — priorità auto-assegnate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should assign priorita = 1 for the first proposta of a squadra', async () => {
    const ctx = makeMockContext()
    const sessione = makeSessioneMercato()
    const utente = makeUtente()

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(Trasferimento.findOne).mockResolvedValue(
      makeTrasferimento({ idSquadra: null, dataCessione: null }) as any,
    )
    vi.mocked(Utente.findOne).mockResolvedValue(utente as any)
    vi.mocked(PropostaMercato.find).mockResolvedValue([])
    vi.mocked(mockEntityManager.find).mockResolvedValue([]) // no esistenti in transazione
    vi.mocked(mockEntityManager.create).mockImplementation(((_e: unknown, data: any) => data) as any)
    vi.mocked(mockEntityManager.save).mockImplementation(((_e: unknown, data: any) => Promise.resolve(data)) as any)

    await createProposta({
      ctx,
      input: { idGiocatore: 100, prezzoOfferto: 50 },
    })

    expect(vi.mocked(mockEntityManager.create)).toHaveBeenCalledWith(
      PropostaMercato,
      expect.objectContaining({ priorita: 1 }),
    )
  })

  it('should assign priorita = MAX(priorita)+1 when other proposte exist', async () => {
    const ctx = makeMockContext()
    const sessione = makeSessioneMercato()
    const utente = makeUtente()

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(Trasferimento.findOne).mockResolvedValue(
      makeTrasferimento({ idSquadra: null, dataCessione: null }) as any,
    )
    vi.mocked(Utente.findOne).mockResolvedValue(utente as any)
    vi.mocked(PropostaMercato.find).mockResolvedValue([])
    // 3 proposte esistenti con priorità 1, 2, 3
    vi.mocked(mockEntityManager.find).mockResolvedValue([
      { priorita: 1 } as any,
      { priorita: 3 } as any,
      { priorita: 2 } as any,
    ])
    vi.mocked(mockEntityManager.create).mockImplementation(((_e: unknown, data: any) => data) as any)
    vi.mocked(mockEntityManager.save).mockImplementation(((_e: unknown, data: any) => Promise.resolve(data)) as any)

    await createProposta({
      ctx,
      input: { idGiocatore: 101, prezzoOfferto: 30 },
    })

    expect(vi.mocked(mockEntityManager.create)).toHaveBeenCalledWith(
      PropostaMercato,
      expect.objectContaining({ priorita: 4 }),
    )
  })
})

// ============================================================================
// Tests: deleteProposta — compattazione priorità
// ============================================================================

describe('deleteProposta — compattazione priorità', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should decrement priorita for siblings with priorita > deleted one', async () => {
    const ctx = makeMockContext()
    const proposta = makePropostaMercato({
      id: 42,
      idSquadra: 1,
      idSessione: 7,
      deletedAt: null,
    }) as any
    proposta.priorita = 2

    vi.mocked(PropostaMercato.findOne).mockResolvedValue(proposta)
    vi.mocked(mockEntityManager.save).mockResolvedValue({ ...proposta, deletedAt: new Date() })
    vi.mocked(mockEntityManager.decrement).mockResolvedValue({ affected: 3 } as any)

    await deleteProposta({ ctx, input: { idProposta: 42 } })

    expect(vi.mocked(mockEntityManager.decrement)).toHaveBeenCalledWith(
      PropostaMercato,
      expect.objectContaining({
        idSessione: 7,
        idSquadra: 1,
      }),
      'priorita',
      1,
    )
  })
})

// ============================================================================
// Tests: riordinaProposte
// ============================================================================

describe('riordinaProposte', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should throw NOT_FOUND when no sessione attiva', async () => {
    const ctx = makeMockContext()
    vi.mocked(SessioneMercato.findOne).mockResolvedValue(null)

    await expect(
      riordinaProposte({
        ctx,
        input: { ordineIdProposte: [1, 2, 3] },
      }),
    ).rejects.toThrow()
  })

  it('should throw BAD_REQUEST when input length differs from active proposte count', async () => {
    const ctx = makeMockContext()
    const sessione = makeSessioneMercato()
    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(mockEntityManager.find).mockResolvedValue([
      makePropostaMercato({ id: 1, idSquadra: 1, deletedAt: null }) as any,
      makePropostaMercato({ id: 2, idSquadra: 1, deletedAt: null }) as any,
    ])

    await expect(
      riordinaProposte({
        ctx,
        input: { ordineIdProposte: [1] }, // mismatch: 1 vs 2
      }),
    ).rejects.toThrow()
  })

  it('should throw BAD_REQUEST when input contains duplicates', async () => {
    const ctx = makeMockContext()
    const sessione = makeSessioneMercato()
    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(mockEntityManager.find).mockResolvedValue([
      makePropostaMercato({ id: 1, idSquadra: 1, deletedAt: null }) as any,
      makePropostaMercato({ id: 2, idSquadra: 1, deletedAt: null }) as any,
    ])

    await expect(
      riordinaProposte({
        ctx,
        input: { ordineIdProposte: [1, 1] }, // duplicato
      }),
    ).rejects.toThrow()
  })

  it('should throw BAD_REQUEST when input contains an id not belonging to the squadra', async () => {
    const ctx = makeMockContext()
    const sessione = makeSessioneMercato()
    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(mockEntityManager.find).mockResolvedValue([
      makePropostaMercato({ id: 1, idSquadra: 1, deletedAt: null }) as any,
      makePropostaMercato({ id: 2, idSquadra: 1, deletedAt: null }) as any,
    ])

    await expect(
      riordinaProposte({
        ctx,
        input: { ordineIdProposte: [1, 999] }, // 999 non appartiene
      }),
    ).rejects.toThrow()
  })

  it('should update priorità in two phases (negative then final)', async () => {
    const ctx = makeMockContext()
    const sessione = makeSessioneMercato()
    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(mockEntityManager.find).mockResolvedValue([
      makePropostaMercato({ id: 10, idSquadra: 1, deletedAt: null }) as any,
      makePropostaMercato({ id: 20, idSquadra: 1, deletedAt: null }) as any,
      makePropostaMercato({ id: 30, idSquadra: 1, deletedAt: null }) as any,
    ])
    vi.mocked(mockEntityManager.update).mockResolvedValue({ affected: 1 } as any)

    await riordinaProposte({
      ctx,
      input: { ordineIdProposte: [30, 10, 20] },
    })

    const calls = vi.mocked(mockEntityManager.update).mock.calls
    // Fase 1: 3 update con priorità negative
    expect(calls[0]).toEqual([PropostaMercato, { id: 30 }, { priorita: -1 }])
    expect(calls[1]).toEqual([PropostaMercato, { id: 10 }, { priorita: -2 }])
    expect(calls[2]).toEqual([PropostaMercato, { id: 20 }, { priorita: -3 }])
    // Fase 2: 3 update con priorità finali 1, 2, 3 nell'ordine richiesto
    expect(calls[3]).toEqual([PropostaMercato, { id: 30 }, { priorita: 1 }])
    expect(calls[4]).toEqual([PropostaMercato, { id: 10 }, { priorita: 2 }])
    expect(calls[5]).toEqual([PropostaMercato, { id: 20 }, { priorita: 3 }])
  })
})

// ============================================================================
// createSessione - regression: acquistiEffettivi must propagate to entity
// ============================================================================

describe('createSessione', () => {

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('propaga acquistiEffettivi a SessioneMercato.create (regression: not-null violation)', async () => {
    vi.mocked(SessioneMercato.find).mockResolvedValue([])
    vi.mocked(SessioneMercato.create).mockImplementation((data) => data as any)
    vi.mocked(SessioneMercato.save).mockImplementation(async (e) => e as any)

    const now = Date.now()
    const input = {
      dataApertura: new Date(now + 3600000),
      dataChiusura: new Date(now + 7200000),
      maxProposte: 5,
      acquistiEffettivi: 3,
      tipoValuta: 'fantamilioni' as const,
      astaInChiaro: false,
    }

    await createSessione({ input })

    expect(SessioneMercato.create).toHaveBeenCalledTimes(1)
    const callArg = vi.mocked(SessioneMercato.create).mock.calls[0]![0] as any
    expect(callArg.acquistiEffettivi).toBe(3)
    expect(callArg.maxProposte).toBe(5)
    expect(callArg.tipoValuta).toBe('fantamilioni')
  })

  // ── Notifica mail ────────────────────────────────────────────────────────

  it('non invia mail quando MAIL_ENABLED != true', async () => {
    vi.stubEnv('MAIL_ENABLED', 'false')

    vi.mocked(SessioneMercato.find).mockResolvedValue([])
    vi.mocked(SessioneMercato.create).mockImplementation((data) => data as any)
    vi.mocked(SessioneMercato.save).mockImplementation(async (e) => e as any)

    const now = Date.now()
    await createSessione({
      input: {
        dataApertura: new Date(now + 3600000),
        dataChiusura: new Date(now + 7200000),
        maxProposte: 5,
        acquistiEffettivi: 3,
        tipoValuta: 'fantamilioni',
        astaInChiaro: false,
      },
    })

    expect(vi.mocked(ReSendMailAsync)).not.toHaveBeenCalled()
    expect(vi.mocked(Utenti.find)).not.toHaveBeenCalled()

    vi.unstubAllEnvs()
  })

  it('invia mail solo ai presidenti non-admin quando MAIL_ENABLED=true', async () => {
    vi.stubEnv('MAIL_ENABLED', 'true')

    vi.mocked(SessioneMercato.find).mockResolvedValue([])
    vi.mocked(SessioneMercato.create).mockImplementation((data) => data as any)
    vi.mocked(SessioneMercato.save).mockImplementation(async (e) => e as any)

    const presidentiNonAdmin = [
      { idUtente: 1, mail: 'alfa@test.com', presidente: 'Alfa', adminLevel: false },
      { idUtente: 2, mail: 'beta@test.com', presidente: 'Beta', adminLevel: false },
    ]
    vi.mocked(Utenti.find).mockResolvedValue(presidentiNonAdmin as any)

    const now = Date.now()
    await createSessione({
      input: {
        dataApertura: new Date(now + 3600000),
        dataChiusura: new Date(now + 7200000),
        maxProposte: 5,
        acquistiEffettivi: 3,
        tipoValuta: 'fantamilioni',
        astaInChiaro: false,
      },
    })

    // Utenti.find deve essere chiamato filtrando adminLevel: false
    expect(vi.mocked(Utenti.find)).toHaveBeenCalledWith(
      expect.objectContaining({ where: { adminLevel: false } }),
    )

    // ReSendMailAsync deve essere chiamato una volta per ciascun presidente
    expect(vi.mocked(ReSendMailAsync)).toHaveBeenCalledTimes(2)
    expect(vi.mocked(ReSendMailAsync)).toHaveBeenCalledWith(
      'alfa@test.com',
      '',
      expect.any(String),
      expect.stringContaining('Alfa'),
    )
    expect(vi.mocked(ReSendMailAsync)).toHaveBeenCalledWith(
      'beta@test.com',
      '',
      expect.any(String),
      expect.stringContaining('Beta'),
    )

    vi.unstubAllEnvs()
  })

  it('deduplica email duplicate e salta utenti senza indirizzo valido', async () => {
    vi.stubEnv('MAIL_ENABLED', 'true')

    vi.mocked(SessioneMercato.find).mockResolvedValue([])
    vi.mocked(SessioneMercato.create).mockImplementation((data) => data as any)
    vi.mocked(SessioneMercato.save).mockImplementation(async (e) => e as any)

    const utenti = [
      { idUtente: 1, mail: 'dup@test.com', presidente: 'Dup1', adminLevel: false },
      { idUtente: 2, mail: 'dup@test.com', presidente: 'Dup2', adminLevel: false }, // duplicato
      { idUtente: 3, mail: '',             presidente: 'Noemail', adminLevel: false }, // email vuota
      { idUtente: 4, mail: 'noeatsign',   presidente: 'NoAt', adminLevel: false },   // email invalida
      { idUtente: 5, mail: 'ok@test.com', presidente: 'Ok', adminLevel: false },
    ]
    vi.mocked(Utenti.find).mockResolvedValue(utenti as any)

    const now = Date.now()
    await createSessione({
      input: {
        dataApertura: new Date(now + 3600000),
        dataChiusura: new Date(now + 7200000),
        maxProposte: 4,
        acquistiEffettivi: 2,
        tipoValuta: 'euro',
        astaInChiaro: true,
      },
    })

    // Solo 2 invii: dup@test.com (la prima occorrenza) e ok@test.com
    expect(vi.mocked(ReSendMailAsync)).toHaveBeenCalledTimes(2)

    vi.unstubAllEnvs()
  })

  it('errore di notifica email non è ingoiato: lancia eccezione', async () => {
    vi.stubEnv('MAIL_ENABLED', 'true')

    vi.mocked(SessioneMercato.find).mockResolvedValue([])
    vi.mocked(SessioneMercato.create).mockImplementation((data) => data as any)
    const savedSessione = { id: 42, maxProposte: 5, acquistiEffettivi: 3, tipoValuta: 'fantamilioni', astaInChiaro: false, dataApertura: new Date(), dataChiusura: new Date() }
    vi.mocked(SessioneMercato.save).mockResolvedValue(savedSessione as any)

    // Simuliamo un fallimento nel recupero dei presidenti
    vi.mocked(Utenti.find).mockRejectedValue(new Error('DB connection lost'))

    const now = Date.now()
    // Attesa: l'errore non è ingoiato, ma rilanciato al chiamante
    await expect(
      createSessione({
        input: {
          dataApertura: new Date(now + 3600000),
          dataChiusura: new Date(now + 7200000),
          maxProposte: 5,
          acquistiEffettivi: 3,
          tipoValuta: 'fantamilioni',
          astaInChiaro: false,
        },
      }),
    ).rejects.toThrow('DB connection lost')

    vi.unstubAllEnvs()
  })
})

// ============================================================================
// Regression: createProposta — astaInChiaro unique violation
//
// Bug: UQ_proposta_mercato_priorita_active collide quando la stessa squadra
// fa più di un'offerta in una sessione astaInChiaro perché ogni INSERT usa
// priorita=1 e il partial index non distingue tra modalità al buio e in chiaro.
//
// Fix: campo `astaInChiaro` denormalizzato su proposta_mercato; l'indice è
// ridefinito con `WHERE deleted_at IS NULL AND asta_in_chiaro = false`.
// Il service imposta `astaInChiaro: true` ad ogni INSERT in modalità in chiaro.
//
// NOTA: dopo il refactoring del locking (createPropostaAstaInChiaro wrappata
// in AppDataSource.transaction), le query interne usano trx.* (mockEntityManager)
// anziché i metodi statici dell'entità.
// ============================================================================

describe('createProposta — regressione unique violation astaInChiaro', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /**
   * Verifica che ogni nuova offerta (INSERT path) in una sessione astaInChiaro
   * imposti `astaInChiaro: true` sull'entità, garantendo così che la riga
   * ricada fuori dal partial unique index e non produca una unique violation
   * quando la stessa squadra ha già un'altra offerta (priorita=1) nella sessione.
   *
   * Setup: squadra 1 ha già un'offerta su giocatore 99 (è il leader lì);
   * fa una nuova offerta su giocatore 100 (primo offerente).
   */
  it('deve impostare astaInChiaro=true sul nuovo INSERT in sessione in chiaro', async () => {
    const ctx = makeMockContext({ session: { user: { id: '1', ruolo: 'contributor', idSquadra: 1 } } })

    const sessione = {
      ...makeSessioneMercato({ id: 10, maxProposte: 5 }),
      astaInChiaro: true,
      acquistiEffettivi: 3,
    }

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(Trasferimento.findOne).mockResolvedValue(
      makeTrasferimento({ idSquadra: null, dataCessione: null }) as any,
    )

    // tutteLeOfferte (singola query trx.find dentro la transazione):
    // squadra 1 è leader su giocatore 99 (1 slot occupato su 3), nessuna offerta su 100.
    const offertaEsistente99 = makePropostaMercato({ idSquadra: 1, idGiocatore: 99, prezzoOfferto: 10, deletedAt: null })
    vi.mocked(mockEntityManager.find).mockResolvedValueOnce([offertaEsistente99 as any])
    vi.mocked(mockEntityManager.create).mockImplementation(((_e: unknown, data: any) => data) as any)
    vi.mocked(mockEntityManager.save).mockImplementation(((_e: unknown, data: any) => Promise.resolve(data)) as any)

    await createProposta({ ctx, input: { idGiocatore: 100, prezzoOfferto: 10 } })

    // La chiamata a trx.create deve includere astaInChiaro: true
    // per escludere la riga dal partial unique index sulle proposte al buio.
    expect(vi.mocked(mockEntityManager.create)).toHaveBeenCalledWith(
      PropostaMercato,
      expect.objectContaining({ astaInChiaro: true, priorita: 1, idGiocatore: 100 }),
    )
  })

  /**
   * Verifica che due INSERT successivi della stessa squadra su giocatori
   * diversi nella stessa sessione astaInChiaro producano entrambi
   * astaInChiaro=true — il che nel DB reale escluderebbe entrambi dall'indice
   * evitando la unique violation (idGiocatore diverso, stessa priorita=1).
   */
  it('seconda offerta stessa squadra giocatore diverso → astaInChiaro=true entrambe le volte', async () => {
    const ctx = makeMockContext({ session: { user: { id: '1', ruolo: 'contributor', idSquadra: 1 } } })

    const sessione = {
      ...makeSessioneMercato({ id: 10, maxProposte: 5 }),
      astaInChiaro: true,
      acquistiEffettivi: 3,
    }

    // ── Prima offerta (giocatore 101): tutteLeOfferte = [] ─────────────────
    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(Trasferimento.findOne).mockResolvedValue(
      makeTrasferimento({ idSquadra: null, dataCessione: null }) as any,
    )
    vi.mocked(mockEntityManager.find).mockResolvedValueOnce([])
    vi.mocked(mockEntityManager.create).mockImplementation(((_e: unknown, data: any) => data) as any)
    vi.mocked(mockEntityManager.save).mockImplementation(((_e: unknown, data: any) => Promise.resolve(data)) as any)

    await createProposta({ ctx, input: { idGiocatore: 101, prezzoOfferto: 10 } })

    const firstCallArg = vi.mocked(mockEntityManager.create).mock.calls[0]![1] as any
    expect(firstCallArg.astaInChiaro).toBe(true)
    expect(firstCallArg.priorita).toBe(1)
    expect(firstCallArg.idGiocatore).toBe(101)

    vi.clearAllMocks()

    // ── Seconda offerta (giocatore 102, stesso team) ──────────────────────
    // tutteLeOfferte = [offerta di squadra 1 su 101]: squadra 1 è leader su 101
    // (1 slot occupato su 3 → cap ok).
    const primaOfferta = makePropostaMercato({ idSquadra: 1, idGiocatore: 101, prezzoOfferto: 10, deletedAt: null })

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(Trasferimento.findOne).mockResolvedValue(
      makeTrasferimento({ idSquadra: null, dataCessione: null }) as any,
    )
    vi.mocked(mockEntityManager.find).mockResolvedValueOnce([primaOfferta as any])
    vi.mocked(mockEntityManager.create).mockImplementation(((_e: unknown, data: any) => data) as any)
    vi.mocked(mockEntityManager.save).mockImplementation(((_e: unknown, data: any) => Promise.resolve(data)) as any)

    await createProposta({ ctx, input: { idGiocatore: 102, prezzoOfferto: 10 } })

    const secondCallArg = vi.mocked(mockEntityManager.create).mock.calls[0]![1] as any
    // REGRESSIONE: senza il fix, questa riga avrebbe astaInChiaro=false (default)
    // causando una unique violation in DB perché (sessione=10, squadra=1, priorita=1)
    // esiste già nell'indice.
    expect(secondCallArg.astaInChiaro).toBe(true)
    expect(secondCallArg.priorita).toBe(1)
    expect(secondCallArg.idGiocatore).toBe(102)
  })

  /**
   * Verifica che il path UPDATE (squadra ha già un'offerta sullo stesso giocatore
   * ma non è il leader corrente) non passi per create — nessun INSERT, nessun
   * problema di indice.
   *
   * Setup: squadra 1 aveva offerta 5, squadra 2 ha offerta 10 (è leader).
   * Squadra 1 aggiorna la sua offerta a 20 per superare la squadra 2.
   */
  it('UPDATE path (offerta esistente stesso giocatore, non leader) non chiama trx.create', async () => {
    const ctx = makeMockContext({ session: { user: { id: '1', ruolo: 'contributor', idSquadra: 1 } } })

    const sessione = {
      ...makeSessioneMercato({ id: 10, maxProposte: 5 }),
      astaInChiaro: true,
      acquistiEffettivi: 3,
    }

    // Squadra 1 ha offerta di 5, squadra 2 ha offerta di 10 (leader)
    const offerta1 = makePropostaMercato({ id: 1, idSquadra: 1, idGiocatore: 100, prezzoOfferto: 5, deletedAt: null })
    const offerta2 = makePropostaMercato({ id: 2, idSquadra: 2, idGiocatore: 100, prezzoOfferto: 10, deletedAt: null })

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(Trasferimento.findOne).mockResolvedValue(
      makeTrasferimento({ idSquadra: null, dataCessione: null }) as any,
    )

    // tutteLeOfferte: entrambe le offerte su giocatore 100
    vi.mocked(mockEntityManager.find).mockResolvedValueOnce([offerta1 as any, offerta2 as any])
    vi.mocked(mockEntityManager.save).mockResolvedValue({ ...offerta1, prezzoOfferto: 20 } as any)

    await createProposta({ ctx, input: { idGiocatore: 100, prezzoOfferto: 20 } })

    // UPDATE path: nessun create, nessun rischio indice
    expect(vi.mocked(mockEntityManager.create)).not.toHaveBeenCalled()
    expect(vi.mocked(mockEntityManager.save)).toHaveBeenCalledWith(
      PropostaMercato,
      expect.objectContaining({ idGiocatore: 100, prezzoOfferto: 20 }),
    )
  })
})

// ============================================================================
// createPropostaAstaInChiaro — cap "leader corrente"
//
// Una squadra può essere il miglior offerente su al più acquistiEffettivi
// giocatori distinti nella sessione (aste attive + scadute).
//
// Tutte le query critiche avvengono dentro AppDataSource.transaction con
// pg_advisory_xact_lock, quindi i mock usano mockEntityManager.*.
// ============================================================================

describe('createPropostaAstaInChiaro — cap leader corrente', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  /** Helper: sessione astaInChiaro con cap configurabile */
  function makeSessioneInChiaro(acquistiEffettivi: number, maxProposte = 10) {
    return {
      ...makeSessioneMercato({ id: 20, maxProposte }),
      astaInChiaro: true,
      acquistiEffettivi,
    }
  }

  /**
   * Cap=2, squadra è leader su 2 giocatori → offerta su un terzo rifiutata.
   * Verifica che il conteggio includa sia aste attive (timer non scaduto)
   * che aste scadute (l'unica discriminante è chi ha il prezzo più alto).
   */
  it('cap=2, leader su 2 giocatori: offerta su terzo rifiutata', async () => {
    const ctx = makeMockContext({ session: { user: { id: '1', ruolo: 'contributor', idSquadra: 1 } } })
    const sessione = makeSessioneInChiaro(2)

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(Trasferimento.findOne).mockResolvedValue(
      makeTrasferimento({ idSquadra: null, dataCessione: null }) as any,
    )

    // Squadra 1 è leader su giocatori 10 e 11 (prezzi massimi tra i rispettivi offerenti)
    const offerteEsistenti = [
      makePropostaMercato({ id: 10, idSquadra: 1, idGiocatore: 10, prezzoOfferto: 50, deletedAt: null }),
      makePropostaMercato({ id: 11, idSquadra: 2, idGiocatore: 10, prezzoOfferto: 30, deletedAt: null }), // 1 batte 2 su g10
      makePropostaMercato({ id: 20, idSquadra: 1, idGiocatore: 11, prezzoOfferto: 40, deletedAt: null }), // 1 è solo leader su g11
    ]

    vi.mocked(mockEntityManager.find).mockResolvedValueOnce(offerteEsistenti as any)

    // Offerta su giocatore 12 (terzo) deve essere rifiutata: cap raggiunto
    await expect(
      createProposta({ ctx, input: { idGiocatore: 12, prezzoOfferto: 20 } }),
    ).rejects.toThrow(/attendi di essere superato/i)
  })

  /**
   * Cap=2, squadra superata su uno dei due giocatori → libera un slot →
   * può diventare leader su un altro giocatore.
   */
  it('dopo essere superata su uno, può guidare un\'altra asta', async () => {
    const ctx = makeMockContext({ session: { user: { id: '1', ruolo: 'contributor', idSquadra: 1 } } })
    const sessione = makeSessioneInChiaro(2)

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(Trasferimento.findOne).mockResolvedValue(
      makeTrasferimento({ idSquadra: null, dataCessione: null }) as any,
    )

    // Squadra 1 è leader su g10, ma è stata superata su g11 (squadra 2 ha 60 > 40)
    const offerteEsistenti = [
      makePropostaMercato({ id: 10, idSquadra: 1, idGiocatore: 10, prezzoOfferto: 50, deletedAt: null }), // 1 leader su g10
      makePropostaMercato({ id: 20, idSquadra: 1, idGiocatore: 11, prezzoOfferto: 40, deletedAt: null }), // 1 non leader su g11
      makePropostaMercato({ id: 21, idSquadra: 2, idGiocatore: 11, prezzoOfferto: 60, deletedAt: null }), // 2 leader su g11
    ]

    vi.mocked(mockEntityManager.find).mockResolvedValueOnce(offerteEsistenti as any)
    vi.mocked(mockEntityManager.create).mockImplementation(((_e: unknown, data: any) => data) as any)
    vi.mocked(mockEntityManager.save).mockImplementation(((_e: unknown, data: any) => Promise.resolve(data)) as any)

    // slotOccupati=1 (solo g10) < cap=2 → l'offerta su g12 deve essere accettata
    const result = await createProposta({ ctx, input: { idGiocatore: 12, prezzoOfferto: 20 } })
    expect(result).toBeDefined()
    expect(vi.mocked(mockEntityManager.create)).toHaveBeenCalledWith(
      PropostaMercato,
      expect.objectContaining({ idGiocatore: 12, astaInChiaro: true }),
    )
  })

  /**
   * Aste scadute vinte (timer = now - 2h) contano ancora nel cap
   * perché il vincolo si applica finché la sessione non è aggiudicata.
   */
  it('aste scadute con squadra leader contano nel cap (non solo aste attive)', async () => {
    const ctx = makeMockContext({ session: { user: { id: '1', ruolo: 'contributor', idSquadra: 1 } } })
    const sessione = makeSessioneInChiaro(2)

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(Trasferimento.findOne).mockResolvedValue(
      makeTrasferimento({ idSquadra: null, dataCessione: null }) as any,
    )

    const now = new Date()
    // g10: asta scaduta 2 ore fa, squadra 1 è vincitrice
    const scadutaCreatedAt = new Date(now.getTime() - 26 * 60 * 60 * 1000) // 26h fa → timer scaduto da 2h
    const offerteEsistenti = [
      { ...makePropostaMercato({ id: 10, idSquadra: 1, idGiocatore: 10, prezzoOfferto: 50, deletedAt: null }), createdAt: scadutaCreatedAt },
      // g11: asta attiva, squadra 1 è leader
      makePropostaMercato({ id: 20, idSquadra: 1, idGiocatore: 11, prezzoOfferto: 40, deletedAt: null }),
    ]

    vi.mocked(mockEntityManager.find).mockResolvedValueOnce(offerteEsistenti as any)

    // Nonostante g10 sia scaduta, occupa ancora uno slot → cap=2 raggiunto
    await expect(
      createProposta({ ctx, input: { idGiocatore: 12, prezzoOfferto: 20 } }),
    ).rejects.toThrow(/attendi di essere superato/i)
  })

  /**
   * Self-outbid: la squadra è già il miglior offerente corrente sul giocatore
   * target → l'offerta viene rifiutata con errore esplicito, indipendentemente
   * dal cap (non occupa slot aggiuntivi).
   */
  it('rilancio del leader sullo stesso giocatore rifiutato (self-outbid)', async () => {
    const ctx = makeMockContext({ session: { user: { id: '1', ruolo: 'contributor', idSquadra: 1 } } })
    const sessione = makeSessioneInChiaro(3) // cap=3, ampio

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(Trasferimento.findOne).mockResolvedValue(
      makeTrasferimento({ idSquadra: null, dataCessione: null }) as any,
    )

    // Squadra 1 è l'unico offerente su g10 → è il leader corrente
    vi.mocked(mockEntityManager.find).mockResolvedValueOnce([
      makePropostaMercato({ id: 10, idSquadra: 1, idGiocatore: 10, prezzoOfferto: 50, deletedAt: null }) as any,
    ])

    // Tentativo di rilanciare contro sé stessa: prezzoOfferto 60 > 50 ma è self-outbid
    await expect(
      createProposta({ ctx, input: { idGiocatore: 10, prezzoOfferto: 60 } }),
    ).rejects.toThrow(/non puoi rilanciare contro te stesso/i)
  })

  /**
   * Serializzazione: verifica che pg_advisory_xact_lock venga invocato
   * con l'id della sessione dentro la transazione. Garantisce che le
   * richieste concorrenti sulla stessa sessione siano serializzate.
   */
  it('invoca pg_advisory_xact_lock con id sessione dentro la transazione', async () => {
    const ctx = makeMockContext({ session: { user: { id: '1', ruolo: 'contributor', idSquadra: 1 } } })
    const sessione = makeSessioneInChiaro(3)

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(Trasferimento.findOne).mockResolvedValue(
      makeTrasferimento({ idSquadra: null, dataCessione: null }) as any,
    )

    vi.mocked(mockEntityManager.find).mockResolvedValueOnce([])
    vi.mocked(mockEntityManager.create).mockImplementation(((_e: unknown, data: any) => data) as any)
    vi.mocked(mockEntityManager.save).mockImplementation(((_e: unknown, data: any) => Promise.resolve(data)) as any)

    await createProposta({ ctx, input: { idGiocatore: 100, prezzoOfferto: 10 } })

    // Il lock deve essere il PRIMO statement eseguito nella transazione
    expect(vi.mocked(mockEntityManager.query)).toHaveBeenCalledWith(
      'SELECT pg_advisory_xact_lock($1)',
      [sessione.id],
    )
  })

  /**
   * Offerta valida quando la squadra non è ancora leader su nessun giocatore.
   * Verifica il percorso "happy path" senza cap.
   */
  it('prima offerta (nessun slot occupato) accettata normalmente', async () => {
    const ctx = makeMockContext({ session: { user: { id: '1', ruolo: 'contributor', idSquadra: 1 } } })
    const sessione = makeSessioneInChiaro(2)

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(Trasferimento.findOne).mockResolvedValue(
      makeTrasferimento({ idSquadra: null, dataCessione: null }) as any,
    )

    // Nessuna offerta nella sessione
    vi.mocked(mockEntityManager.find).mockResolvedValueOnce([])
    vi.mocked(mockEntityManager.create).mockImplementation(((_e: unknown, data: any) => data) as any)
    vi.mocked(mockEntityManager.save).mockImplementation(((_e: unknown, data: any) => Promise.resolve({ ...data, id: 99 })) as any)

    const result = await createProposta({ ctx, input: { idGiocatore: 100, prezzoOfferto: 15 } })

    expect(result).toBeDefined()
    expect(vi.mocked(mockEntityManager.create)).toHaveBeenCalledWith(
      PropostaMercato,
      expect.objectContaining({ idGiocatore: 100, prezzoOfferto: 15, astaInChiaro: true }),
    )
  })
})



// ============================================================================
// Nuovi test: requisiti QA per notifica email (asta al buio/in chiaro, escaping, validazione)
// ============================================================================

describe('createSessione — email notification QA requirements', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('deduplica email case-insensitively (test@ex.com vs TEST@EX.COM)', async () => {
    vi.stubEnv('MAIL_ENABLED', 'true')

    vi.mocked(SessioneMercato.find).mockResolvedValue([])
    vi.mocked(SessioneMercato.create).mockImplementation((data) => data as any)
    vi.mocked(SessioneMercato.save).mockImplementation(async (e) => e as any)

    const utenti = [
      { idUtente: 1, mail: 'test@example.com', presidente: 'P1', adminLevel: false },
      { idUtente: 2, mail: 'TEST@EXAMPLE.COM', presidente: 'P2', adminLevel: false }, // case-insensitive duplicate
      { idUtente: 3, mail: 'other@example.com', presidente: 'P3', adminLevel: false },
    ]
    vi.mocked(Utenti.find).mockResolvedValue(utenti as any)

    const now = Date.now()
    await createSessione({
      input: {
        dataApertura: new Date(now + 3600000),
        dataChiusura: new Date(now + 7200000),
        maxProposte: 5,
        acquistiEffettivi: 3,
        tipoValuta: 'fantamilioni',
        astaInChiaro: false,
      },
    })

    // Deve inviare solo 2 mail (deduplicate case-insensitively)
    expect(vi.mocked(ReSendMailAsync)).toHaveBeenCalledTimes(2)

    vi.unstubAllEnvs()
  })

  it('asta al buio: il messaggio include "Modalità Asta al Buio" e regole specifiche', async () => {
    vi.stubEnv('MAIL_ENABLED', 'true')
    vi.stubEnv('NEXTAUTH_URL', 'https://example.com')

    vi.mocked(SessioneMercato.find).mockResolvedValue([])
    vi.mocked(SessioneMercato.create).mockImplementation((data) => data as any)
    vi.mocked(SessioneMercato.save).mockImplementation(async (e) => e as any)

    const utenti = [{ idUtente: 1, mail: 'test@example.com', presidente: 'Tester', adminLevel: false }]
    vi.mocked(Utenti.find).mockResolvedValue(utenti as any)

    const now = Date.now()
    await createSessione({
      input: {
        dataApertura: new Date(now + 3600000),
        dataChiusura: new Date(now + 7200000),
        maxProposte: 5,
        acquistiEffettivi: 3,
        tipoValuta: 'fantamilioni',
        astaInChiaro: false,
      },
    })

    expect(vi.mocked(ReSendMailAsync)).toHaveBeenCalled()
    const htmlCall = vi.mocked(ReSendMailAsync).mock.calls[0]![3]
    expect(htmlCall).toContain('Modalità Asta al Buio')
    expect(htmlCall).toContain('criptate')

    vi.unstubAllEnvs()
  })

  it('asta in chiaro: il messaggio include "Modalità Asta in Chiaro" e regole specifiche', async () => {
    vi.stubEnv('MAIL_ENABLED', 'true')
    vi.stubEnv('NEXTAUTH_URL', 'https://example.com')

    vi.mocked(SessioneMercato.find).mockResolvedValue([])
    vi.mocked(SessioneMercato.create).mockImplementation((data) => data as any)
    vi.mocked(SessioneMercato.save).mockImplementation(async (e) => e as any)

    const utenti = [{ idUtente: 1, mail: 'test@example.com', presidente: 'Tester', adminLevel: false }]
    vi.mocked(Utenti.find).mockResolvedValue(utenti as any)

    const now = Date.now()
    await createSessione({
      input: {
        dataApertura: new Date(now + 3600000),
        dataChiusura: new Date(now + 7200000),
        maxProposte: 5,
        acquistiEffettivi: 3,
        tipoValuta: 'euro',
        astaInChiaro: true,
      },
    })

    expect(vi.mocked(ReSendMailAsync)).toHaveBeenCalled()
    const htmlCall = vi.mocked(ReSendMailAsync).mock.calls[0]![3]
    expect(htmlCall).toContain('Modalità Asta in Chiaro')
    expect(htmlCall).toContain('tempo reale')

    vi.unstubAllEnvs()
  })

  it('HTML escaping: presidente con <script> non produce XSS', async () => {
    vi.stubEnv('MAIL_ENABLED', 'true')
    vi.stubEnv('NEXTAUTH_URL', 'https://example.com')

    vi.mocked(SessioneMercato.find).mockResolvedValue([])
    vi.mocked(SessioneMercato.create).mockImplementation((data) => data as any)
    vi.mocked(SessioneMercato.save).mockImplementation(async (e) => e as any)

    const utenti = [
      { idUtente: 1, mail: 'test@example.com', presidente: '<script>alert("xss")</script>', adminLevel: false },
    ]
    vi.mocked(Utenti.find).mockResolvedValue(utenti as any)

    const now = Date.now()
    await createSessione({
      input: {
        dataApertura: new Date(now + 3600000),
        dataChiusura: new Date(now + 7200000),
        maxProposte: 5,
        acquistiEffettivi: 3,
        tipoValuta: 'fantamilioni',
        astaInChiaro: false,
      },
    })

    const htmlCall = vi.mocked(ReSendMailAsync).mock.calls[0]![3]
    expect(htmlCall).not.toContain('<script>')
    expect(htmlCall).toContain('&lt;script&gt;')

    vi.unstubAllEnvs()
  })

  it('NEXTAUTH_URL mancante lancia errore esplicito (non mail malformata)', async () => {
    vi.stubEnv('MAIL_ENABLED', 'true')
    vi.stubEnv('NEXTAUTH_URL', '')

    vi.mocked(SessioneMercato.find).mockResolvedValue([])
    vi.mocked(SessioneMercato.create).mockImplementation((data) => data as any)
    vi.mocked(SessioneMercato.save).mockImplementation(async (e) => e as any)

    const utenti = [{ idUtente: 1, mail: 'test@example.com', presidente: 'Test', adminLevel: false }]
    vi.mocked(Utenti.find).mockResolvedValue(utenti as any)

    const now = Date.now()
    await expect(
      createSessione({
        input: {
          dataApertura: new Date(now + 3600000),
          dataChiusura: new Date(now + 7200000),
          maxProposte: 5,
          acquistiEffettivi: 3,
          tipoValuta: 'fantamilioni',
          astaInChiaro: false,
        },
      }),
    ).rejects.toThrow('NEXTAUTH_URL non configurato')

    vi.unstubAllEnvs()
  })

  it('errore di notifica non viene ingoiato: lancia ORPCError se notifica fallisce', async () => {
    vi.stubEnv('MAIL_ENABLED', 'true')
    vi.stubEnv('NEXTAUTH_URL', 'https://example.com')

    vi.mocked(SessioneMercato.find).mockResolvedValue([])
    vi.mocked(SessioneMercato.create).mockImplementation((data) => data as any)
    const savedSessione = { id: 99, maxProposte: 5, acquistiEffettivi: 3, tipoValuta: 'fantamilioni', astaInChiaro: false, dataApertura: new Date(), dataChiusura: new Date() }
    vi.mocked(SessioneMercato.save).mockResolvedValue(savedSessione as any)

    // Simuliamo fallimento nel recupero presidenti
    vi.mocked(Utenti.find).mockRejectedValue(new Error('DB connection lost'))

    const now = Date.now()
    await expect(
      createSessione({
        input: {
          dataApertura: new Date(now + 3600000),
          dataChiusura: new Date(now + 7200000),
          maxProposte: 5,
          acquistiEffettivi: 3,
          tipoValuta: 'fantamilioni',
          astaInChiaro: false,
        },
      }),
    ).rejects.toThrow('DB connection lost')

    vi.unstubAllEnvs()
  })
})
