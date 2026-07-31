/**
 * fixtures — conformi ai tipi/schemi raw e DTO per il modulo football.
 *
 * Fornisce factories per creare dati test sensati senza `any` cast.
 * Tutti i fixture rispettano i tipi Zod, nessun type coercion.
 */

import type {
  FdTeamRaw,
  FdMatchRaw,
  FdStandingEntryRaw,
  FdScorerEntryRaw,
  FdStandingsResponse,
  FdMatchesResponse,
  FdScorersResponse,
  FootballTeam,
  FootballMatch,
  FootballStandingEntry,
  FootballScorer,
  FootballSeasonMetadata,
} from '~/schemas/football'

// ---------------------------------------------------------------------------
// Raw fixtures (football-data.org v4 format)
// ---------------------------------------------------------------------------

export function createFdTeam(overrides?: Partial<FdTeamRaw>): FdTeamRaw {
  return {
    id: 1,
    name: 'Test Team',
    shortName: 'TST',
    tla: 'TST',
    crest: 'https://example.com/crest.png',
    ...overrides,
  }
}

export function createFdStandingEntry(
  position = 1,
  overrides?: Partial<FdStandingEntryRaw>,
): FdStandingEntryRaw {
  return {
    position,
    team: createFdTeam(),
    playedGames: 10,
    form: 'WWDLW',
    won: 7,
    draw: 2,
    lost: 1,
    points: 23,
    goalsFor: 25,
    goalsAgainst: 12,
    goalDifference: 13,
    ...overrides,
  }
}

export function createFdMatch(overrides?: Partial<FdMatchRaw>): FdMatchRaw {
  return {
    id: 1,
    utcDate: '2024-01-15T14:00:00Z',
    status: 'FINISHED' as const,
    matchday: 1,
    stage: 'REGULAR_SEASON',
    group: null,
    lastUpdated: '2024-01-15T16:00:00Z',
    homeTeam: createFdTeam({ id: 1, name: 'Home Team' }),
    awayTeam: createFdTeam({ id: 2, name: 'Away Team' }),
    score: {
      winner: 'HOME_TEAM' as const,
      duration: 'REGULAR' as const,
      fullTime: {
        home: 2,
        away: 1,
      },
      halfTime: {
        home: 1,
        away: 0,
      },
    },
    ...overrides,
  }
}

export function createFdScorerEntry(overrides?: Partial<FdScorerEntryRaw>): FdScorerEntryRaw {
  return {
    player: {
      id: 1,
      name: 'Test Player',
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
    team: createFdTeam(),
    playedMatches: 10,
    goals: 5,
    assists: 2,
    penalties: 1,
    ...overrides,
  }
}

export function createFdStandingsResponse(
  overrides?: Partial<FdStandingsResponse>,
): FdStandingsResponse {
  return {
    filters: {},
    competition: {
      id: 2019,
      name: 'Serie A',
      code: 'SA',
      type: 'LEAGUE',
      emblem: 'https://example.com/serie-a.png',
    },
    season: {
      id: 2023,
      startDate: '2023-08-19',
      endDate: '2024-06-02',
      currentMatchday: 15,
      winner: null,
    },
    standings: [
      {
        stage: 'REGULAR_SEASON',
        type: 'TOTAL' as const,
        group: null,
        table: [
          createFdStandingEntry(1),
          createFdStandingEntry(2, { team: createFdTeam({ id: 2, name: 'Second Place' }) }),
          createFdStandingEntry(3, { team: createFdTeam({ id: 3, name: 'Third Place' }) }),
        ],
      },
      {
        stage: 'REGULAR_SEASON',
        type: 'HOME' as const,
        group: null,
        table: [createFdStandingEntry(1)],
      },
    ],
    ...overrides,
  }
}

export function createFdMatchesResponse(
  overrides?: Partial<FdMatchesResponse>,
): FdMatchesResponse {
  return {
    filters: { matchday: '1' },
    resultSet: {
      count: 10,
      competitions: undefined,
      first: '2024-01-15T14:00:00Z',
      last: '2024-01-15T20:45:00Z',
      played: 10,
      wins: 6,
      draws: 2,
      losses: 2,
    },
    competition: {
      id: 2019,
      name: 'Serie A',
      code: 'SA',
      type: 'LEAGUE',
      emblem: 'https://example.com/serie-a.png',
    },
    matches: [
      createFdMatch({ id: 1, matchday: 1 }),
      createFdMatch({ id: 2, matchday: 1, status: 'IN_PLAY' as const }),
      createFdMatch({ id: 3, matchday: 1, status: 'SCHEDULED' as const }),
    ],
    ...overrides,
  }
}

export function createFdScorersResponse(
  overrides?: Partial<FdScorersResponse>,
): FdScorersResponse {
  return {
    count: 3,
    filters: {},
    competition: {
      id: 2019,
      name: 'Serie A',
      code: 'SA',
      type: 'LEAGUE',
      emblem: 'https://example.com/serie-a.png',
    },
    season: {
      id: 2023,
      startDate: '2023-08-19',
      endDate: '2024-06-02',
      currentMatchday: 15,
      winner: null,
    },
    scorers: [
      createFdScorerEntry({ player: { id: 1, name: 'Player One' }, goals: 15 }),
      createFdScorerEntry({ player: { id: 2, name: 'Player Two' }, goals: 12 }),
      createFdScorerEntry({ player: { id: 3, name: 'Player Three' }, goals: 10 }),
    ],
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// DTO fixtures (provider-neutral format)
// ---------------------------------------------------------------------------

export function createFootballTeam(overrides?: Partial<FootballTeam>): FootballTeam {
  return {
    id: 1,
    name: 'Test Team',
    shortName: 'TST',
    tla: 'TST',
    crest: 'https://example.com/crest.png',
    ...overrides,
  }
}

export function createFootballStandingEntry(
  position = 1,
  overrides?: Partial<FootballStandingEntry>,
): FootballStandingEntry {
  return {
    position,
    team: createFootballTeam(),
    playedGames: 10,
    won: 7,
    draw: 2,
    lost: 1,
    points: 23,
    goalsFor: 25,
    goalsAgainst: 12,
    goalDifference: 13,
    form: 'WWDLW',
    ...overrides,
  }
}

export function createFootballMatch(overrides?: Partial<FootballMatch>): FootballMatch {
  return {
    id: 1,
    utcDate: '2024-01-15T14:00:00Z',
    status: 'finished' as const,
    matchday: 1,
    homeTeam: createFootballTeam({ id: 1, name: 'Home Team' }),
    awayTeam: createFootballTeam({ id: 2, name: 'Away Team' }),
    score: {
      winner: 'home' as const,
      fullTime: {
        home: 2,
        away: 1,
      },
      halfTime: {
        home: 1,
        away: 0,
      },
    },
    ...overrides,
  }
}

export function createFootballScorer(overrides?: Partial<FootballScorer>): FootballScorer {
  return {
    player: {
      id: 1,
      name: 'Test Player',
      nationality: 'Italy',
      position: 'Forward',
      photo: null,
    },
    team: createFootballTeam(),
    goals: 5,
    assists: 2,
    penalties: 1,
    playedMatches: 10,
    ...overrides,
  }
}

export function createFootballSeasonMetadata(
  overrides?: Partial<FootballSeasonMetadata>,
): FootballSeasonMetadata {
  return {
    year: '2023',
    startDate: '2023-08-19',
    endDate: '2024-06-02',
    currentMatchday: 15,
    competition: {
      id: 2019,
      name: 'Serie A',
      code: 'SA',
    },
    ...overrides,
  }
}
