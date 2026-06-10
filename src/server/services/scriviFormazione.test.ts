/**
 * Test suite per scriviFormazione
 *
 * Testa la logica transazionale di scrittura formazione:
 * 1. Elimina voti e formazioni esistenti
 * 2. Inserisce nuova formazione
 * 3. Inserisce voti per ogni giocatore (voto = 0)
 *
 * Pattern: mock AppDataSource.transaction con vi.mock e test della interfaccia pubblica
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { In } from 'typeorm'
import { scriviFormazione, type ScriviFormazioneInput } from './scriviFormazione'
import { Formazioni, Voti } from '~/server/db/entities'

// Mock AppDataSource e dateUtils prima di importare il modulo
vi.mock('~/data-source', () => ({
  AppDataSource: {
    transaction: vi.fn(),
  },
}))

vi.mock('~/utils/dateUtils', () => ({
  nowInItalyIso: vi.fn(() => '2024-05-20T10:00:00Z'),
}))

// Dopo i mock, importiamo il modulo che usiamo
import { AppDataSource } from '~/data-source'
import { nowInItalyIso } from '~/utils/dateUtils'

describe('scriviFormazione', () => {
  let mockEntityManager: any
  let mockTransactionCallback: any

  beforeEach(() => {
    vi.clearAllMocks()

    // Crea un mock entity manager con i metodi che ci servono
    mockEntityManager = {
      find: vi.fn(),
      delete: vi.fn().mockResolvedValue({}),
      insert: vi.fn().mockResolvedValue({}),
    }

    // Mock di AppDataSource.transaction che simula il callback
    mockTransactionCallback = vi.fn().mockImplementation((cb) => {
      // Il callback riceve il mockEntityManager come parametro
      return cb(mockEntityManager)
    })

    // Assegna il mock al valore di AppDataSource.transaction
    ;(AppDataSource.transaction as any) = mockTransactionCallback
  })

  describe('Happy path — inserimento formazione e voti', () => {
    it('should insert formation with correct data and insert votes for each player', async () => {
      // arrange
      const input: ScriviFormazioneInput = {
        idPartita: 100,
        idSquadra: 1,
        idCalendario: 5,
        modulo: '4-3-3',
        giocatori: [
          { idGiocatore: 1, titolare: true, riserva: null },
          { idGiocatore: 2, titolare: true, riserva: null },
          { idGiocatore: 3, titolare: true, riserva: null },
          { idGiocatore: 4, titolare: false, riserva: 1 },
          { idGiocatore: 5, titolare: false, riserva: 2 },
        ],
      }

      // Mock: nessuna formazione esistente
      mockEntityManager.find.mockResolvedValue([])

      // Mock: l'insert della formazione restituisce l'ID
      mockEntityManager.insert
        .mockResolvedValueOnce({ identifiers: [{ idFormazione: 99 }] })
        .mockResolvedValue({})

      // act
      await scriviFormazione(input)

      // assert
      expect(mockEntityManager.find).toHaveBeenCalledWith(Formazioni, {
        select: { idFormazione: true },
        where: { idPartita: 100, idSquadra: 1 },
      })

      // Verifica che insert sia stato chiamato per Formazioni
      expect(mockEntityManager.insert).toHaveBeenCalledWith(
        Formazioni,
        expect.objectContaining({
          idPartita: 100,
          idSquadra: 1,
          modulo: '4-3-3',
          hasBloccata: false,
          dataOra: '2024-05-20T10:00:00Z',
        }),
      )

      // Verifica che insert sia stato chiamato 5 volte per i voti (3 titolari + 2 riserve)
      expect(mockEntityManager.insert).toHaveBeenCalledTimes(6) // 1 formazione + 5 voti
    })

    it('should insert 3 votes for 3 starting players with titolare=true and riserva=null', async () => {
      // arrange
      const input: ScriviFormazioneInput = {
        idPartita: 101,
        idSquadra: 2,
        idCalendario: 6,
        modulo: '5-4-1',
        giocatori: [
          { idGiocatore: 10, titolare: true, riserva: null },
          { idGiocatore: 11, titolare: true, riserva: null },
          { idGiocatore: 12, titolare: true, riserva: null },
        ],
      }

      mockEntityManager.find.mockResolvedValue([])
      mockEntityManager.insert
        .mockResolvedValueOnce({ identifiers: [{ idFormazione: 50 }] })
        .mockResolvedValue({})

      // act
      await scriviFormazione(input)

      // assert
      const insertCalls = mockEntityManager.insert.mock.calls

      // Verifico che i voti siano stati inseriti con i dati corretti
      const votoCalls = insertCalls.slice(1) // Salta la formazione

      votoCalls.forEach((call, index) => {
        expect(call[0]).toBe(Voti)
        expect(call[1]).toMatchObject({
          idGiocatore: input.giocatori[index].idGiocatore,
          idCalendario: 6,
          idFormazione: 50,
          titolare: true,
          riserva: null,
          voto: 0,
        })
      })
    })

    it('should insert votes for both titolari and riserve with correct riserva numbers', async () => {
      // arrange
      const input: ScriviFormazioneInput = {
        idPartita: 102,
        idSquadra: 3,
        idCalendario: 7,
        modulo: '3-5-2',
        giocatori: [
          { idGiocatore: 20, titolare: true, riserva: null },
          { idGiocatore: 21, titolare: true, riserva: null },
          { idGiocatore: 22, titolare: false, riserva: 1 },
          { idGiocatore: 23, titolare: false, riserva: 2 },
          { idGiocatore: 24, titolare: false, riserva: 3 },
        ],
      }

      mockEntityManager.find.mockResolvedValue([])
      mockEntityManager.insert
        .mockResolvedValueOnce({ identifiers: [{ idFormazione: 60 }] })
        .mockResolvedValue({})

      // act
      await scriviFormazione(input)

      // assert
      const insertCalls = mockEntityManager.insert.mock.calls
      const votoCalls = insertCalls.slice(1)

      // Verifica riserva numbers
      expect(votoCalls[0][1]).toMatchObject({ titolare: true, riserva: null })
      expect(votoCalls[1][1]).toMatchObject({ titolare: true, riserva: null })
      expect(votoCalls[2][1]).toMatchObject({ titolare: false, riserva: 1 })
      expect(votoCalls[3][1]).toMatchObject({ titolare: false, riserva: 2 })
      expect(votoCalls[4][1]).toMatchObject({ titolare: false, riserva: 3 })
    })
  })

  describe('Delete existing formations and votes', () => {
    it('should delete existing votes and formations when formazioni preesistenti exist', async () => {
      // arrange
      const input: ScriviFormazioneInput = {
        idPartita: 200,
        idSquadra: 4,
        idCalendario: 8,
        modulo: '4-4-2',
        giocatori: [{ idGiocatore: 30, titolare: true, riserva: null }],
      }

      // Mock: trovare 2 formazioni esistenti
      mockEntityManager.find.mockResolvedValue([
        { idFormazione: 1 },
        { idFormazione: 2 },
      ])

      mockEntityManager.insert
        .mockResolvedValueOnce({ identifiers: [{ idFormazione: 70 }] })
        .mockResolvedValue({})

      // act
      await scriviFormazione(input)

      // assert
      const deleteCalls = mockEntityManager.delete.mock.calls

      // Primo delete: per i voti delle formazioni preesistenti
      expect(deleteCalls[0]).toEqual([
        Voti,
        {
          idFormazione: In([1, 2]),
        },
      ])

      // Secondo delete: per le formazioni
      expect(deleteCalls[1]).toEqual([
        Formazioni,
        { idPartita: 200, idSquadra: 4 },
      ])
    })

    it('should NOT delete votes if no existing formations, but still delete formations', async () => {
      // arrange
      const input: ScriviFormazioneInput = {
        idPartita: 201,
        idSquadra: 5,
        idCalendario: 9,
        modulo: '3-4-3',
        giocatori: [{ idGiocatore: 31, titolare: true, riserva: null }],
      }

      // Mock: nessuna formazione esistente
      mockEntityManager.find.mockResolvedValue([])

      mockEntityManager.insert
        .mockResolvedValueOnce({ identifiers: [{ idFormazione: 80 }] })
        .mockResolvedValue({})

      // act
      await scriviFormazione(input)

      // assert
      const deleteCalls = mockEntityManager.delete.mock.calls

      // Dovrebbe esserci solo il delete di Formazioni (non il delete di Voti)
      expect(deleteCalls.length).toBe(1)
      expect(deleteCalls[0]).toEqual([
        Formazioni,
        { idPartita: 201, idSquadra: 5 },
      ])
    })
  })

  describe('Empty giocatori array', () => {
    it('should insert formation but no votes when giocatori is empty', async () => {
      // arrange
      const input: ScriviFormazioneInput = {
        idPartita: 300,
        idSquadra: 6,
        idCalendario: 10,
        modulo: '4-2-4',
        giocatori: [],
      }

      mockEntityManager.find.mockResolvedValue([])
      mockEntityManager.insert.mockResolvedValueOnce({
        identifiers: [{ idFormazione: 90 }],
      })

      // act
      await scriviFormazione(input)

      // assert
      // Insert dovrebbe essere chiamato solo una volta (per la formazione)
      expect(mockEntityManager.insert).toHaveBeenCalledTimes(1)
      expect(mockEntityManager.insert).toHaveBeenCalledWith(
        Formazioni,
        expect.any(Object),
      )
    })
  })

  describe('hasBloccata invariant', () => {
    it('should always insert hasBloccata=false', async () => {
      // arrange
      const input: ScriviFormazioneInput = {
        idPartita: 400,
        idSquadra: 7,
        idCalendario: 11,
        modulo: '5-3-2',
        giocatori: [{ idGiocatore: 40, titolare: true, riserva: null }],
      }

      mockEntityManager.find.mockResolvedValue([])
      mockEntityManager.insert
        .mockResolvedValueOnce({ identifiers: [{ idFormazione: 100 }] })
        .mockResolvedValue({})

      // act
      await scriviFormazione(input)

      // assert
      const formazioneInsertCall = mockEntityManager.insert.mock.calls[0]
      expect(formazioneInsertCall[1]).toMatchObject({
        hasBloccata: false,
      })
    })
  })

  describe('voto invariant', () => {
    it('should always insert voto=0 for each giocatore', async () => {
      // arrange
      const input: ScriviFormazioneInput = {
        idPartita: 401,
        idSquadra: 8,
        idCalendario: 12,
        modulo: '4-3-3',
        giocatori: [
          { idGiocatore: 41, titolare: true, riserva: null },
          { idGiocatore: 42, titolare: true, riserva: null },
          { idGiocatore: 43, titolare: false, riserva: 1 },
        ],
      }

      mockEntityManager.find.mockResolvedValue([])
      mockEntityManager.insert
        .mockResolvedValueOnce({ identifiers: [{ idFormazione: 110 }] })
        .mockResolvedValue({})

      // act
      await scriviFormazione(input)

      // assert
      const insertCalls = mockEntityManager.insert.mock.calls
      const votoCalls = insertCalls.slice(1) // Salta la formazione

      votoCalls.forEach((call) => {
        expect(call[1]).toMatchObject({
          voto: 0,
        })
      })
    })
  })

  describe('riserva field handling', () => {
    it('should preserve riserva=null for titolari', async () => {
      // arrange
      const input: ScriviFormazioneInput = {
        idPartita: 500,
        idSquadra: 9,
        idCalendario: 13,
        modulo: '4-3-3',
        giocatori: [
          { idGiocatore: 50, titolare: true, riserva: null },
        ],
      }

      mockEntityManager.find.mockResolvedValue([])
      mockEntityManager.insert
        .mockResolvedValueOnce({ identifiers: [{ idFormazione: 120 }] })
        .mockResolvedValue({})

      // act
      await scriviFormazione(input)

      // assert
      const votoCall = mockEntityManager.insert.mock.calls[1]
      expect(votoCall[1]).toMatchObject({
        riserva: null,
      })
    })

    it('should preserve riserva numbers for riserve', async () => {
      // arrange
      const input: ScriviFormazioneInput = {
        idPartita: 501,
        idSquadra: 10,
        idCalendario: 14,
        modulo: '4-3-3',
        giocatori: [
          { idGiocatore: 51, titolare: false, riserva: 1 },
          { idGiocatore: 52, titolare: false, riserva: 2 },
        ],
      }

      mockEntityManager.find.mockResolvedValue([])
      mockEntityManager.insert
        .mockResolvedValueOnce({ identifiers: [{ idFormazione: 130 }] })
        .mockResolvedValue({})

      // act
      await scriviFormazione(input)

      // assert
      const votoCall1 = mockEntityManager.insert.mock.calls[1]
      const votoCall2 = mockEntityManager.insert.mock.calls[2]

      expect(votoCall1[1]).toMatchObject({ riserva: 1 })
      expect(votoCall2[1]).toMatchObject({ riserva: 2 })
    })

    it('should handle riserva=undefined by converting to null', async () => {
      // arrange
      const input: ScriviFormazioneInput = {
        idPartita: 502,
        idSquadra: 11,
        idCalendario: 15,
        modulo: '4-3-3',
        giocatori: [
          { idGiocatore: 53, titolare: false }, // riserva is undefined
        ],
      }

      mockEntityManager.find.mockResolvedValue([])
      mockEntityManager.insert
        .mockResolvedValueOnce({ identifiers: [{ idFormazione: 140 }] })
        .mockResolvedValue({})

      // act
      await scriviFormazione(input)

      // assert
      const votoCall = mockEntityManager.insert.mock.calls[1]
      expect(votoCall[1]).toMatchObject({
        riserva: null,
      })
    })
  })

  describe('Transaction error handling', () => {
    it('should throw error if insert Formazioni fails', async () => {
      // arrange
      const input: ScriviFormazioneInput = {
        idPartita: 600,
        idSquadra: 12,
        idCalendario: 16,
        modulo: '4-3-3',
        giocatori: [{ idGiocatore: 60, titolare: true, riserva: null }],
      }

      mockEntityManager.find.mockResolvedValue([])
      mockEntityManager.insert.mockRejectedValueOnce(
        new Error('Database constraint violated'),
      )

      // act & assert
      await expect(scriviFormazione(input)).rejects.toThrow(
        'Database constraint violated',
      )
    })

    it('should not swallow transaction errors from insert Voti', async () => {
      // arrange
      const input: ScriviFormazioneInput = {
        idPartita: 601,
        idSquadra: 13,
        idCalendario: 17,
        modulo: '4-3-3',
        giocatori: [
          { idGiocatore: 61, titolare: true, riserva: null },
          { idGiocatore: 62, titolare: false, riserva: 1 },
        ],
      }

      mockEntityManager.find.mockResolvedValue([])
      mockEntityManager.insert
        .mockResolvedValueOnce({ identifiers: [{ idFormazione: 150 }] })
        .mockRejectedValueOnce(new Error('Vote insertion failed'))

      // act & assert
      await expect(scriviFormazione(input)).rejects.toThrow(
        'Vote insertion failed',
      )
    })
  })

  describe('Integration: complete flow with previous formations', () => {
    it('should handle complete flow: delete old + insert new formation + insert votes', async () => {
      // arrange
      const input: ScriviFormazioneInput = {
        idPartita: 700,
        idSquadra: 14,
        idCalendario: 18,
        modulo: '3-5-2',
        giocatori: [
          { idGiocatore: 70, titolare: true, riserva: null },
          { idGiocatore: 71, titolare: true, riserva: null },
          { idGiocatore: 72, titolare: true, riserva: null },
          { idGiocatore: 73, titolare: false, riserva: 1 },
          { idGiocatore: 74, titolare: false, riserva: 2 },
        ],
      }

      // Mock: trovare 3 formazioni preesistenti
      mockEntityManager.find.mockResolvedValue([
        { idFormazione: 11 },
        { idFormazione: 12 },
        { idFormazione: 13 },
      ])

      mockEntityManager.insert
        .mockResolvedValueOnce({ identifiers: [{ idFormazione: 160 }] })
        .mockResolvedValue({})

      // act
      await scriviFormazione(input)

      // assert
      // 1. Verifica find delle formazioni preesistenti
      expect(mockEntityManager.find).toHaveBeenCalledTimes(1)

      // 2. Verifica delete dei voti preesistenti
      expect(mockEntityManager.delete).toHaveBeenNthCalledWith(1, Voti, {
        idFormazione: In([11, 12, 13]),
      })

      // 3. Verifica delete delle formazioni
      expect(mockEntityManager.delete).toHaveBeenNthCalledWith(2, Formazioni, {
        idPartita: 700,
        idSquadra: 14,
      })

      // 4. Verifica insert della nuova formazione
      expect(mockEntityManager.insert).toHaveBeenNthCalledWith(
        1,
        Formazioni,
        expect.objectContaining({
          idPartita: 700,
          idSquadra: 14,
          modulo: '3-5-2',
          hasBloccata: false,
        }),
      )

      // 5. Verifica insert di 5 voti
      expect(mockEntityManager.insert).toHaveBeenCalledTimes(6) // 1 formazione + 5 voti
    })
  })

  describe('idCalendario propagation', () => {
    it('should use correct idCalendario for all votes', async () => {
      // arrange
      const input: ScriviFormazioneInput = {
        idPartita: 800,
        idSquadra: 15,
        idCalendario: 25,
        modulo: '4-3-3',
        giocatori: [
          { idGiocatore: 80, titolare: true, riserva: null },
          { idGiocatore: 81, titolare: false, riserva: 1 },
        ],
      }

      mockEntityManager.find.mockResolvedValue([])
      mockEntityManager.insert
        .mockResolvedValueOnce({ identifiers: [{ idFormazione: 170 }] })
        .mockResolvedValue({})

      // act
      await scriviFormazione(input)

      // assert
      const insertCalls = mockEntityManager.insert.mock.calls
      const votoCalls = insertCalls.slice(1)

      votoCalls.forEach((call) => {
        expect(call[1]).toMatchObject({
          idCalendario: 25,
        })
      })
    })
  })

  describe('idFormazione from insert result', () => {
    it('should use idFormazione from insert result for all votes', async () => {
      // arrange
      const input: ScriviFormazioneInput = {
        idPartita: 900,
        idSquadra: 16,
        idCalendario: 26,
        modulo: '4-3-3',
        giocatori: [
          { idGiocatore: 90, titolare: true, riserva: null },
          { idGiocatore: 91, titolare: true, riserva: null },
        ],
      }

      mockEntityManager.find.mockResolvedValue([])
      mockEntityManager.insert
        .mockResolvedValueOnce({ identifiers: [{ idFormazione: 999 }] })
        .mockResolvedValue({})

      // act
      await scriviFormazione(input)

      // assert
      const insertCalls = mockEntityManager.insert.mock.calls
      const votoCalls = insertCalls.slice(1)

      votoCalls.forEach((call) => {
        expect(call[1]).toMatchObject({
          idFormazione: 999,
        })
      })
    })
  })
})
