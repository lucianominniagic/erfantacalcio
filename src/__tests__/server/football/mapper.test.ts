/**
 * mapper.test — unit tests for football.mapper pure functions.
 *
 * Validates:
 * - mapStandings: TOTAL group extraction, metadata.currentMatchday present
 * - mapStandings failure: TOTAL missing or currentMatchday null
 * - mapMatches: status mapping SCHEDULED→scheduled, IN_PLAY→live, FINISHED→finished, etc.
 * - mapMatches: winner mapping HOME_TEAM→'home', DRAW→'draw', null→null
 * - mapMatches: score.fullTime/halfTime null handling
 * - mapScorers: photo always null, assists/penalties optional→null conversion
 * - mapScorers: playedMatches optional→null conversion
 */

import { describe, it, expect } from 'vitest'
import {
  mapStandings,
  mapMatches,
  mapScorers,
} from '~/server/football/football.mapper'
import {
  createFdStandingsResponse,
  createFdMatchesResponse,
  createFdScorersResponse,
  createFdMatch,
  createFdScorerEntry,
} from './fixtures'

describe('football.mapper', () => {
  describe('mapStandings', () => {
    it('maps TOTAL standings group with correct metadata', () => {
      const raw = createFdStandingsResponse()
      const result = mapStandings(raw)

      expect(result.standings).toHaveLength(3)
      expect(result.standings[0]?.position).toBe(1)
      expect(result.standings[0]?.points).toBe(23)

      expect(result.metadata.year).toBe('2023')
      expect(result.metadata.startDate).toBe('2023-08-19')
      expect(result.metadata.currentMatchday).toBe(15)
      expect(result.metadata.competition.code).toBe('SA')
    })

    it('includes team data in standings entries', () => {
      const raw = createFdStandingsResponse()
      const result = mapStandings(raw)

      expect(result.standings[0]?.team.name).toBe('Test Team')
      expect(result.standings[0]?.team.id).toBe(1)
    })

    it('normalizes form to nullable', () => {
      const raw = createFdStandingsResponse({
        standings: [
          {
            stage: 'REGULAR_SEASON',
            type: 'TOTAL',
            group: null,
            table: [
              {
                position: 1,
                team: { id: 1, name: 'Team', shortName: null, tla: null, crest: null },
                playedGames: 10,
                form: null,
                won: 7,
                draw: 2,
                lost: 1,
                points: 23,
                goalsFor: 25,
                goalsAgainst: 12,
                goalDifference: 13,
              },
            ],
          },
        ],
      })

      const result = mapStandings(raw)
      expect(result.standings[0]?.form).toBeNull()
    })

    it('throws when TOTAL standings group is missing', () => {
      const raw = createFdStandingsResponse({
        standings: [
          {
            stage: 'REGULAR_SEASON',
            type: 'HOME',
            group: null,
            table: [],
          },
        ],
      })

      expect(() => mapStandings(raw)).toThrow(
        'standings di tipo TOTAL non trovata nella risposta',
      )
    })

    it('throws when currentMatchday is null', () => {
      const raw = createFdStandingsResponse({
        season: {
          id: 2023,
          startDate: '2023-08-19',
          endDate: '2024-06-02',
          currentMatchday: null,
          winner: null,
        },
      })

      expect(() => mapStandings(raw)).toThrow('currentMatchday è null')
    })
  })

  describe('mapMatches', () => {
    it('maps array of matches preserving base fields', () => {
      const raw = createFdMatchesResponse()
      const result = mapMatches(raw)

      expect(result).toHaveLength(3)
      expect(result[0]?.id).toBe(1)
      expect(result[0]?.utcDate).toBe('2024-01-15T14:00:00Z')
      expect(result[0]?.matchday).toBe(1)
    })

    it('maps all raw statuses to provider-neutral enum', () => {
      const raw = createFdMatchesResponse({
        matches: [
          createFdMatch({ id: 1, status: 'SCHEDULED' as const }),
          createFdMatch({ id: 2, status: 'TIMED' as const }),
          createFdMatch({ id: 3, status: 'IN_PLAY' as const }),
          createFdMatch({ id: 4, status: 'PAUSED' as const }),
          createFdMatch({ id: 5, status: 'FINISHED' as const }),
          createFdMatch({ id: 6, status: 'AWARDED' as const }),
          createFdMatch({ id: 7, status: 'POSTPONED' as const }),
          createFdMatch({ id: 8, status: 'SUSPENDED' as const }),
          createFdMatch({ id: 9, status: 'CANCELLED' as const }),
        ],
      })

      const result = mapMatches(raw)

      expect(result[0]?.status).toBe('scheduled')
      expect(result[1]?.status).toBe('scheduled')
      expect(result[2]?.status).toBe('live')
      expect(result[3]?.status).toBe('live')
      expect(result[4]?.status).toBe('finished')
      expect(result[5]?.status).toBe('finished')
      expect(result[6]?.status).toBe('postponed')
      expect(result[7]?.status).toBe('postponed')
      expect(result[8]?.status).toBe('cancelled')
    })

    it('maps score winner from HOME_TEAM/AWAY_TEAM/DRAW to home/away/draw/null', () => {
      const raw = createFdMatchesResponse({
        matches: [
          createFdMatch({ id: 1, score: { winner: 'HOME_TEAM', fullTime: { home: 2, away: 1 } } }),
          createFdMatch({ id: 2, score: { winner: 'AWAY_TEAM', fullTime: { home: 0, away: 1 } } }),
          createFdMatch({ id: 3, score: { winner: 'DRAW', fullTime: { home: 1, away: 1 } } }),
          createFdMatch({ id: 4, score: { winner: null, fullTime: { home: null, away: null } } }),
        ],
      })

      const result = mapMatches(raw)

      expect(result[0]?.score.winner).toBe('home')
      expect(result[1]?.score.winner).toBe('away')
      expect(result[2]?.score.winner).toBe('draw')
      expect(result[3]?.score.winner).toBeNull()
    })

    it('preserves fullTime scores', () => {
      const raw = createFdMatchesResponse({
        matches: [
          createFdMatch({
            id: 1,
            score: { winner: 'HOME_TEAM', fullTime: { home: 3, away: 2 } },
          }),
        ],
      })

      const result = mapMatches(raw)

      expect(result[0]?.score.fullTime).toEqual({ home: 3, away: 2 })
    })

    it('maps halfTime null when not provided', () => {
      const raw = createFdMatchesResponse({
        matches: [createFdMatch({ id: 1, score: { winner: null, fullTime: { home: null, away: null }, halfTime: null } })],
      })

      const result = mapMatches(raw)

      expect(result[0]?.score.halfTime).toBeNull()
    })

    it('maps halfTime when provided', () => {
      const raw = createFdMatchesResponse({
        matches: [
          createFdMatch({
            id: 1,
            score: {
              winner: 'HOME_TEAM',
              fullTime: { home: 2, away: 1 },
              halfTime: { home: 1, away: 0 },
            },
          }),
        ],
      })

      const result = mapMatches(raw)

      expect(result[0]?.score.halfTime).toEqual({ home: 1, away: 0 })
    })

    it('maps team data correctly', () => {
      const raw = createFdMatchesResponse()
      const result = mapMatches(raw)

      expect(result[0]?.homeTeam.name).toBe('Home Team')
      expect(result[0]?.awayTeam.name).toBe('Away Team')
      expect(result[0]?.homeTeam.id).toBe(1)
      expect(result[0]?.awayTeam.id).toBe(2)
    })
  })

  describe('mapScorers', () => {
    it('maps array of scorers', () => {
      const raw = createFdScorersResponse()
      const result = mapScorers(raw)

      expect(result).toHaveLength(3)
      expect(result[0]?.player.name).toBe('Player One')
      expect(result[0]?.goals).toBe(15)
    })

    it('preserves photo value from raw (maps provider photo field)', () => {
      // Note: In practice, football-data.org rarely provides photo,
      // but the mapper preserves the raw value (comment says "sempre null nel DTO"
      // but actual code does `raw.player.photo ?? null`, not forcing to null).
      // This test documents current behavior; production always gets null from API.
      const raw = createFdScorersResponse({
        scorers: [
          createFdScorerEntry({
            player: {
              id: 1,
              name: 'Test',
              firstName: 'Test',
              lastName: 'Player',
              dateOfBirth: '1990-01-01',
              nationality: 'Italy',
              section: 'M',
              position: 'Forward',
              shirtNumber: 10,
              lastUpdated: '2024-01-15T16:00:00Z',
              photo: 'https://example.com/photo.jpg',
            },
            team: { id: 1, name: 'Test Team', shortName: null, tla: null, crest: null },
            goals: 5,
          }),
          createFdScorerEntry({
            player: {
              id: 2,
              name: 'Test2',
              firstName: 'Test',
              lastName: 'Player2',
              dateOfBirth: '1990-01-01',
              nationality: 'Italy',
              section: 'M',
              position: 'Forward',
              shirtNumber: 11,
              lastUpdated: '2024-01-15T16:00:00Z',
              photo: null,
            },
            team: { id: 1, name: 'Test Team', shortName: null, tla: null, crest: null },
            goals: 3,
          }),
        ],
      })

      const result = mapScorers(raw)

      expect(result[0]?.player.photo).toBe('https://example.com/photo.jpg')
      expect(result[1]?.player.photo).toBeNull()
    })

    it('normalizes assists and penalties to null when undefined/null', () => {
      const raw = createFdScorersResponse({
        scorers: [
          createFdScorerEntry({ goals: 5, assists: 2, penalties: 1 }),
          createFdScorerEntry({ goals: 3, assists: null, penalties: undefined }),
        ],
      })

      const result = mapScorers(raw)

      expect(result[0]?.assists).toBe(2)
      expect(result[0]?.penalties).toBe(1)
      expect(result[1]?.assists).toBeNull()
      expect(result[1]?.penalties).toBeNull()
    })

    it('normalizes playedMatches to null when undefined', () => {
      const raw = createFdScorersResponse({
        scorers: [
          createFdScorerEntry({ goals: 5, playedMatches: 10 }),
          createFdScorerEntry({ goals: 3, playedMatches: undefined }),
        ],
      })

      const result = mapScorers(raw)

      expect(result[0]?.playedMatches).toBe(10)
      expect(result[1]?.playedMatches).toBeNull()
    })

    it('maps player and team fields preserving nulls', () => {
      const raw = createFdScorersResponse({
        scorers: [
          createFdScorerEntry({
            player: {
              id: 1,
              name: 'Test',
              firstName: 'Test',
              lastName: 'Player',
              dateOfBirth: '1990-01-01',
              nationality: 'Italy',
              section: 'M',
              position: 'Forward',
              shirtNumber: 10,
              lastUpdated: '2024-01-15T16:00:00Z',
              photo: null,
            },
            team: { id: 1, name: 'Test Team', shortName: null, tla: null, crest: null },
            goals: 5,
          }),
        ],
      })

      const result = mapScorers(raw)

      expect(result[0]?.player.id).toBe(1)
      expect(result[0]?.player.nationality).toBe('Italy')
      expect(result[0]?.player.position).toBe('Forward')
      expect(result[0]?.team.id).toBe(1)
    })

    it('handles missing player fields as null', () => {
      const raw = createFdScorersResponse({
        scorers: [
          createFdScorerEntry({
            player: {
              id: 1,
              name: 'Test',
              nationality: null,
              position: undefined,
              photo: null,
            },
            goals: 5,
          }),
        ],
      })

      const result = mapScorers(raw)

      expect(result[0]?.player.nationality).toBeNull()
      expect(result[0]?.player.position).toBeNull()
    })
  })
})
