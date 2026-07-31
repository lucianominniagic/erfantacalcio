/**
 * football.mapper — conversione raw football-data.org v4 → DTO provider-neutral.
 *
 * Tutte le funzioni sono pure (nessun side-effect, nessun I/O).
 * Usate esclusivamente da `football.client.ts` dopo il parse Zod dei raw schema.
 *
 * Mapping status:
 *   SCHEDULED, TIMED          → 'scheduled'
 *   IN_PLAY, PAUSED            → 'live'
 *   FINISHED, AWARDED          → 'finished'
 *   POSTPONED, SUSPENDED       → 'postponed'
 *   CANCELLED                  → 'cancelled'
 *
 * Mapping winner:
 *   HOME_TEAM → 'home' | AWAY_TEAM → 'away' | DRAW → 'draw' | null → null
 */
import type {
  FdStandingsResponse,
  FdMatchesResponse,
  FdScorersResponse,
  FdTeamRaw,
  FdMatchRaw,
  FdStandingEntryRaw,
  FdScorerEntryRaw,
} from '~/schemas/football'
import type {
  FootballTeam,
  FootballMatch,
  FootballScorer,
  FootballStandingEntry,
  MatchStatus,
  FootballSeasonMetadata,
} from '~/schemas/football'
import { FD_MATCH_STATUSES } from '~/schemas/football'
import type { StandingsResult } from './football.types'

// ---------------------------------------------------------------------------
// Status mapping
// ---------------------------------------------------------------------------

function mapMatchStatus(raw: (typeof FD_MATCH_STATUSES)[number]): MatchStatus {
  switch (raw) {
    case 'SCHEDULED':
    case 'TIMED':
      return 'scheduled'
    case 'IN_PLAY':
    case 'PAUSED':
      return 'live'
    case 'FINISHED':
    case 'AWARDED':
      return 'finished'
    case 'POSTPONED':
    case 'SUSPENDED':
      return 'postponed'
    case 'CANCELLED':
      return 'cancelled'
    default: {
      // Controllo esaustivo a compile-time
      const _exhaustive: never = raw
      throw new Error(`Stato match non riconosciuto: ${String(_exhaustive)}`)
    }
  }
}

// ---------------------------------------------------------------------------
// Building-block mappers
// ---------------------------------------------------------------------------

function mapTeam(raw: FdTeamRaw): FootballTeam {
  return {
    id: raw.id,
    name: raw.name,
    shortName: raw.shortName ?? null,
    tla: raw.tla ?? null,
    crest: raw.crest ?? null,
  }
}

function mapStandingEntry(raw: FdStandingEntryRaw): FootballStandingEntry {
  return {
    position: raw.position,
    team: mapTeam(raw.team),
    playedGames: raw.playedGames,
    won: raw.won,
    draw: raw.draw,
    lost: raw.lost,
    points: raw.points,
    goalsFor: raw.goalsFor,
    goalsAgainst: raw.goalsAgainst,
    goalDifference: raw.goalDifference,
    form: raw.form ?? null,
  }
}

function mapMatch(raw: FdMatchRaw): FootballMatch {
  const rawWinner = raw.score.winner
  const winner =
    rawWinner === 'HOME_TEAM'
      ? ('home' as const)
      : rawWinner === 'AWAY_TEAM'
        ? ('away' as const)
        : rawWinner === 'DRAW'
          ? ('draw' as const)
          : null

  return {
    id: raw.id,
    utcDate: raw.utcDate,
    status: mapMatchStatus(raw.status),
    matchday: raw.matchday ?? null,
    homeTeam: mapTeam(raw.homeTeam),
    awayTeam: mapTeam(raw.awayTeam),
    score: {
      winner,
      fullTime: {
        home: raw.score.fullTime.home,
        away: raw.score.fullTime.away,
      },
      halfTime: raw.score.halfTime
        ? {
            home: raw.score.halfTime.home,
            away: raw.score.halfTime.away,
          }
        : null,
    },
  }
}

function mapScorerEntry(raw: FdScorerEntryRaw): FootballScorer {
  return {
    player: {
      id: raw.player.id,
      name: raw.player.name,
      nationality: raw.player.nationality ?? null,
      position: raw.player.position ?? null,
      // football-data.org raramente fornisce photo — sempre null nel DTO
      photo: raw.player.photo ?? null,
    },
    team: mapTeam(raw.team),
    goals: raw.goals,
    assists: raw.assists ?? null,
    penalties: raw.penalties ?? null,
    playedMatches: raw.playedMatches ?? null,
  }
}

// ---------------------------------------------------------------------------
// Public mappers (usati da football.client.ts)
// ---------------------------------------------------------------------------

/**
 * Mappa la risposta standings → StandingsResult.
 *
 * @throws Se il gruppo TOTAL è assente o currentMatchday è null.
 */
export function mapStandings(raw: FdStandingsResponse): StandingsResult {
  const totalGroup = raw.standings.find((g) => g.type === 'TOTAL')
  if (!totalGroup) {
    throw new Error(
      'football-data.org: standings di tipo TOTAL non trovata nella risposta',
    )
  }

  const currentMatchday = raw.season.currentMatchday
  if (currentMatchday === null || currentMatchday === undefined) {
    throw new Error(
      'football-data.org: currentMatchday è null — la stagione potrebbe non essere ancora iniziata',
    )
  }

  const metadata: FootballSeasonMetadata = {
    year: raw.season.startDate.substring(0, 4),
    startDate: raw.season.startDate,
    endDate: raw.season.endDate,
    currentMatchday,
    competition: {
      id: raw.competition.id,
      name: raw.competition.name,
      code: raw.competition.code,
    },
  }

  return {
    standings: totalGroup.table.map(mapStandingEntry),
    metadata,
  }
}

/** Mappa la risposta matches → array di FootballMatch DTO. */
export function mapMatches(raw: FdMatchesResponse): FootballMatch[] {
  return raw.matches.map(mapMatch)
}

/** Mappa la risposta scorers → array di FootballScorer DTO. */
export function mapScorers(raw: FdScorersResponse): FootballScorer[] {
  return raw.scorers.map(mapScorerEntry)
}
