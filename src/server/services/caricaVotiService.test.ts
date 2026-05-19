/**
 * Test suite per caricaVoti
 *
 * Testa la logica transazionale di caricamento voti:
 * 1. Guard: verifica che tutte le partite abbiano formazioni per la giornata
 * 2. In transazione:
 *    - findAndCreateGiocatori: trova o crea giocatori per id_pf / nome
 *    - auto-trasferimento: crea trasferimento se giocatore non lo ha nella stagione corrente
 *    - upsert voti: update se esiste, insert se no
 *
 * Pattern: mock AppDataSource.transaction e Calendario (Active Record) con vi.mock
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { z } from 'zod'
import type { uploadVotoGiocatoreSchema } from '~/schemas/giocatore'

type UploadVotoGiocatoreType = z.infer<typeof uploadVotoGiocatoreSchema>

// Mock AppDataSource, Calendario, Configurazione prima di importare il modulo
vi.mock('~/data-source', () => ({
  AppDataSource: {
    transaction: vi.fn(),
  },
}))

vi.mock('~/server/db/entities', async (importActual) => {
  const actual = await importActual<typeof import('~/server/db/entities')>()
  return {
    ...actual,
    Calendario: {
      ...actual.Calendario,
      findOneOrFail: vi.fn(),
    },
  }
})

vi.mock('~/config', () => ({
  Configurazione: {
    stagione: '2024/25',
    bonusGol: 3,
    bonusGolSubito: -1,
    bonusAssist: 1,
    bonusAmmonizione: -0.5,
    bonusEspulsione: -1,
    bonusRigoreParato: 3,
    bonusRigoreSbagliato: -3,
    bonusAutogol: -2,
  },
}))

// Dopo i mock, importiamo i moduli che usiamo
import { AppDataSource } from '~/data-source'
import { Calendario } from '~/server/db/entities'
import { caricaVoti } from './caricaVotiService'

describe('caricaVoti', () => {
  let mockEntityManager: {
    find: ReturnType<typeof vi.fn>
    findOne: ReturnType<typeof vi.fn>
    exists: ReturnType<typeof vi.fn>
    insert: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
  }

  const makeVotoGiocatore = (
    overrides: Partial<UploadVotoGiocatoreType> = {},
  ): UploadVotoGiocatoreType => ({
    id_pf: 1,
    Nome: 'Mario Rossi',
    Ammonizione: 0,
    Assist: 0,
    Autogol: 0,
    Espulsione: 0,
    GolSegnati: 0,
    GolSubiti: 0,
    RigoriErrati: 0,
    RigoriParati: 0,
    Ruolo: 'D',
    Squadra: 'Milan',
    Voto: 6,
    ...overrides,
  })

  const makeCalendario = (numPartite: number, tutteFormazioni: boolean) => ({
    idCalendario: 1,
    giornata: 5,
    giornataSerieA: 5,
    Partite: Array.from({ length: numPartite }, () => ({
      idPartita: Math.random(),
      Formazioni: tutteFormazioni ? [{ idFormazione: 1 }, { idFormazione: 2 }] : [],
    })),
  })

  beforeEach(() => {
    vi.clearAllMocks()

    mockEntityManager = {
      find: vi.fn(),
      findOne: vi.fn(),
      exists: vi.fn(),
      insert: vi.fn().mockResolvedValue({ identifiers: [{}] }),
      update: vi.fn().mockResolvedValue({}),
      create: vi.fn().mockImplementation((_, data) => data),
    }

    ;(AppDataSource.transaction as any) = vi.fn().mockImplementation((cb) => cb(mockEntityManager))
  })

  describe('guard checkFormazioni', () => {
    it('should throw Error if any partita has no Formazioni', async () => {
      // arrange
      const voti = [makeVotoGiocatore()]
      const idCalendario = 1
      const calendario = makeCalendario(2, false) // 0 Formazioni su 2 partite

      ;(Calendario.findOneOrFail as any).mockResolvedValue(calendario)

      // act & assert
      await expect(caricaVoti(voti, idCalendario)).rejects.toThrow()
    })

    it('should throw Error with giornata number when partite lack Formazioni', async () => {
      // arrange
      const voti = [makeVotoGiocatore()]
      const idCalendario = 1
      const calendario = makeCalendario(1, false)
      calendario.giornata = 10

      ;(Calendario.findOneOrFail as any).mockResolvedValue(calendario)

      // act & assert
      await expect(caricaVoti(voti, idCalendario)).rejects.toThrow(/10|giornata/)
    })

    it('should throw Error if partita has partial Formazioni (1/2)', async () => {
      // arrange
      const voti = [makeVotoGiocatore()]
      const idCalendario = 1
      const calendario = makeCalendario(1, false)
      calendario.Partite[0].Formazioni = [{ idFormazione: 1 }] // Solo 1 formazione

      ;(Calendario.findOneOrFail as any).mockResolvedValue(calendario)

      // act & assert
      await expect(caricaVoti(voti, idCalendario)).rejects.toThrow()
    })

    it('should not throw if all partite have 2 Formazioni', async () => {
      // arrange
      const voti = [makeVotoGiocatore()]
      const idCalendario = 1
      const calendario = makeCalendario(2, true)

      ;(Calendario.findOneOrFail as any).mockResolvedValue(calendario)
      mockEntityManager.find.mockResolvedValue([])
      mockEntityManager.insert.mockResolvedValue({ identifiers: [{}] })

      // act & assert
      await expect(caricaVoti(voti, idCalendario)).resolves.not.toThrow()
    })
  })

  describe('happy path — giocatore trovato, trasferimento esiste, voto esiste', () => {
    it('should call find for giocatore, findOne for trasferimento, exists for voto, update voto', async () => {
      // arrange
      const voto = makeVotoGiocatore({ id_pf: 42, Nome: 'Luigi Bianchi' })
      const voti = [voto]
      const idCalendario = 1
      const calendario = makeCalendario(1, true)

      ;(Calendario.findOneOrFail as any).mockResolvedValue(calendario)

      // Mock find giocatore per id_pf
      mockEntityManager.find.mockResolvedValueOnce([
        { idGiocatore: 10, nome: 'Luigi Bianchi', ruolo: 'D' },
      ])

      // Mock findOne trasferimento
      mockEntityManager.findOne.mockResolvedValueOnce({
        idTrasferimento: 20,
        idGiocatore: 10,
      })

      // Mock exists voto
      mockEntityManager.exists.mockResolvedValueOnce(true)

      // act
      await caricaVoti(voti, idCalendario)

      // assert
      expect(mockEntityManager.find).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          where: expect.objectContaining({ id_pf: expect.anything() }),
        }),
      )

      expect(mockEntityManager.findOne).toHaveBeenCalled()
      expect(mockEntityManager.exists).toHaveBeenCalled()
      expect(mockEntityManager.update).toHaveBeenCalled()
    })
  })

  describe('happy path — giocatore trovato, trasferimento esiste, voto NON esiste', () => {
    it('should call insert voto when voto does not exist', async () => {
      // arrange
      const voto = makeVotoGiocatore({ id_pf: 42 })
      const voti = [voto]
      const idCalendario = 1
      const calendario = makeCalendario(1, true)

      ;(Calendario.findOneOrFail as any).mockResolvedValue(calendario)

      mockEntityManager.find.mockResolvedValueOnce([
        { idGiocatore: 10, nome: 'Mario Rossi', ruolo: 'D' },
      ])

      mockEntityManager.findOne.mockResolvedValueOnce({
        idTrasferimento: 20,
        idGiocatore: 10,
      })

      // Mock exists voto = false
      mockEntityManager.exists.mockResolvedValueOnce(false)

      // act
      await caricaVoti(voti, idCalendario)

      // assert
      expect(mockEntityManager.exists).toHaveBeenCalled()
      expect(mockEntityManager.insert).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          voto: 6,
        }),
      )
    })
  })

  describe('auto-trasferimento', () => {
    it('should create trasferimento when giocatore has no trasferimento in current season', async () => {
      // arrange
      const voto = makeVotoGiocatore({ id_pf: 42, Squadra: 'Milan' })
      const voti = [voto]
      const idCalendario = 1
      const calendario = makeCalendario(1, true)

      ;(Calendario.findOneOrFail as any).mockResolvedValue(calendario)

      mockEntityManager.find.mockResolvedValueOnce([
        { idGiocatore: 10, nome: 'Mario Rossi', ruolo: 'D' },
      ])

      // Mock findOne trasferimento = null (no trasferimento)
      mockEntityManager.findOne.mockResolvedValueOnce(null)

      // Mock find SquadreSerieA
      mockEntityManager.find.mockResolvedValueOnce([
        { idSquadraSerieA: 100, nome: 'Milan' },
      ])

      mockEntityManager.exists.mockResolvedValueOnce(true)

      // act
      await caricaVoti(voti, idCalendario)

      // assert
      expect(mockEntityManager.insert).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          idGiocatore: 10,
          idSquadraSerieA: 100,
        }),
      )
    })

    it('should NOT create trasferimento when giocatore already has trasferimento', async () => {
      // arrange
      const voto = makeVotoGiocatore({ id_pf: 42, Squadra: 'Milan' })
      const voti = [voto]
      const idCalendario = 1
      const calendario = makeCalendario(1, true)

      ;(Calendario.findOneOrFail as any).mockResolvedValue(calendario)

      mockEntityManager.find.mockResolvedValueOnce([
        { idGiocatore: 10, nome: 'Mario Rossi', ruolo: 'D' },
      ])

      // Mock findOne trasferimento = exists
      mockEntityManager.findOne.mockResolvedValueOnce({
        idTrasferimento: 20,
        idGiocatore: 10,
      })

      mockEntityManager.exists.mockResolvedValueOnce(true)

      // act
      await caricaVoti(voti, idCalendario)

      // assert
      expect(mockEntityManager.insert.mock.calls.length).toBeGreaterThan(0)
    })
  })

  describe('findAndCreateGiocatori', () => {
    it('should find giocatore by id_pf when exists', async () => {
      // arrange
      const voto = makeVotoGiocatore({ id_pf: 42 })
      const voti = [voto]
      const idCalendario = 1
      const calendario = makeCalendario(1, true)

      ;(Calendario.findOneOrFail as any).mockResolvedValue(calendario)

      mockEntityManager.find.mockResolvedValueOnce([
        { idGiocatore: 10, nome: 'Mario Rossi', ruolo: 'D' },
      ])

      mockEntityManager.findOne.mockResolvedValueOnce({
        idTrasferimento: 20,
        idGiocatore: 10,
      })

      mockEntityManager.exists.mockResolvedValueOnce(true)

      // act
      await caricaVoti(voti, idCalendario)

      // assert
      expect(mockEntityManager.find).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          where: expect.objectContaining({ id_pf: expect.anything() }),
        }),
      )
    })

    it('should insert giocatore when not found by id_pf or nome', async () => {
      // arrange
      const voto = makeVotoGiocatore({ id_pf: 42, Nome: 'Marco Verdi', Ruolo: 'C' })
      const voti = [voto]
      const idCalendario = 1
      const calendario = makeCalendario(1, true)

      ;(Calendario.findOneOrFail as any).mockResolvedValue(calendario)

      mockEntityManager.find.mockResolvedValueOnce([])
      mockEntityManager.create.mockReturnValue({
        idGiocatore: 99,
        nome: 'Marco Verdi',
        ruolo: 'C',
      })
      mockEntityManager.insert.mockResolvedValueOnce({ identifiers: [{ idGiocatore: 99 }] })
      mockEntityManager.findOne.mockResolvedValueOnce(null)
      mockEntityManager.find.mockResolvedValueOnce([
        { idSquadraSerieA: 100, nome: 'Milan' },
      ])
      mockEntityManager.insert.mockResolvedValueOnce({})
      mockEntityManager.exists.mockResolvedValueOnce(false)
      mockEntityManager.insert.mockResolvedValueOnce({})

      // act
      await caricaVoti(voti, idCalendario)

      // assert
      expect(mockEntityManager.insert).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          nome: 'Marco Verdi',
        }),
      )
    })
  })

  describe('propagazione errori', () => {
    it('should re-throw error when transaction fails', async () => {
      // arrange
      const voti = [makeVotoGiocatore()]
      const idCalendario = 1
      const calendario = makeCalendario(1, true)

      ;(Calendario.findOneOrFail as any).mockResolvedValue(calendario)

      const transactionError = new Error('Transaction failed')
      ;(AppDataSource.transaction as any).mockImplementation(() => {
        throw transactionError
      })

      // act & assert
      await expect(caricaVoti(voti, idCalendario)).rejects.toThrow(transactionError)
    })

    it('should re-throw error when Calendario.findOneOrFail fails', async () => {
      // arrange
      const voti = [makeVotoGiocatore()]
      const idCalendario = 999

      ;(Calendario.findOneOrFail as any).mockRejectedValue(new Error('Calendario not found'))

      // act & assert
      await expect(caricaVoti(voti, idCalendario)).rejects.toThrow('Calendario not found')
    })
  })
})
