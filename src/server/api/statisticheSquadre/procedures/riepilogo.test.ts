// Test caratterizzanti — FASE 3 pre-refactor
// Tests della logica di aggregazione statistiche in riepilogo
//
// TODO: After FASE 3 refactor, extract these pure functions:
// - initStats(idSquadra, squadra, foto) → SquadraStats
// - accumulate(stats, isHome, fantapunti, golF, golS, opponentName) → void
// - round2(n) → number
// - calculateStats(matches) → riepilogoOutput[]

import { describe, it, expect } from 'vitest'

interface SquadraStats {
  idSquadra: number
  squadra: string
  foto: string | null
  giocate: number
  vittorie: number
  pareggi: number
  sconfitte: number
  vittorieCasa: number
  giocateCasa: number
  vittorieTrasferta: number
  giocateTrasferta: number
  fantapuntiTot: number
  golFatti: number
  golSubiti: number
  cleanSheet: number
  partiteSenzaGol: number
  miglioreGiornata: number | null
  miglioreFantapunti: number | null
  peggioreGiornata: number | null
  peggioreFantapunti: number | null
  miglioreVittoriaScarto: number
  miglioreVittoriaLabel: string | null
  peggioreSconfittaScarto: number
  peggioreSconfittaLabel: string | null
}

const initStats = (
  idSquadra: number,
  squadra: string,
  foto: string | null,
): SquadraStats => ({
  idSquadra,
  squadra,
  foto,
  giocate: 0,
  vittorie: 0,
  pareggi: 0,
  sconfitte: 0,
  vittorieCasa: 0,
  giocateCasa: 0,
  vittorieTrasferta: 0,
  giocateTrasferta: 0,
  fantapuntiTot: 0,
  golFatti: 0,
  golSubiti: 0,
  cleanSheet: 0,
  partiteSenzaGol: 0,
  miglioreGiornata: null,
  miglioreFantapunti: null,
  peggioreGiornata: null,
  peggioreFantapunti: null,
  miglioreVittoriaScarto: -Infinity,
  miglioreVittoriaLabel: null,
  peggioreSconfittaScarto: Infinity,
  peggioreSconfittaLabel: null,
})

const round2 = (n: number) => Math.round(n * 100) / 100

/**
 * Caratterizza la logica di aggregazione statistiche nel riepilogo.
 *
 * Per ogni partita, la procedura accumula:
 * - giocate, vittorie, pareggi, sconfitte
 * - vittorie/giocate in casa vs trasferta
 * - fantapunti totali, gol fatti, gol subiti
 * - best/worst performance
 * - cleansheet, partite senza gol
 */
describe('riepilogo — Statistiche Aggregation', () => {
  describe('Init Stats', () => {
    it('should initialize empty stats for a team', () => {
      // arrange
      const idSquadra = 1
      const squadra = 'Test FC'
      const foto = 'foto.jpg'

      // act
      const stats = initStats(idSquadra, squadra, foto)

      // assert
      expect(stats.idSquadra).toBe(1)
      expect(stats.squadra).toBe('Test FC')
      expect(stats.foto).toBe('foto.jpg')
      expect(stats.giocate).toBe(0)
      expect(stats.vittorie).toBe(0)
      expect(stats.pareggi).toBe(0)
      expect(stats.sconfitte).toBe(0)
      expect(stats.fantapuntiTot).toBe(0)
      expect(stats.golFatti).toBe(0)
      expect(stats.golSubiti).toBe(0)
      expect(stats.cleanSheet).toBe(0)
      expect(stats.partiteSenzaGol).toBe(0)
      expect(stats.miglioreFantapunti).toBeNull()
      expect(stats.peggioreFantapunti).toBeNull()
      expect(stats.miglioreVittoriaScarto).toBe(-Infinity)
      expect(stats.peggioreSconfittaScarto).toBe(Infinity)
    })

    it('should handle foto=null', () => {
      // arrange
      const stats = initStats(2, 'Team Without Photo', null)

      // assert
      expect(stats.foto).toBeNull()
    })
  })

  describe('Accumulate - Vittoria (Win)', () => {
    it('should count vittoria and increment giocate', () => {
      // arrange
      const s = initStats(1, 'Home Team', null)
      const isHome = true
      const fantapunti = 75
      const golF = 3
      const golS = 1
      const opponentName = 'Away Team'

      // act: accumulate logic
      s.giocate += 1
      s.fantapuntiTot += fantapunti
      s.golFatti += golF
      s.golSubiti += golS
      if (isHome) s.giocateCasa += 1
      else s.giocateTrasferta += 1

      if (golF > golS) {
        s.vittorie += 1
        if (isHome) s.vittorieCasa += 1
        else s.vittorieTrasferta += 1
        const scarto = golF - golS
        if (scarto > s.miglioreVittoriaScarto) {
          s.miglioreVittoriaScarto = scarto
          s.miglioreVittoriaLabel = `${golF}-${golS} vs ${opponentName}`
        }
      }

      // assert
      expect(s.giocate).toBe(1)
      expect(s.vittorie).toBe(1)
      expect(s.giocateCasa).toBe(1)
      expect(s.vittorieCasa).toBe(1)
      expect(s.golFatti).toBe(3)
      expect(s.golSubiti).toBe(1)
      expect(s.fantapuntiTot).toBe(75)
      expect(s.miglioreVittoriaLabel).toBe('3-1 vs Away Team')
    })

    it('should count vittoria in trasferta (away)', () => {
      // arrange
      const s = initStats(1, 'Away Team', null)
      const isHome = false
      const fantapunti = 60
      const golF = 2
      const golS = 0
      const opponentName = 'Home Team'

      // act
      s.giocate += 1
      s.fantapuntiTot += fantapunti
      s.golFatti += golF
      s.golSubiti += golS
      if (isHome) s.giocateCasa += 1
      else s.giocateTrasferta += 1

      if (golF > golS) {
        s.vittorie += 1
        if (isHome) s.vittorieCasa += 1
        else s.vittorieTrasferta += 1
        const scarto = golF - golS
        if (scarto > s.miglioreVittoriaScarto) {
          s.miglioreVittoriaScarto = scarto
          s.miglioreVittoriaLabel = `${golF}-${golS} vs ${opponentName}`
        }
      }

      // assert
      expect(s.giocate).toBe(1)
      expect(s.vittorie).toBe(1)
      expect(s.giocateTrasferta).toBe(1)
      expect(s.vittorieCasa).toBe(0)
      expect(s.vittorieTrasferta).toBe(1)
      expect(s.golSubiti).toBe(0)
      expect(s.cleanSheet).toBe(0) // Not counting cleansheet in this test
    })
  })

  describe('Accumulate - Pareggio (Draw)', () => {
    it('should count pareggio', () => {
      // arrange
      const s = initStats(1, 'Test FC', null)
      const fantapunti = 40
      const golF = 1
      const golS = 1

      // act
      s.giocate += 1
      s.fantapuntiTot += fantapunti
      s.golFatti += golF
      s.golSubiti += golS
      s.giocateCasa += 1

      if (golF === golS) {
        s.pareggi += 1
      }

      // assert
      expect(s.pareggi).toBe(1)
      expect(s.giocate).toBe(1)
      expect(s.vittorie).toBe(0)
      expect(s.sconfitte).toBe(0)
    })
  })

  describe('Accumulate - Sconfitta (Loss)', () => {
    it('should count sconfitta', () => {
      // arrange
      const s = initStats(1, 'Test FC', null)
      const fantapunti = 25
      const golF = 0
      const golS = 2
      const opponentName = 'Winner Team'

      // act
      s.giocate += 1
      s.fantapuntiTot += fantapunti
      s.golFatti += golF
      s.golSubiti += golS
      s.giocateCasa += 1

      if (golF < golS) {
        s.sconfitte += 1
        const scarto = golF - golS
        if (scarto < s.peggioreSconfittaScarto) {
          s.peggioreSconfittaScarto = scarto
          s.peggioreSconfittaLabel = `${golF}-${golS} vs ${opponentName}`
        }
      }

      // assert
      expect(s.sconfitte).toBe(1)
      expect(s.giocate).toBe(1)
      expect(s.peggioreSconfittaLabel).toBe('0-2 vs Winner Team')
    })
  })

  describe('Best / Worst Performance Tracking', () => {
    it('should track miglioreFantapunti and miglioreGiornata', () => {
      // arrange
      const s = initStats(1, 'Test FC', null)
      const giornata = 5
      const fantapunti = 85

      // act
      if (s.miglioreFantapunti == null || fantapunti > s.miglioreFantapunti) {
        s.miglioreFantapunti = fantapunti
        s.miglioreGiornata = giornata
      }

      // assert
      expect(s.miglioreFantapunti).toBe(85)
      expect(s.miglioreGiornata).toBe(5)
    })

    it('should update miglioreFantapunti if new best is found', () => {
      // arrange
      const s = initStats(1, 'Test FC', null)
      s.miglioreFantapunti = 80
      s.miglioreGiornata = 3

      // act: new better performance
      const giornata = 7
      const fantapunti = 95
      if (s.miglioreFantapunti == null || fantapunti > s.miglioreFantapunti) {
        s.miglioreFantapunti = fantapunti
        s.miglioreGiornata = giornata
      }

      // assert
      expect(s.miglioreFantapunti).toBe(95)
      expect(s.miglioreGiornata).toBe(7)
    })

    it('should track peggioreFantapunti and peggioreGiornata', () => {
      // arrange
      const s = initStats(1, 'Test FC', null)
      const giornata = 4
      const fantapunti = 15

      // act
      if (s.peggioreFantapunti == null || fantapunti < s.peggioreFantapunti) {
        s.peggioreFantapunti = fantapunti
        s.peggioreGiornata = giornata
      }

      // assert
      expect(s.peggioreFantapunti).toBe(15)
      expect(s.peggioreGiornata).toBe(4)
    })

    it('should update peggioreFantapunti if new worse is found', () => {
      // arrange
      const s = initStats(1, 'Test FC', null)
      s.peggioreFantapunti = 25
      s.peggioreGiornata = 2

      // act: new worse performance
      const giornata = 6
      const fantapunti = 10
      if (s.peggioreFantapunti == null || fantapunti < s.peggioreFantapunti) {
        s.peggioreFantapunti = fantapunti
        s.peggioreGiornata = giornata
      }

      // assert
      expect(s.peggioreFantapunti).toBe(10)
      expect(s.peggioreGiornata).toBe(6)
    })
  })

  describe('Clean Sheet & Partite Senza Gol', () => {
    it('should count cleanSheet when golSubiti === 0', () => {
      // arrange
      const s = initStats(1, 'Test FC', null)

      // act
      const golS = 0
      if (golS === 0) s.cleanSheet += 1

      // assert
      expect(s.cleanSheet).toBe(1)
    })

    it('should count partiteSenzaGol when golFatti === 0', () => {
      // arrange
      const s = initStats(1, 'Test FC', null)

      // act
      const golF = 0
      if (golF === 0) s.partiteSenzaGol += 1

      // assert
      expect(s.partiteSenzaGol).toBe(1)
    })

    it('should have both cleanSheet and partiteSenzaGol when 0-0', () => {
      // arrange
      const s = initStats(1, 'Test FC', null)

      // act
      const golF = 0
      const golS = 0
      if (golF === 0) s.partiteSenzaGol += 1
      if (golS === 0) s.cleanSheet += 1

      // assert
      expect(s.cleanSheet).toBe(1)
      expect(s.partiteSenzaGol).toBe(1)
    })
  })

  describe('Rounding to 2 decimals', () => {
    it('should round media to 2 decimals', () => {
      // arrange
      const fantapuntiTot = 100
      const giocate = 3
      const mediaFantapunti = fantapuntiTot / giocate // 33.333...

      // act
      const rounded = round2(mediaFantapunti)

      // assert
      expect(rounded).toBe(33.33)
    })

    it('should handle rounding edge cases', () => {
      // arrange
      const values = [10.5, 10.55, 10.555, 10.556, 10.999]

      // act
      const rounded = values.map((v) => round2(v))

      // assert
      expect(rounded[0]).toBe(10.5)
      expect(rounded[1]).toBe(10.55)
      expect(rounded[2]).toBe(10.56) // rounds up
      expect(rounded[3]).toBe(10.56)
      expect(rounded[4]).toBe(11.0)
    })

    it('should preserve integer values', () => {
      // arrange
      const value = 50

      // act
      const rounded = round2(value)

      // assert
      expect(rounded).toBe(50)
    })
  })

  describe('Percentuale Vittorie', () => {
    it('should calculate percentage in casa correctly', () => {
      // arrange
      const vittorieCasa = 5
      const giocateCasa = 10

      // act
      const percVittorieCasa = round2((vittorieCasa / giocateCasa) * 100)

      // assert
      expect(percVittorieCasa).toBe(50)
    })

    it('should calculate percentage trasferta correctly', () => {
      // arrange
      const vittorieTrasferta = 2
      const giocateTrasferta = 8

      // act
      const percVittorieTrasferta = round2(
        (vittorieTrasferta / giocateTrasferta) * 100
      )

      // assert
      expect(percVittorieTrasferta).toBe(25)
    })

    it('should return 0 if no games played', () => {
      // arrange
      const vittorieCasa = 0
      const giocateCasa = 0

      // act
      const percVittorieCasa =
        giocateCasa > 0 ? round2((vittorieCasa / giocateCasa) * 100) : 0

      // assert
      expect(percVittorieCasa).toBe(0)
    })
  })

  describe('Multiple Matches Accumulation', () => {
    it('should accumulate stats across multiple matches', () => {
      // arrange
      const s = initStats(1, 'Test FC', null)

      // act: match 1 - win 3-1
      s.giocate += 1
      s.vittorie += 1
      s.giocateCasa += 1
      s.vittorieCasa += 1
      s.golFatti += 3
      s.golSubiti += 1
      s.fantapuntiTot += 75

      // match 2 - draw 1-1
      s.giocate += 1
      s.pareggi += 1
      s.giocateTrasferta += 1
      s.golFatti += 1
      s.golSubiti += 1
      s.fantapuntiTot += 40
      s.cleanSheet += 0 // no cleansheet
      s.partiteSenzaGol += 0 // no 0-0

      // match 3 - loss 0-2
      s.giocate += 1
      s.sconfitte += 1
      s.giocateCasa += 1
      s.golFatti += 0
      s.golSubiti += 2
      s.fantapuntiTot += 15

      // assert
      expect(s.giocate).toBe(3)
      expect(s.vittorie).toBe(1)
      expect(s.pareggi).toBe(1)
      expect(s.sconfitte).toBe(1)
      expect(s.golFatti).toBe(4)
      expect(s.golSubiti).toBe(4)
      expect(s.fantapuntiTot).toBe(130)
      const mediaFantapunti = round2(s.fantapuntiTot / s.giocate)
      expect(mediaFantapunti).toBe(43.33)
    })
  })

  describe('Filter non-played teams', () => {
    it('should exclude teams with 0 matches from output', () => {
      // arrange
      const teams = [
        initStats(1, 'Active Team', null),
        initStats(2, 'Inactive Team', null),
      ]
      teams[0].giocate = 5 // has played
      teams[1].giocate = 0 // has not played

      // act
      const filtered = teams.filter((t) => t.giocate > 0)

      // assert
      expect(filtered.length).toBe(1)
      expect(filtered[0].squadra).toBe('Active Team')
    })
  })

  describe('Sorting by media fantapunti', () => {
    it('should sort teams by mediaFantapunti descending', () => {
      // arrange
      const teams = [
        {
          squadra: 'Team A',
          mediaFantapunti: 40,
        },
        {
          squadra: 'Team B',
          mediaFantapunti: 55,
        },
        {
          squadra: 'Team C',
          mediaFantapunti: 35,
        },
      ]

      // act
      const sorted = teams.sort((a, b) => b.mediaFantapunti - a.mediaFantapunti)

      // assert
      expect(sorted[0].squadra).toBe('Team B')
      expect(sorted[1].squadra).toBe('Team A')
      expect(sorted[2].squadra).toBe('Team C')
    })
  })
})
