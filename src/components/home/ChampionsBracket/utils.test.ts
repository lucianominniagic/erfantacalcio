import { describe, it, expect } from 'vitest'
import { findRitorno, resolveRitornoGoals, hasTeams } from './utils'
import { PartitaType } from './types'

/**
 * Minimal PartitaType fixture factory.
 */
function makePartita(overrides: Partial<PartitaType> = {}): PartitaType {
  return {
    idPartita: 1,
    idHome: null,
    squadraHome: null,
    fotoHome: null,
    magliaHome: null,
    multaHome: false,
    golHome: null,
    idAway: null,
    squadraAway: null,
    fotoAway: null,
    magliaAway: null,
    multaAway: false,
    golAway: null,
    isFattoreHome: false,
    ...overrides,
  }
}

describe('findRitorno', () => {
  it('returns undefined when ritornoPartite is undefined', () => {
    const andata = makePartita({ idHome: 1, idAway: 2 })
    const result = findRitorno(andata, undefined)
    expect(result).toBeUndefined()
  })

  it('returns undefined when no match found', () => {
    const andata = makePartita({ idHome: 1, idAway: 2 })
    const ritornoPartite = [
      makePartita({ idHome: 3, idAway: 4 }),
      makePartita({ idHome: 5, idAway: 6 }),
    ]
    const result = findRitorno(andata, ritornoPartite)
    expect(result).toBeUndefined()
  })

  it('finds match when same home/away assignment (Team A home in both legs)', () => {
    const andata = makePartita({
      idPartita: 1,
      idHome: 1,
      idAway: 2,
      golHome: 3,
      golAway: 1,
    })
    const ritorno = makePartita({
      idPartita: 2,
      idHome: 1,
      idAway: 2,
      golHome: 2,
      golAway: 1,
    })
    const ritornoPartite = [ritorno]
    const result = findRitorno(andata, ritornoPartite)
    expect(result).toEqual(ritorno)
  })

  it('finds match when teams are swapped (Team A home in andata, away in ritorno)', () => {
    const andata = makePartita({
      idPartita: 1,
      idHome: 1,
      idAway: 2,
      golHome: 3,
      golAway: 1,
    })
    const ritorno = makePartita({
      idPartita: 2,
      idHome: 2,
      idAway: 1,
      golHome: 1,
      golAway: 4,
    })
    const ritornoPartite = [ritorno]
    const result = findRitorno(andata, ritornoPartite)
    expect(result).toEqual(ritorno)
  })

  it('does NOT match a different pair (SF2 ritorno when looking for SF1)', () => {
    const sf1Andata = makePartita({
      idPartita: 1,
      idHome: 1,
      idAway: 2,
    })
    const sf2Ritorno = makePartita({
      idPartita: 4,
      idHome: 3,
      idAway: 4,
    })
    const ritornoPartite = [sf2Ritorno]
    const result = findRitorno(sf1Andata, ritornoPartite)
    expect(result).toBeUndefined()
  })

  it('correctly separates SF1 and SF2 when both are in the same array', () => {
    const sf1Andata = makePartita({
      idPartita: 1,
      idHome: 1,
      idAway: 2,
    })
    const sf2Andata = makePartita({
      idPartita: 2,
      idHome: 3,
      idAway: 4,
    })

    const sf1Ritorno = makePartita({
      idPartita: 3,
      idHome: 2,
      idAway: 1,
    })
    const sf2Ritorno = makePartita({
      idPartita: 4,
      idHome: 4,
      idAway: 3,
    })

    const ritornoPartite = [sf2Ritorno, sf1Ritorno]

    const resultSF1 = findRitorno(sf1Andata, ritornoPartite)
    const resultSF2 = findRitorno(sf2Andata, ritornoPartite)

    expect(resultSF1).toEqual(sf1Ritorno)
    expect(resultSF2).toEqual(sf2Ritorno)
  })
})

describe('resolveRitornoGoals', () => {
  it('returns { aGol2P: null, bGol2P: null } when ritornoP is undefined', () => {
    const andata = makePartita({ idHome: 1, idAway: 2 })
    const result = resolveRitornoGoals(andata, undefined)
    expect(result).toEqual({ aGol2P: null, bGol2P: null })
  })

  it('correctly resolves when Team A is home in BOTH legs', () => {
    const andata = makePartita({
      idHome: 1,
      idAway: 2,
      golHome: 3,
      golAway: 1,
    })
    const ritorno = makePartita({
      idHome: 1,
      idAway: 2,
      golHome: 2,
      golAway: 1,
    })
    const result = resolveRitornoGoals(andata, ritorno)
    expect(result).toEqual({ aGol2P: 2, bGol2P: 1 })
  })

  it('correctly resolves when Team A is home in andata, AWAY in ritorno (swapped)', () => {
    const andata = makePartita({
      idHome: 1,
      idAway: 2,
      golHome: 3,
      golAway: 1,
    })
    const ritorno = makePartita({
      idHome: 2,
      idAway: 1,
      golHome: 1,
      golAway: 4,
    })
    const result = resolveRitornoGoals(andata, ritorno)
    expect(result).toEqual({ aGol2P: 4, bGol2P: 1 })
  })

  it('returns null values when goals are null (match not yet played)', () => {
    const andata = makePartita({
      idHome: 1,
      idAway: 2,
      golHome: 3,
      golAway: 1,
    })
    const ritorno = makePartita({
      idHome: 1,
      idAway: 2,
      golHome: null,
      golAway: null,
    })
    const result = resolveRitornoGoals(andata, ritorno)
    expect(result).toEqual({ aGol2P: null, bGol2P: null })
  })

  it('integration: SF1 Andata 3-3, SF1 Ritorno 1-4 (swapped) → Team A wins 7-4', () => {
    const sf1Andata = makePartita({
      idPartita: 1,
      idHome: 1,
      idAway: 2,
      golHome: 3,
      golAway: 3,
    })
    const sf1Ritorno = makePartita({
      idPartita: 2,
      idHome: 2,
      idAway: 1,
      golHome: 1,
      golAway: 4,
    })

    const ritornoGoals = resolveRitornoGoals(sf1Andata, sf1Ritorno)

    const sf1AGolAggregate = (sf1Andata.golHome ?? 0) + (ritornoGoals.aGol2P ?? 0)
    const sf1BGolAggregate = (sf1Andata.golAway ?? 0) + (ritornoGoals.bGol2P ?? 0)

    expect(sf1AGolAggregate).toBe(7)
    expect(sf1BGolAggregate).toBe(4)
    expect(sf1AGolAggregate > sf1BGolAggregate).toBe(true)
  })

  it('integration: SF1 Andata 3-3, SF1 Ritorno 2-1 (same assignment) → Team A wins 5-4', () => {
    const sf1Andata = makePartita({
      idPartita: 1,
      idHome: 1,
      idAway: 2,
      golHome: 3,
      golAway: 3,
    })
    const sf1Ritorno = makePartita({
      idPartita: 2,
      idHome: 1,
      idAway: 2,
      golHome: 2,
      golAway: 1,
    })

    const ritornoGoals = resolveRitornoGoals(sf1Andata, sf1Ritorno)

    const sf1AGolAggregate = (sf1Andata.golHome ?? 0) + (ritornoGoals.aGol2P ?? 0)
    const sf1BGolAggregate = (sf1Andata.golAway ?? 0) + (ritornoGoals.bGol2P ?? 0)

    expect(sf1AGolAggregate).toBe(5)
    expect(sf1BGolAggregate).toBe(4)
    expect(sf1AGolAggregate > sf1BGolAggregate).toBe(true)
  })
})

describe('hasTeams', () => {
  it('returns false for empty array', () => {
    const result = hasTeams([])
    expect(result).toBe(false)
  })

  it('returns false when all partite have idHome: null, idAway: null', () => {
    const partite = [
      makePartita({ idHome: null, idAway: null }),
      makePartita({ idHome: null, idAway: null }),
    ]
    const result = hasTeams(partite)
    expect(result).toBe(false)
  })

  it('returns true when at least one partita has idHome not null', () => {
    const partite = [
      makePartita({ idHome: null, idAway: null }),
      makePartita({ idHome: 1, idAway: null }),
    ]
    const result = hasTeams(partite)
    expect(result).toBe(true)
  })

  it('returns true when at least one partita has idAway not null', () => {
    const partite = [
      makePartita({ idHome: null, idAway: null }),
      makePartita({ idHome: null, idAway: 2 }),
    ]
    const result = hasTeams(partite)
    expect(result).toBe(true)
  })

  it('returns true when first partita has both teams assigned', () => {
    const partite = [
      makePartita({ idHome: 1, idAway: 2 }),
      makePartita({ idHome: null, idAway: null }),
    ]
    const result = hasTeams(partite)
    expect(result).toBe(true)
  })

  it('returns true when last partita has one team assigned', () => {
    const partite = [
      makePartita({ idHome: null, idAway: null }),
      makePartita({ idHome: null, idAway: null }),
      makePartita({ idHome: 3, idAway: null }),
    ]
    const result = hasTeams(partite)
    expect(result).toBe(true)
  })
})
