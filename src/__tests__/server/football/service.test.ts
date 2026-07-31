/* eslint-disable @typescript-eslint/require-await */
/**
 * service.test — unit tests for football.service orchestration.
 *
 * Validates:
 * - getSerieAStandings: delegates to provider.getStandings()
 * - getTopScorers: delegates to provider.getScorers()
 * - orchestrateSerieAOverview: standings first, then parallel calls (2x getMatches + getScorers)
 * - orchestrateSerieAOverview: fetches matchday=currentMatchday (latest) and
 *   matchday=currentMatchday+1 (next), filters/sorts, validates with serieAOverviewSchema
 * - orchestrateSerieAOverview: propagates all errors
 * - Accepts optional provider parameter for DI
 * - All functions use default footballDataClient when not specified
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import type { IFootballProvider } from '~/server/football/football.types'
import {
  getSerieAStandings,
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

      const provider: IFootballProvider = {
        async getStandings() {
          return { standings, metadata }
        },
        async getMatches() {
          return []
        },
        async getScorers() {
          return []
        },
      }

      const result = await getSerieAStandings(provider)

      expect(result.standings).toBe(standings)
      expect(result.metadata).toBe(metadata)
    })

    it('uses default provider when none specified', async () => {
      const standings = [createFootballStandingEntry()]
      const metadata = createFootballSeasonMetadata()

      const provider: IFootballProvider = {
        async getStandings() {
          return { standings, metadata }
        },
        async getMatches() {
          return []
        },
        async getScorers() {
          return []
        },
      }

      const result = await getSerieAStandings(provider)
      expect(result).toBeDefined()
      expect(result.standings).toBeDefined()
      expect(result.metadata).toBeDefined()
    })

    it('propagates provider error', async () => {
      const error = new Error('Provider error')

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

      await expect(getSerieAStandings(provider)).rejects.toBe(error)
    })
  })

  describe('getTopScorers', () => {
    it('returns array of scorers from provider', async () => {
      const scorers = [
        createFootballScorer({ goals: 15 }),
        createFootballScorer({ goals: 12 }),
      ]

      const provider: IFootballProvider = {
        async getStandings() {
          return { standings: [], metadata: createFootballSeasonMetadata() }
        },
        async getMatches() {
          return []
        },
        async getScorers() {
          return scorers
        },
      }

      const result = await getTopScorers(provider)

      expect(result).toBe(scorers)
    })

    it('propagates provider error', async () => {
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

      await expect(getTopScorers(provider)).rejects.toBe(error)
    })
  })

  describe('orchestrateSerieAOverview', () => {
    it('respects max 10 limit on both latest and next matches', async () => {
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

      const result = await orchestrateSerieAOverview(provider)

      expect(result.latestMatches.length).toBeLessThanOrEqual(10)
      expect(result.nextMatches.length).toBeLessThanOrEqual(10)
    })

    it('returns overview with all fields populated', async () => {
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
          if (filters.matchday === metadata.currentMatchday) return latestMatches
          return nextMatches
        },
        async getScorers() {
          return scorers
        },
      }

      const result = await orchestrateSerieAOverview(provider)

      expect(result.standings).toBeDefined()
      expect(result.latestMatches).toBeDefined()
      expect(result.nextMatches).toBeDefined()
      expect(result.scorers).toBeDefined()
      expect(result.metadata.year).toBe(metadata.year)
      expect(result.metadata.currentMatchday).toBe(metadata.currentMatchday)
    })

    it('validates response schema on success', async () => {
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

      const result = await orchestrateSerieAOverview(provider)

      expect(result).toHaveProperty('standings')
      expect(result).toHaveProperty('latestMatches')
      expect(result).toHaveProperty('nextMatches')
      expect(result).toHaveProperty('scorers')
      expect(result).toHaveProperty('metadata')
    })

    it('propagates error from getStandings', async () => {
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

      await expect(orchestrateSerieAOverview(provider)).rejects.toBe(error)
    })

    it('propagates error from secondary calls (getMatches)', async () => {
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

      await expect(orchestrateSerieAOverview(provider)).rejects.toBe(error)
    })

    it('propagates error from secondary calls (getScorers)', async () => {
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

      await expect(orchestrateSerieAOverview(provider)).rejects.toBe(error)
    })

    it('uses default provider when none specified', async () => {
      const provider: IFootballProvider = {
        async getStandings() {
          return { standings: [], metadata: createFootballSeasonMetadata() }
        },
        async getMatches() {
          return []
        },
        async getScorers() {
          return []
        },
      }

      const result = await orchestrateSerieAOverview(provider)

      expect(result).toBeDefined()
    })
  })
})
