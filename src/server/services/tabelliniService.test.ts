import { describe, it, expect } from 'vitest'
import {
  mapVotoToTabellinoEntry,
  type VotoFormazione,
  type GiocatoreInfluente,
} from './tabelliniService'

describe('tabelliniService', () => {
  describe('mapVotoToTabellinoEntry', () => {
    it('should map voto to tabellino entry correctly', () => {
      const voto: VotoFormazione = {
        idVoto: 1,
        voto: 6,
        ammonizione: 1,
        espulsione: null,
        gol: 1,
        assist: 0,
        autogol: null,
        altriBonus: null,
        titolare: true,
        riserva: null,
        Giocatore: {
          idGiocatore: 100,
          nome: 'Mario Rossi',
          ruolo: 'D',
          Trasferimenti: [
            {
              SquadraSerieA: {
                nome: 'AC Milan',
                maglia: '7',
              },
            },
          ],
        },
      }
      const giocatoriInfluenti: GiocatoreInfluente[] = [
        {
          idVoto: 1,
          votoBonus: 2.5,
          isSostituito: false,
          isVotoInfluente: true,
        },
      ]

      const result = mapVotoToTabellinoEntry(voto, giocatoriInfluenti)

      expect(result.nome).toBe('Mario Rossi')
      expect(result.idGiocatore).toBe(100)
      expect(result.titolare).toBe(true)
      expect(result.riserva).toBeNull()
      expect(result.nomeSquadraSerieA).toBe('AC Milan')
      expect(result.magliaSquadraSerieA).toBe('7')
      expect(result.ruolo).toBe('D')
      expect(result.voto).toBe(6)
      expect(result.ammonizione).toBe(1)
      expect(result.espulsione).toBe(0)
      expect(result.gol).toBe(1)
      expect(result.assist).toBe(0)
      expect(result.autogol).toBe(0)
      expect(result.altriBonus).toBe(0)
      expect(result.votoBonus).toBe(2.5)
      expect(result.isSostituito).toBe(false)
      expect(result.isVotoInfluente).toBe(true)
    })

    it('should handle null voto fields as 0', () => {
      const voto: VotoFormazione = {
        idVoto: 2,
        voto: null,
        ammonizione: null,
        espulsione: null,
        gol: null,
        assist: null,
        autogol: null,
        altriBonus: null,
        titolare: false,
        riserva: 1,
        Giocatore: {
          idGiocatore: 101,
          nome: 'Luca Verdi',
          ruolo: 'A',
          Trasferimenti: [
            {
              SquadraSerieA: {
                nome: 'Inter',
                maglia: '10',
              },
            },
          ],
        },
      }
      const giocatoriInfluenti: GiocatoreInfluente[] = []

      const result = mapVotoToTabellinoEntry(voto, giocatoriInfluenti)

      expect(result.voto).toBe(0)
      expect(result.ammonizione).toBe(0)
      expect(result.espulsione).toBe(0)
      expect(result.gol).toBe(0)
      expect(result.assist).toBe(0)
      expect(result.autogol).toBe(0)
      expect(result.altriBonus).toBe(0)
    })

    it('should handle substitute player', () => {
      const voto: VotoFormazione = {
        idVoto: 3,
        voto: 5.5,
        ammonizione: 0,
        espulsione: null,
        gol: 0,
        assist: null,
        autogol: null,
        altriBonus: null,
        titolare: false,
        riserva: 2,
        Giocatore: {
          idGiocatore: 102,
          nome: 'Giovanni Bianchi',
          ruolo: 'C',
          Trasferimenti: [
            {
              SquadraSerieA: {
                nome: 'Juventus',
                maglia: '5',
              },
            },
          ],
        },
      }
      const giocatoriInfluenti: GiocatoreInfluente[] = [
        {
          idVoto: 3,
          votoBonus: 1,
          isSostituito: true,
          isVotoInfluente: false,
        },
      ]

      const result = mapVotoToTabellinoEntry(voto, giocatoriInfluenti)

      expect(result.titolare).toBe(false)
      expect(result.riserva).toBe(2)
      expect(result.isSostituito).toBe(true)
      expect(result.isVotoInfluente).toBe(false)
    })

    it('should handle giocatore without SquadraSerieA', () => {
      const voto: VotoFormazione = {
        idVoto: 4,
        voto: 6,
        ammonizione: 0,
        espulsione: null,
        gol: 0,
        assist: null,
        autogol: null,
        altriBonus: null,
        titolare: true,
        riserva: null,
        Giocatore: {
          idGiocatore: 103,
          nome: 'Paolo Gialli',
          ruolo: 'P',
          Trasferimenti: [
            {
              SquadraSerieA: null,
            },
          ],
        },
      }
      const giocatoriInfluenti: GiocatoreInfluente[] = []

      const result = mapVotoToTabellinoEntry(voto, giocatoriInfluenti)

      expect(result.nomeSquadraSerieA).toBeUndefined()
      expect(result.magliaSquadraSerieA).toBeUndefined()
    })

    it('should handle empty Trasferimenti array', () => {
      const voto: VotoFormazione = {
        idVoto: 5,
        voto: 6,
        ammonizione: 0,
        espulsione: null,
        gol: 0,
        assist: null,
        autogol: null,
        altriBonus: null,
        titolare: true,
        riserva: null,
        Giocatore: {
          idGiocatore: 104,
          nome: 'Antonio Neri',
          ruolo: 'D',
          Trasferimenti: [],
        },
      }
      const giocatoriInfluenti: GiocatoreInfluente[] = []

      const result = mapVotoToTabellinoEntry(voto, giocatoriInfluenti)

      expect(result.nomeSquadraSerieA).toBeUndefined()
      expect(result.magliaSquadraSerieA).toBeUndefined()
    })

    it('should use default votoBonus 0 if giocatore not found', () => {
      const voto: VotoFormazione = {
        idVoto: 6,
        voto: 7,
        ammonizione: 0,
        espulsione: null,
        gol: 1,
        assist: 1,
        autogol: null,
        altriBonus: null,
        titolare: true,
        riserva: null,
        Giocatore: {
          idGiocatore: 105,
          nome: 'Marco Rossi',
          ruolo: 'A',
          Trasferimenti: [
            {
              SquadraSerieA: {
                nome: 'Roma',
                maglia: '11',
              },
            },
          ],
        },
      }
      const giocatoriInfluenti: GiocatoreInfluente[] = []

      const result = mapVotoToTabellinoEntry(voto, giocatoriInfluenti)

      expect(result.votoBonus).toBe(0)
      expect(result.isSostituito).toBe(false)
      expect(result.isVotoInfluente).toBe(false)
    })

    it('should handle giocatore with all bonus stats', () => {
      const voto: VotoFormazione = {
        idVoto: 7,
        voto: 8,
        ammonizione: 1,
        espulsione: 0,
        gol: 2,
        assist: 1,
        autogol: 0,
        altriBonus: 4,
        titolare: true,
        riserva: null,
        Giocatore: {
          idGiocatore: 106,
          nome: 'Roberto Blu',
          ruolo: 'C',
          Trasferimenti: [
            {
              SquadraSerieA: {
                nome: 'Napoli',
                maglia: '20',
              },
            },
          ],
        },
      }
      const giocatoriInfluenti: GiocatoreInfluente[] = [
        {
          idVoto: 7,
          votoBonus: 3.5,
          isSostituito: false,
          isVotoInfluente: true,
        },
      ]

      const result = mapVotoToTabellinoEntry(voto, giocatoriInfluenti)

      expect(result.ammonizione).toBe(1)
      expect(result.gol).toBe(2)
      expect(result.assist).toBe(1)
      expect(result.altriBonus).toBe(4)
      expect(result.votoBonus).toBe(3.5)
    })
  })
})
