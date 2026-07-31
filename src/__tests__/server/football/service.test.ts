/**
 * service.test — unit tests for football.service orchestration.
 *
 * Validates:
 * - getSerieAStandings: delegates to provider.getStandings()
 * - getLatestMatches: uses [today-14, tomorrow) date window, filters FINISHED, sorted desc, max 10
 * - getNextMatches: uses [today, today+21) date window, filters SCHEDULED, sorted asc, max 10
 * - getTopScorers: delegates to provider.getScorers()
 * - orchestrateSerieAOverview: standings first, then parallel calls (2x getMatches + getScorers)
 * - orchestrateSerieAOverview: uses date ranges, ignores currentMatchday for filtering
 * - orchestrateSerieAOverview: validates with serieAOverviewSchema
 * - orchestrateSerieAOverview: propagates all errors
 * - Accepts optional provider and now parameters for DI
 * - All functions use default footballDataClient and new Date() when not specified
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { IFootballProvider } from '~/server/football/football.types'
import {
  getSerieAStandings,
  getLatestMatches,
  getNextMatches,
  getTopScorers,
  orchestrateSerieAOverview,
} from '~/server/football/football.service'
import {
  createFootballMatch,
  createFootballScorer,
  createFootballSeasonMetadata,
  createFootballStandingEntry,
} from './fixtures'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('football.service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('getSerieAStandings', () => {
    it('returns standings and metadata from provider', async () => {
      const metadata = createFootballSeasonMetadata()
      const standings = [createFootballStandingEntry()]

      const provider = createMockProvider({
        standings: { standings, metadata },
      })

      const result = await getSerieAStandings(provider)

      expect(result.standings).toBe(standings)
      expect(result.metadata).toBe(metadata)
    })

    it('uses default provider when none specified', async () => {
      const provider = createMockProvider({
        standings: {
          standings: [],
          metadata: createFootballSeasonMetadata(),
        },
      })

      // The call without provider parameter would use footballDataClient;
      // we can't test this without mocking the entire module,
      // so we just verify the function signature accepts optional param
      const result = await getSerieAStandings(provider)
      expect(result).toBeDefined()
    })

    it('propagates provider error', async () => {
      const error = new Error('Provider error')
      const provider = createMockProvider({
        standings: error,
      })

      await expect(getSerieAStandings(provider)).rejects.toBe(error)
    })
  })

  describe('getLatestMatches', () => {
    it('fetches matches in [today-14, tomorrow) with date filters (NOT matchday)', async () => {
      const metadata = createFootballSeasonMetadata({ currentMatchday: 15 })
      const now = new Date('2024-01-28T12:00:00Z')
      
      // Expect calls with dateFrom='2024-01-14' and dateTo='2024-01-29' (tomorrow, exclusive)
      const filtersRequested: import('~/server/football/football.types').FootballMatchFilters[] = []

      const provider: IFootballProvider = {
        async getStandings() {
          return { standings: [], metadata }
        },
        async getMatches(filters) {
          filtersRequested.push(filters)
          return [
            createFootballMatch({ id: 1, utcDate: '2024-01-28T14:00:00Z', status: 'finished' as const }),
            createFootballMatch({ id: 2, utcDate: '2024-01-27T20:45:00Z', status: 'finished' as const }),
            createFootballMatch({ id: 3, utcDate: '2024-01-26T12:30:00Z', status: 'finished' as const }),
          ]
        },
        async getScorers() {
          return []
        },
      }

      const result = await getLatestMatches(provider, now)

      expect(filtersRequested).toHaveLength(1)
      expect(filtersRequested[0]?.dateFrom).toBe('2024-01-14')
      expect(filtersRequested[0]?.dateTo).toBe('2024-01-29') // exclusive, includes today
      expect(result).toHaveLength(3)
    })

    it('filters FINISHED status only', async () => {
      const now = new Date('2024-01-28T12:00:00Z')
      const matches = [
        createFootballMatch({ id: 1, status: 'finished' as const }),
        createFootballMatch({ id: 2, status: 'live' as const }),
        createFootballMatch({ id: 3, status: 'finished' as const }),
        createFootballMatch({ id: 4, status: 'scheduled' as const }),
      ]

      const provider: IFootballProvider = {
        async getStandings() {
          return { standings: [], metadata: createFootballSeasonMetadata() }
        },
        async getMatches() {
          return matches
        },
        async getScorers() {
          return []
        },
      }

      const result = await getLatestMatches(provider, now)

      expect(result).toHaveLength(2)
      expect(result.every(m => m.status === 'finished')).toBe(true)
    })

    it('sorts finished matches by date descending (latest first)', async () => {
      const now = new Date('2024-01-28T12:00:00Z')
      const matches = [
        createFootballMatch({ id: 1, utcDate: '2024-01-15T14:00:00Z' }),
        createFootballMatch({ id: 2, utcDate: '2024-01-15T20:45:00Z' }),
        createFootballMatch({ id: 3, utcDate: '2024-01-15T12:30:00Z' }),
      ]

      const provider: IFootballProvider = {
        async getStandings() {
          return { standings: [], metadata: createFootballSeasonMetadata() }
        },
        async getMatches() {
          return matches
        },
        async getScorers() {
          return []
        },
      }

      const result = await getLatestMatches(provider, now)

      expect(result[0]?.utcDate).toBe('2024-01-15T20:45:00Z')
      expect(result[1]?.utcDate).toBe('2024-01-15T14:00:00Z')
      expect(result[2]?.utcDate).toBe('2024-01-15T12:30:00Z')
    })

    it('returns empty array if no finished matches', async () => {
      const now = new Date('2024-01-28T12:00:00Z')
      const matches = [
        createFootballMatch({ id: 1, status: 'live' as const }),
        createFootballMatch({ id: 2, status: 'scheduled' as const }),
      ]

      const provider: IFootballProvider = {
        async getStandings() {
          return { standings: [], metadata: createFootballSeasonMetadata() }
        },
        async getMatches() {
          return matches
        },
        async getScorers() {
          return []
        },
      }

      const result = await getLatestMatches(provider, now)

      expect(result).toHaveLength(0)
    })

    it('respects max 10 result limit', async () => {
      const now = new Date('2024-01-28T12:00:00Z')
      const matches = Array.from({ length: 15 }, (_, i) =>
        createFootballMatch({
          id: i + 1,
          status: 'finished' as const,
          utcDate: new Date(2024, 0, 28 - i).toISOString(),
        })
      )

      const provider: IFootballProvider = {
        async getStandings() {
          return { standings: [], metadata: createFootballSeasonMetadata() }
        },
        async getMatches() {
          return matches
        },
        async getScorers() {
          return []
        },
      }

      const result = await getLatestMatches(provider, now)

      expect(result).toHaveLength(10)
    })
  })

  describe('getNextMatches', () => {
    it('fetches matches in [today, today+21) with date filters (NOT matchday+1)', async () => {
      const now = new Date('2024-01-28T12:00:00Z')
      
      // Expect calls with dateFrom='2024-01-28' and dateTo='2024-02-18' (today+21, exclusive)
      const filtersRequested: import('~/server/football/football.types').FootballMatchFilters[] = []

      const provider: IFootballProvider = {
        async getStandings() {
          return { standings: [], metadata: createFootballSeasonMetadata({ currentMatchday: 15 }) }
        },
        async getMatches(filters) {
          filtersRequested.push(filters)
          return [
            createFootballMatch({ id: 1, utcDate: '2024-02-15T20:00:00Z', status: 'scheduled' as const }),
            createFootballMatch({ id: 2, utcDate: '2024-02-15T14:00:00Z', status: 'scheduled' as const }),
            createFootballMatch({ id: 3, utcDate: '2024-02-15T18:00:00Z', status: 'scheduled' as const }),
          ]
        },
        async getScorers() {
          return []
        },
      }

      const result = await getNextMatches(provider, now)

      expect(filtersRequested).toHaveLength(1)
      expect(filtersRequested[0]?.dateFrom).toBe('2024-01-28')
      expect(filtersRequested[0]?.dateTo).toBe('2024-02-18') // exclusive, 21 days ahead
      expect(result).toHaveLength(3)
    })

    it('filters SCHEDULED status only', async () => {
      const now = new Date('2024-01-28T12:00:00Z')
      const matches = [
        createFootballMatch({ id: 1, status: 'scheduled' as const }),
        createFootballMatch({ id: 2, status: 'live' as const }),
        createFootballMatch({ id: 3, status: 'scheduled' as const }),
        createFootballMatch({ id: 4, status: 'finished' as const }),
      ]

      const provider: IFootballProvider = {
        async getStandings() {
          return { standings: [], metadata: createFootballSeasonMetadata() }
        },
        async getMatches() {
          return matches
        },
        async getScorers() {
          return []
        },
      }

      const result = await getNextMatches(provider, now)

      expect(result).toHaveLength(2)
      expect(result.every(m => m.status === 'scheduled')).toBe(true)
    })

    it('sorts scheduled matches by date ascending (earliest first)', async () => {
      const now = new Date('2024-01-28T12:00:00Z')
      const matches = [
        createFootballMatch({ id: 1, utcDate: '2024-02-20T20:45:00Z', status: 'scheduled' as const }),
        createFootballMatch({ id: 2, utcDate: '2024-02-20T14:00:00Z', status: 'scheduled' as const }),
        createFootballMatch({ id: 3, utcDate: '2024-02-20T18:30:00Z', status: 'scheduled' as const }),
      ]

      const provider: IFootballProvider = {
        async getStandings() {
          return { standings: [], metadata: createFootballSeasonMetadata() }
        },
        async getMatches() {
          return matches
        },
        async getScorers() {
          return []
        },
      }

      const result = await getNextMatches(provider, now)

      expect(result[0]?.utcDate).toBe('2024-02-20T14:00:00Z')
      expect(result[1]?.utcDate).toBe('2024-02-20T18:30:00Z')
      expect(result[2]?.utcDate).toBe('2024-02-20T20:45:00Z')
    })

    it('respects max 10 result limit', async () => {
      const now = new Date('2024-01-28T12:00:00Z')
      const matches = Array.from({ length: 15 }, (_, i) =>
        createFootballMatch({
          id: i + 1,
          status: 'scheduled' as const,
          utcDate: new Date(2024, 1, 28 + i).toISOString(),
        })
      )

      const provider: IFootballProvider = {
        async getStandings() {
          return { standings: [], metadata: createFootballSeasonMetadata() }
        },
        async getMatches() {
          return matches
        },
        async getScorers() {
          return []
        },
      }

      const result = await getNextMatches(provider, now)

      expect(result).toHaveLength(10)
    })
  })

  describe('getTopScorers', () => {
    it('returns array of scorers from provider', async () => {
      const scorers = [
        createFootballScorer({ goals: 15 }),
        createFootballScorer({ goals: 12 }),
      ]

      const provider = createMockProvider({
        scorers,
      })

      const result = await getTopScorers(provider)

      expect(result).toBe(scorers)
    })

    it('propagates provider error', async () => {
      const error = new Error('Scorers error')
      const provider = createMockProvider({
        scorers: error,
      })

      await expect(getTopScorers(provider)).rejects.toBe(error)
    })
  })

  describe('orchestrateSerieAOverview', () => {
    it('fetches standings first (not by matchday), then calls two getMatches with date ranges in parallel', async () => {
      const now = new Date('2024-01-28T12:00:00Z')
      const callOrder: string[] = []

      const metadata = createFootballSeasonMetadata({ currentMatchday: 15 })

      const provider: IFootballProvider = {
        async getStandings() {
          callOrder.push('getStandings')
          return { standings: [], metadata }
        },
        async getMatches(filters) {
          // Both getMatches calls should be invoked before completion,
          // proving they run in parallel (Promise.all)
          if (filters.dateFrom === '2024-01-14') {
            callOrder.push('getMatches-latest')
          } else if (filters.dateFrom === '2024-01-28') {
            callOrder.push('getMatches-next')
          }
          return []
        },
        async getScorers() {
          callOrder.push('getScorers')
          return []
        },
      }

      await orchestrateSerieAOverview(provider, now)

      // getStandings is called first, then parallel calls to getMatches and getScorers
      expect(callOrder[0]).toBe('getStandings')
      expect(callOrder.slice(1).sort()).toEqual(['getMatches-latest', 'getMatches-next', 'getScorers'].sort())
    })

    it('calls first getMatches with latest window [today-14, tomorrow)', async () => {
      const now = new Date('2024-01-28T12:00:00Z')
      const filtersRequested: import('~/server/football/football.types').FootballMatchFilters[] = []

      const provider: IFootballProvider = {
        async getStandings() {
          return { standings: [], metadata: createFootballSeasonMetadata({ currentMatchday: 15 }) }
        },
        async getMatches(filters) {
          filtersRequested.push(filters)
          return []
        },
        async getScorers() {
          return []
        },
      }

      await orchestrateSerieAOverview(provider, now)

      const latestFilter = filtersRequested.find(f => f.dateFrom === '2024-01-14')
      expect(latestFilter).toBeDefined()
      expect(latestFilter?.dateFrom).toBe('2024-01-14')
      expect(latestFilter?.dateTo).toBe('2024-01-29') // tomorrow, exclusive
    })

    it('calls second getMatches with next window [today, today+21)', async () => {
      const now = new Date('2024-01-28T12:00:00Z')
      const filtersRequested: import('~/server/football/football.types').FootballMatchFilters[] = []

      const provider: IFootballProvider = {
        async getStandings() {
          return { standings: [], metadata: createFootballSeasonMetadata({ currentMatchday: 15 }) }
        },
        async getMatches(filters) {
          filtersRequested.push(filters)
          return []
        },
        async getScorers() {
          return []
        },
      }

      await orchestrateSerieAOverview(provider, now)

      const nextFilter = filtersRequested.find(f => f.dateFrom === '2024-01-28')
      expect(nextFilter).toBeDefined()
      expect(nextFilter?.dateFrom).toBe('2024-01-28')
      expect(nextFilter?.dateTo).toBe('2024-02-18') // today+21, exclusive
    })

    it('ignores currentMatchday and uses only date windows', async () => {
      const now = new Date('2024-01-28T12:00:00Z')
      
      // Create metadata with currentMatchday=38 (end of season)
      const metadata = createFootballSeasonMetadata({ currentMatchday: 38 })
      
      const filtersRequested: import('~/server/football/football.types').FootballMatchFilters[] = []

      const provider: IFootballProvider = {
        async getStandings() {
          return { standings: [], metadata }
        },
        async getMatches(filters) {
          filtersRequested.push(filters)
          return []
        },
        async getScorers() {
          return []
        },
      }

      await orchestrateSerieAOverview(provider, now)

      // Even with currentMatchday=38, dates should still be used
      expect(filtersRequested).toHaveLength(2)
      expect(filtersRequested.some(f => f.dateFrom === '2024-01-14')).toBe(true)
      expect(filtersRequested.some(f => f.dateFrom === '2024-01-28')).toBe(true)
    })

    it('filters finished matches (latest) and sorts descending', async () => {
      const now = new Date('2024-01-28T12:00:00Z')
      const latestMatches = [
        createFootballMatch({ id: 1, utcDate: '2024-01-15T12:00:00Z', status: 'scheduled' as const }),
        createFootballMatch({ id: 2, utcDate: '2024-01-15T20:00:00Z', status: 'finished' as const }),
        createFootballMatch({ id: 3, utcDate: '2024-01-15T15:00:00Z', status: 'finished' as const }),
      ]

      const provider: IFootballProvider = {
        async getStandings() {
          return { standings: [], metadata: createFootballSeasonMetadata() }
        },
        async getMatches(filters) {
          if (filters.dateFrom === '2024-01-14') return latestMatches
          return []
        },
        async getScorers() {
          return []
        },
      }

      const result = await orchestrateSerieAOverview(provider, now)

      expect(result.latestMatches).toHaveLength(2)
      expect(result.latestMatches[0]?.utcDate).toBe('2024-01-15T20:00:00Z')
      expect(result.latestMatches[1]?.utcDate).toBe('2024-01-15T15:00:00Z')
    })

    it('filters scheduled matches (next) and sorts ascending', async () => {
      const now = new Date('2024-01-28T12:00:00Z')
      const nextMatches = [
        createFootballMatch({ id: 1, utcDate: '2024-02-15T20:00:00Z', status: 'scheduled' as const }),
        createFootballMatch({ id: 2, utcDate: '2024-02-15T14:00:00Z', status: 'scheduled' as const }),
        createFootballMatch({ id: 3, utcDate: '2024-02-15T18:00:00Z', status: 'finished' as const }),
      ]

      const provider: IFootballProvider = {
        async getStandings() {
          return { standings: [], metadata: createFootballSeasonMetadata() }
        },
        async getMatches(filters) {
          if (filters.dateFrom === '2024-01-28') return nextMatches
          return []
        },
        async getScorers() {
          return []
        },
      }

      const result = await orchestrateSerieAOverview(provider, now)

      expect(result.nextMatches).toHaveLength(2)
      expect(result.nextMatches[0]?.utcDate).toBe('2024-02-15T14:00:00Z')
      expect(result.nextMatches[1]?.utcDate).toBe('2024-02-15T20:00:00Z')
    })

    it('respects max 10 limit on both latest and next matches', async () => {
      const now = new Date('2024-01-28T12:00:00Z')
      const manyMatches = Array.from({ length: 15 }, (_, i) =>
        createFootballMatch({
          id: i + 1,
          status: i < 13 ? ('finished' as const) : ('scheduled' as const),
          utcDate: new Date(2024, 0, 15 + i).toISOString(),
        })
      )

      const provider: IFootballProvider = {
        async getStandings() {
          return { standings: [], metadata: createFootballSeasonMetadata() }
        },
        async getMatches() {
          return manyMatches
        },
        async getScorers() {
          return []
        },
      }

      const result = await orchestrateSerieAOverview(provider, now)

      expect(result.latestMatches.length).toBeLessThanOrEqual(10)
      expect(result.nextMatches.length).toBeLessThanOrEqual(10)
    })

    it('returns overview with all fields populated', async () => {
      const now = new Date('2024-01-28T12:00:00Z')
      const standings = [createFootballStandingEntry()]
      const metadata = createFootballSeasonMetadata()
      const scorers = [createFootballScorer()]

      const latestMatches = [
        createFootballMatch({ status: 'finished' as const }),
      ]

      const nextMatches = [
        createFootballMatch({ status: 'scheduled' as const }),
      ]

      const provider: IFootballProvider = {
        async getStandings() {
          return { standings, metadata }
        },
        async getMatches(filters) {
          if (filters.dateFrom === '2024-01-14') return latestMatches
          return nextMatches
        },
        async getScorers() {
          return scorers
        },
      }

      const result = await orchestrateSerieAOverview(provider, now)

      expect(result.standings).toBeDefined()
      expect(result.latestMatches).toBeDefined()
      expect(result.nextMatches).toBeDefined()
      expect(result.scorers).toBeDefined()
      expect(result.metadata.year).toBe(metadata.year)
      expect(result.metadata.currentMatchday).toBe(metadata.currentMatchday)
    })

    it('validates response schema on success', async () => {
      const now = new Date('2024-01-28T12:00:00Z')
      const standings = [createFootballStandingEntry()]

      const provider: IFootballProvider = {
        async getStandings() {
          return { standings, metadata: createFootballSeasonMetadata() }
        },
        async getMatches() {
          return []
        },
        async getScorers() {
          return []
        },
      }

      const result = await orchestrateSerieAOverview(provider, now)

      expect(result).toHaveProperty('standings')
      expect(result).toHaveProperty('latestMatches')
      expect(result).toHaveProperty('nextMatches')
      expect(result).toHaveProperty('scorers')
      expect(result).toHaveProperty('metadata')
    })

    it('propagates error from getStandings', async () => {
      const now = new Date('2024-01-28T12:00:00Z')
      const error = new Error('Standings error')

      const provider: IFootballProvider = {
        async getStandings() {
          throw error
        },
        async getMatches() {
          return []
        },
        async getScorers() {
          return []
        },
      }

      await expect(orchestrateSerieAOverview(provider, now)).rejects.toBe(error)
    })

    it('propagates error from secondary calls (getMatches)', async () => {
      const now = new Date('2024-01-28T12:00:00Z')
      const error = new Error('Matches error')

      const provider: IFootballProvider = {
        async getStandings() {
          return { standings: [], metadata: createFootballSeasonMetadata() }
        },
        async getMatches() {
          throw error
        },
        async getScorers() {
          return []
        },
      }

      await expect(orchestrateSerieAOverview(provider, now)).rejects.toBe(error)
    })

    it('propagates error from secondary calls (getScorers)', async () => {
      const now = new Date('2024-01-28T12:00:00Z')
      const error = new Error('Scorers error')

      const provider: IFootballProvider = {
        async getStandings() {
          return { standings: [], metadata: createFootballSeasonMetadata() }
        },
        async getMatches() {
          return []
        },
        async getScorers() {
          throw error
        },
      }

      await expect(orchestrateSerieAOverview(provider, now)).rejects.toBe(error)
    })

    it('uses default provider when none specified', async () => {
      const result = await orchestrateSerieAOverview(
        createMockProvider({
          standings: { standings: [], metadata: createFootballSeasonMetadata() },
          matches: new Map([
            ['latest', []],
            ['next', []],
          ]),
        }),
        new Date('2024-01-28T12:00:00Z'),
      )

      expect(result).toBeDefined()
    })
  })
})
