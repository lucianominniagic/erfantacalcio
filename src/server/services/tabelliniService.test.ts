import { describe, it, expect } from 'vitest'
import {
  mapVotoToTabellinoEntry,
  calcolaFantapunti,
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

describe('calcolaFantapunti', () => {
  const makeGiocatore = (
    isVotoInfluente: boolean,
    votoBonus: number | null = 6,
  ): GiocatoreInfluente => ({
    idVoto: Math.random(),
    votoBonus,
    isSostituito: false,
    isVotoInfluente,
  })

  it('should return all zeros for empty array', () => {
    const result = calcolaFantapunti([], '4-3-3', false)

    expect(result.fantapuntiBase).toBe(0)
    expect(result.fantapuntiTotale).toBe(0)
    expect(result.bonusModulo).toBe(0)
    expect(result.bonusSenzaVoto).toBe(0)
    expect(result.fattoreCasalingo).toBe(0)
    expect(result.golSegnati).toBe(0)
    expect(result.giocatoriInfluentiCount).toBe(0)
  })

  it('should guard on fantapuntiBase = 0 (all non-influenti)', () => {
    const giocatori = [
      makeGiocatore(false, 6),
      makeGiocatore(false, 7),
    ]

    const result = calcolaFantapunti(giocatori, '4-3-3', false)

    expect(result.fantapuntiBase).toBe(0)
    expect(result.fantapuntiTotale).toBe(0)
    expect(result.bonusModulo).toBe(0)
    expect(result.bonusSenzaVoto).toBe(0)
    expect(result.fattoreCasalingo).toBe(0)
    expect(result.golSegnati).toBe(0)
  })

  it('should guard on fantapuntiBase = 0 (influenti with null votoBonus)', () => {
    const giocatori = [
      makeGiocatore(true, null),
      makeGiocatore(true, null),
    ]

    const result = calcolaFantapunti(giocatori, '4-3-3', true)

    expect(result.fantapuntiBase).toBe(0)
    expect(result.fantapuntiTotale).toBe(0)
  })

  it('should calculate fantapuntiBase as sum of votoBonus for influenti only', () => {
    const giocatori = [
      makeGiocatore(true, 6),
      makeGiocatore(true, 7),
      makeGiocatore(true, 8),
      makeGiocatore(false, 10), // non-influente, should be ignored
    ]

    const result = calcolaFantapunti(giocatori, '4-3-3', false)

    expect(result.fantapuntiBase).toBe(21) // 6 + 7 + 8
    expect(result.giocatoriInfluentiCount).toBe(3)
  })

  it('should apply bonusModulo correctly (4-3-3 = -1)', () => {
    const giocatori = [makeGiocatore(true, 20)]

    const result = calcolaFantapunti(giocatori, '4-3-3', false)

    expect(result.bonusModulo).toBe(-1)
    expect(result.fantapuntiTotale).toBe(28) // 20 + bonusModulo(-1) + bonusSenzaVoto(1)=9 + 0 = 28
  })

  it('should apply bonusModulo correctly (5-4-1 = 1.5)', () => {
    const giocatori = [makeGiocatore(true, 30)]

    const result = calcolaFantapunti(giocatori, '5-4-1', false)

    expect(result.bonusModulo).toBe(1.5)
    expect(result.fantapuntiTotale).toBe(40.5) // 30 + bonusModulo(1.5) + bonusSenzaVoto(1)=9 + 0 = 40.5
  })

  it('should calculate bonusSenzaVoto (11 influenti = 0 riserve)', () => {
    const giocatori = Array.from({ length: 11 }, () => makeGiocatore(true, 5))

    const result = calcolaFantapunti(giocatori, '4-3-3', false)

    expect(result.bonusSenzaVoto).toBe(0)
  })

  it('should calculate bonusSenzaVoto (9 influenti = 2 riserve)', () => {
    const giocatori = Array.from({ length: 9 }, () => makeGiocatore(true, 5))

    const result = calcolaFantapunti(giocatori, '4-3-3', false)

    expect(result.bonusSenzaVoto).toBe(2) // (11 - 9) * 1 = 2
  })

  it('should cap bonusSenzaVoto at maxSostituzioni (6)', () => {
    const giocatori = Array.from({ length: 5 }, () => makeGiocatore(true, 5))

    const result = calcolaFantapunti(giocatori, '4-3-3', false)

    expect(result.bonusSenzaVoto).toBe(6) // min(11 - 5, 9) * 1 = min(6, 9) * 1 = 6
  })

  it('should apply fattoreCasalingo when true', () => {
    const giocatori = [makeGiocatore(true, 20)]

    const result = calcolaFantapunti(giocatori, '4-3-3', true)

    expect(result.fattoreCasalingo).toBe(1)
    expect(result.fantapuntiTotale).toBe(29) // 20 + bonusModulo(-1) + bonusSenzaVoto(1)=9 + fattore(1) = 29
  })

  it('should not apply fattoreCasalingo when false', () => {
    const giocatori = [makeGiocatore(true, 20)]

    const result = calcolaFantapunti(giocatori, '4-3-3', false)

    expect(result.fattoreCasalingo).toBe(0)
    expect(result.fantapuntiTotale).toBe(28) // 20 + bonusModulo(-1) + bonusSenzaVoto(1)=9 + 0 = 28
  })

  it('should calculate fantapuntiTotale correctly (full formula)', () => {
    const giocatori = [
      makeGiocatore(true, 20),
      makeGiocatore(true, 15),
    ]

    const result = calcolaFantapunti(giocatori, '5-4-1', true)

    // fantapuntiBase = 20 + 15 = 35
    // bonusModulo(5-4-1) = 1.5
    // bonusSenzaVoto(2) = (11 - 2) * 1 = 9
    // fattoreCasalingo = 1
    // total = 35 + 1.5 + 9 + 1 = 46.5
    expect(result.fantapuntiBase).toBe(35)
    expect(result.bonusModulo).toBe(1.5)
    expect(result.bonusSenzaVoto).toBe(9)
    expect(result.fattoreCasalingo).toBe(1)
    expect(result.fantapuntiTotale).toBe(46.5)
  })

  it('should calculate golSegnati = 0 for totale < 66', () => {
    const giocatori = [makeGiocatore(true, 50)]

    const result = calcolaFantapunti(giocatori, '4-3-3', false)

    expect(result.fantapuntiTotale).toBeLessThan(66)
    expect(result.golSegnati).toBe(0)
  })

  it('should calculate golSegnati = 1 for totale = 66', () => {
    const giocatori = [makeGiocatore(true, 58)]

    const result = calcolaFantapunti(giocatori, '4-3-3', false)

    // 58 + bonusModulo('4-3-3')=-1 + bonusSenzaVoto(1)=9 + 0 = 66
    expect(result.fantapuntiTotale).toBe(66)
    expect(result.golSegnati).toBe(1)
  })

  it('should calculate golSegnati = 2 for totale = 72', () => {
    const giocatori = [makeGiocatore(true, 64)]

    const result = calcolaFantapunti(giocatori, '4-3-3', false)

    // 64 + bonusModulo('4-3-3')=-1 + bonusSenzaVoto(1)=9 + 0 = 72
    expect(result.fantapuntiTotale).toBe(72)
    expect(result.golSegnati).toBe(2)
  })

  it('should count giocatoriInfluentiCount correctly', () => {
    const giocatori = [
      makeGiocatore(true, 5),
      makeGiocatore(false, 5),
      makeGiocatore(true, 6),
      makeGiocatore(false, 7),
      makeGiocatore(true, 8),
    ]

    const result = calcolaFantapunti(giocatori, '4-3-3', false)

    expect(result.giocatoriInfluentiCount).toBe(3)
  })

  it('should handle mixed null and non-null votoBonus', () => {
    const giocatori = [
      makeGiocatore(true, 10),
      makeGiocatore(true, null),
      makeGiocatore(true, 8),
    ]

    const result = calcolaFantapunti(giocatori, '4-4-2', false)

    expect(result.fantapuntiBase).toBe(18) // 10 + 0 + 8
    expect(result.bonusModulo).toBe(0)
    expect(result.fantapuntiTotale).toBe(26) // 18 + bonusModulo('4-4-2')=0 + bonusSenzaVoto(3)=8 + 0 = 26
  })
})

})


