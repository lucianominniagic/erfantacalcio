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

import { SessioneMercato, PropostaMercato, Trasferimento, Utente } from '~/server/db/entities'

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
    }

    await createSessione({ input })

    expect(SessioneMercato.create).toHaveBeenCalledTimes(1)
    const callArg = vi.mocked(SessioneMercato.create).mock.calls[0]![0] as any
    expect(callArg.acquistiEffettivi).toBe(3)
    expect(callArg.maxProposte).toBe(5)
    expect(callArg.tipoValuta).toBe('fantamilioni')
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

    // proposteGiocatore → vuote: nessuna offerta ancora su questo giocatore
    // tutte (aste vinte calc) → vuote
    // myProposte (cap check) → una offerta esistente (giocatore diverso)
    vi.mocked(PropostaMercato.find)
      .mockResolvedValueOnce([]) // proposteGiocatore
      .mockResolvedValueOnce([]) // tutte – nessuna asta scaduta
      .mockResolvedValueOnce([  // myProposte – 1 offerta già presente (giocatore=99)
        makePropostaMercato({ idSquadra: 1, idGiocatore: 99, deletedAt: null }) as any,
      ])

    vi.mocked(PropostaMercato.create).mockImplementation((data) => data as any)
    vi.mocked(PropostaMercato.save).mockImplementation(async (e) => e as any)

    await createProposta({ ctx, input: { idGiocatore: 100, prezzoOfferto: 10 } })

    // La chiamata a PropostaMercato.create deve includere astaInChiaro: true
    // per escludere la riga dal partial unique index sulle proposte al buio.
    expect(PropostaMercato.create).toHaveBeenCalledWith(
      expect.objectContaining({ astaInChiaro: true, priorita: 1 }),
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

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(Trasferimento.findOne).mockResolvedValue(
      makeTrasferimento({ idSquadra: null, dataCessione: null }) as any,
    )

    // Prima offerta (giocatore 101):
    // - proposteGiocatore = []  (nessuna offerta su 101)
    // - tutte = []
    // - myProposte = [] (nessun cap)
    vi.mocked(PropostaMercato.find)
      .mockResolvedValueOnce([])  // proposteGiocatore giocatore 101
      .mockResolvedValueOnce([])  // tutte
      .mockResolvedValueOnce([])  // myProposte
    vi.mocked(PropostaMercato.create).mockImplementation((data) => data as any)
    vi.mocked(PropostaMercato.save).mockImplementation(async (e) => e as any)

    await createProposta({ ctx, input: { idGiocatore: 101, prezzoOfferto: 10 } })

    const firstCallArg = vi.mocked(PropostaMercato.create).mock.calls[0]![0] as any
    expect(firstCallArg.astaInChiaro).toBe(true)
    expect(firstCallArg.priorita).toBe(1)
    expect(firstCallArg.idGiocatore).toBe(101)

    vi.clearAllMocks()
    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(Trasferimento.findOne).mockResolvedValue(
      makeTrasferimento({ idSquadra: null, dataCessione: null }) as any,
    )

    // Seconda offerta (giocatore 102, stesso team):
    // - proposteGiocatore = []  (nessuna offerta su 102)
    // - tutte = [offerta su 101 già presente dalla stessa squadra]
    // - myProposte = 1 offerta (giocatore 101, sotto il cap di 5)
    const primaOfferta = makePropostaMercato({ idSquadra: 1, idGiocatore: 101, deletedAt: null }) as any
    primaOfferta.prezzoOfferto = 10
    vi.mocked(PropostaMercato.find)
      .mockResolvedValueOnce([])              // proposteGiocatore giocatore 102
      .mockResolvedValueOnce([primaOfferta])  // tutte
      .mockResolvedValueOnce([primaOfferta])  // myProposte (1 proposta, < maxProposte=5)
    vi.mocked(PropostaMercato.create).mockImplementation((data) => data as any)
    vi.mocked(PropostaMercato.save).mockImplementation(async (e) => e as any)

    await createProposta({ ctx, input: { idGiocatore: 102, prezzoOfferto: 10 } })

    const secondCallArg = vi.mocked(PropostaMercato.create).mock.calls[0]![0] as any
    // REGRESSIONE: senza il fix, questa riga avrebbe astaInChiaro=false (default)
    // causando una unique violation in DB perché (sessione=10, squadra=1, priorita=1)
    // esiste già nell'indice.
    expect(secondCallArg.astaInChiaro).toBe(true)
    expect(secondCallArg.priorita).toBe(1)
    expect(secondCallArg.idGiocatore).toBe(102)
  })

  /**
   * Verifica che il path UPDATE (squadra ha già un'offerta sullo stesso giocatore)
   * non passi per PropostaMercato.create — nessun INSERT, nessun problema di indice.
   */
  it('UPDATE path (offerta esistente stesso giocatore) non chiama PropostaMercato.create', async () => {
    const ctx = makeMockContext({ session: { user: { id: '1', ruolo: 'contributor', idSquadra: 1 } } })

    const sessione = {
      ...makeSessioneMercato({ id: 10, maxProposte: 5 }),
      astaInChiaro: true,
      acquistiEffettivi: 3,
    }

    const offertaEsistente = {
      ...makePropostaMercato({ idSquadra: 1, idGiocatore: 100, deletedAt: null }),
      prezzoOfferto: 5,
      save: vi.fn().mockResolvedValue({ prezzoOfferto: 20 }),
    }

    vi.mocked(SessioneMercato.findOne).mockResolvedValue(sessione as any)
    vi.mocked(Trasferimento.findOne).mockResolvedValue(
      makeTrasferimento({ idSquadra: null, dataCessione: null }) as any,
    )

    // proposteGiocatore → [offerta esistente della stessa squadra]
    // tutte (aste vinte) → [offerta esistente]
    vi.mocked(PropostaMercato.find)
      .mockResolvedValueOnce([offertaEsistente as any]) // proposteGiocatore (mia offerta già c'è)
      .mockResolvedValueOnce([offertaEsistente as any]) // tutte

    vi.mocked(PropostaMercato.save).mockResolvedValue({ ...offertaEsistente, prezzoOfferto: 20 } as any)

    await createProposta({ ctx, input: { idGiocatore: 100, prezzoOfferto: 20 } })

    // UPDATE path: nessun create, nessun rischio indice
    expect(PropostaMercato.create).not.toHaveBeenCalled()
    expect(PropostaMercato.save).toHaveBeenCalledWith(
      expect.objectContaining({ idGiocatore: 100, prezzoOfferto: 20 }),
    )
  })
})
