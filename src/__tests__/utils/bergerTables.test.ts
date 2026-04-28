import { describe, it, expect } from 'vitest'
import { RoundRobin8, RoundRobin4, Partita } from '~/utils/bergerTables'

describe('RoundRobin8', () => {
  it('generates exactly 28 matches (7 rounds × 4 matches)', () => {
    const result = RoundRobin8()
    expect(result).toHaveLength(28)
  })

  it('produces 7 distinct rounds', () => {
    const result = RoundRobin8()
    const rounds = new Set(result.map((p) => p.giornata))
    expect(rounds.size).toBe(7)
  })

  it('has exactly 4 matches per round', () => {
    const result = RoundRobin8()
    for (let g = 1; g <= 7; g++) {
      const matchesInRound = result.filter((p) => p.giornata === g)
      expect(matchesInRound).toHaveLength(4)
    }
  })

  it('each team appears exactly once per round', () => {
    const result = RoundRobin8()
    for (let g = 1; g <= 7; g++) {
      const matchesInRound = result.filter((p) => p.giornata === g)
      const teamsInRound = new Set<number>()
      matchesInRound.forEach((p) => {
        teamsInRound.add(p.squadraHome)
        teamsInRound.add(p.squadraAway)
      })
      expect(teamsInRound.size).toBe(8)
    }
  })

  it('returns Partita instances', () => {
    const result = RoundRobin8()
    result.forEach((p) => expect(p).toBeInstanceOf(Partita))
  })
})

describe('RoundRobin4', () => {
  it('generates exactly 6 matches (3 rounds × 2 matches)', () => {
    const result = RoundRobin4()
    expect(result).toHaveLength(6)
  })

  it('produces 3 distinct rounds', () => {
    const result = RoundRobin4()
    const rounds = new Set(result.map((p) => p.giornata))
    expect(rounds.size).toBe(3)
  })

  it('has exactly 2 matches per round', () => {
    const result = RoundRobin4()
    for (let g = 1; g <= 3; g++) {
      const matchesInRound = result.filter((p) => p.giornata === g)
      expect(matchesInRound).toHaveLength(2)
    }
  })

  it('each team appears exactly once per round', () => {
    const result = RoundRobin4()
    for (let g = 1; g <= 3; g++) {
      const matchesInRound = result.filter((p) => p.giornata === g)
      const teamsInRound = new Set<number>()
      matchesInRound.forEach((p) => {
        teamsInRound.add(p.squadraHome)
        teamsInRound.add(p.squadraAway)
      })
      expect(teamsInRound.size).toBe(4)
    }
  })
})

describe('Partita', () => {
  it('stores giornata, squadraHome and squadraAway', () => {
    const p = new Partita(1, 3, 7)
    expect(p.giornata).toBe(1)
    expect(p.squadraHome).toBe(3)
    expect(p.squadraAway).toBe(7)
  })
})
