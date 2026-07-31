/**
 * Contratti Zod per l'integrazione football-data.org v4 — Serie A.
 *
 * Organizzazione:
 *  1. Costanti di contratto
 *  2. Raw schemas  — fedeli a football-data.org v4, usati per il .parse()
 *                    nel client HTTP; building-block non esportati.
 *  3. Tipi raw inferiti — esportati per il mapper.
 *  4. DTO schemas   — provider-neutral, usati nei componenti e nell'API route.
 *  5. Tipi DTO inferiti.
 */
import { z } from 'zod'

// ---------------------------------------------------------------------------
// 1. Costanti di contratto
// ---------------------------------------------------------------------------

/** Codice competizione Serie A su football-data.org */
export const SERIE_A_COMPETITION_CODE = 'SA' as const

/**
 * Tutti i valori di status documentati da football-data.org v4.
 * Usato nel raw schema; il mapper li converte in MATCH_STATUSES (provider-neutral).
 */
export const FD_MATCH_STATUSES = [
  'SCHEDULED',  // schedulata, orario definito
  'TIMED',      // schedulata, orario approssimativo
  'IN_PLAY',    // in corso
  'PAUSED',     // pausa (intervallo / supplementari)
  'FINISHED',   // terminata
  'SUSPENDED',  // sospesa dal direttore di gara
  'POSTPONED',  // rinviata a data da definire
  'CANCELLED',  // annullata
  'AWARDED',    // assegnata dalla federazione (3-0 tavolino ecc.)
] as const

/**
 * Status provider-neutral esposti dal dominio.
 *
 * Mapping dal raw:
 *   scheduled  ← SCHEDULED, TIMED
 *   live       ← IN_PLAY, PAUSED
 *   finished   ← FINISHED, AWARDED
 *   postponed  ← POSTPONED, SUSPENDED
 *   cancelled  ← CANCELLED
 */
export const MATCH_STATUSES = [
  'scheduled',
  'live',
  'finished',
  'postponed',
  'cancelled',
] as const

// ---------------------------------------------------------------------------
// 2. Raw building-block schemas (non esportati — interni al modulo)
// ---------------------------------------------------------------------------

const fdCompetition = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  code: z.string(),
  type: z.string(),
  emblem: z.string().nullable().optional(),
})

const fdSeason = z.object({
  id: z.number().int().positive(),
  startDate: z.string(), // "YYYY-MM-DD"
  endDate: z.string(),   // "YYYY-MM-DD"
  // Può essere null a inizio stagione, prima che si giochi la prima giornata
  currentMatchday: z.number().int().positive().nullable(),
  // Null finché la stagione non è conclusa, poi oggetto squadra — non usato nel DTO
  winner: z.unknown().nullable().optional(),
})

const fdTeam = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  shortName: z.string().nullable().optional(),
  tla: z.string().nullable().optional(),    // es. "MIL"
  crest: z.string().nullable().optional(),  // URL stemma, non sempre presente
})

// -- Standings --

const fdStandingEntry = z.object({
  position: z.number().int().positive(),
  team: fdTeam,
  playedGames: z.number().int().min(0),
  form: z.string().nullable().optional(), // es. "WWDLW", null a inizio stagione
  won: z.number().int().min(0),
  draw: z.number().int().min(0),
  lost: z.number().int().min(0),
  points: z.number().int().min(0),
  goalsFor: z.number().int().min(0),
  goalsAgainst: z.number().int().min(0),
  goalDifference: z.number().int(),
})

const fdStandingGroup = z.object({
  stage: z.string(),
  type: z.enum(['TOTAL', 'HOME', 'AWAY']),
  group: z.string().nullable().optional(),
  table: z.array(fdStandingEntry),
})

// -- Matches --

const fdScore = z.object({
  winner: z.enum(['HOME_TEAM', 'AWAY_TEAM', 'DRAW']).nullable(),
  duration: z
    .enum(['REGULAR', 'EXTRA_TIME', 'PENALTY_SHOOTOUT'])
    .nullable()
    .optional(),
  fullTime: z.object({
    home: z.number().int().min(0).nullable(),
    away: z.number().int().min(0).nullable(),
  }),
  halfTime: z
    .object({
      home: z.number().int().min(0).nullable(),
      away: z.number().int().min(0).nullable(),
    })
    .nullable()
    .optional(),
})

const fdMatch = z.object({
  id: z.number().int().positive(),
  utcDate: z.string(),              // ISO 8601, es. "2024-01-06T14:00:00Z"
  status: z.enum(FD_MATCH_STATUSES),
  matchday: z.number().int().positive().nullable().optional(),
  stage: z.string().nullable().optional(),
  group: z.string().nullable().optional(),
  lastUpdated: z.string().optional(),
  homeTeam: fdTeam,
  awayTeam: fdTeam,
  score: fdScore,
})

// -- Scorers --

const fdPlayer = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  dateOfBirth: z.string().nullable().optional(),
  nationality: z.string().nullable().optional(),
  section: z.string().nullable().optional(),
  position: z.string().nullable().optional(),
  shirtNumber: z.number().int().min(0).nullable().optional(),
  lastUpdated: z.string().nullable().optional(),
  // football-data.org spesso non fornisce questo campo — raw opzionale/nullable,
  // DTO sempre nullable (mai undefined).
  photo: z.string().nullable().optional(),
})

const fdScorerEntry = z.object({
  player: fdPlayer,
  team: fdTeam,
  playedMatches: z.number().int().min(0).nullable().optional(),
  goals: z.number().int().min(0),
  assists: z.number().int().min(0).nullable().optional(),
  penalties: z.number().int().min(0).nullable().optional(),
})

// ---------------------------------------------------------------------------
// Raw response schemas — esportati per .parse() nel client HTTP
// ---------------------------------------------------------------------------

export const fdStandingsResponseSchema = z.object({
  filters: z.record(z.string(), z.unknown()).optional(),
  competition: fdCompetition,
  season: fdSeason,
  standings: z.array(fdStandingGroup),
})

export const fdMatchesResponseSchema = z.object({
  filters: z.record(z.string(), z.unknown()).optional(),
  // Presente nella maggior parte delle risposte ma non garantito
  resultSet: z
    .object({
      count: z.number().int().min(0),
      competitions: z.string().optional(),
      first: z.string().optional(),
      last: z.string().optional(),
      played: z.number().int().min(0).optional(),
      wins: z.number().int().min(0).optional(),
      draws: z.number().int().min(0).optional(),
      losses: z.number().int().min(0).optional(),
    })
    .optional(),
  competition: fdCompetition,
  matches: z.array(fdMatch),
})

export const fdScorersResponseSchema = z.object({
  count: z.number().int().min(0),
  filters: z.record(z.string(), z.unknown()).optional(),
  competition: fdCompetition,
  season: fdSeason,
  scorers: z.array(fdScorerEntry),
})

// ---------------------------------------------------------------------------
// 3. Tipi raw inferiti
// ---------------------------------------------------------------------------

export type FdStandingsResponse = z.infer<typeof fdStandingsResponseSchema>
export type FdMatchesResponse = z.infer<typeof fdMatchesResponseSchema>
export type FdScorersResponse = z.infer<typeof fdScorersResponseSchema>

// Sub-tipi usati nelle firme del mapper
export type FdTeamRaw = z.infer<typeof fdTeam>
export type FdMatchRaw = z.infer<typeof fdMatch>
export type FdScorerEntryRaw = z.infer<typeof fdScorerEntry>
export type FdStandingEntryRaw = z.infer<typeof fdStandingEntry>

// ---------------------------------------------------------------------------
// 4. DTO schemas — provider-neutral
// ---------------------------------------------------------------------------

export const footballTeamSchema = z.object({
  id: z.number().int().positive(),
  name: z.string(),
  shortName: z.string().nullable(),
  tla: z.string().nullable(),
  crest: z.string().nullable(),
})

export const footballStandingEntrySchema = z.object({
  position: z.number().int().positive(),
  team: footballTeamSchema,
  playedGames: z.number().int().min(0),
  won: z.number().int().min(0),
  draw: z.number().int().min(0),
  lost: z.number().int().min(0),
  points: z.number().int().min(0),
  goalsFor: z.number().int().min(0),
  goalsAgainst: z.number().int().min(0),
  goalDifference: z.number().int(),
  form: z.string().nullable(),
})

export const matchStatusSchema = z.enum(MATCH_STATUSES)

export const footballMatchSchema = z.object({
  id: z.number().int().positive(),
  utcDate: z.string(),
  status: matchStatusSchema,
  matchday: z.number().int().positive().nullable(),
  homeTeam: footballTeamSchema,
  awayTeam: footballTeamSchema,
  score: z.object({
    /** Null finché la partita non è terminata */
    winner: z.enum(['home', 'away', 'draw']).nullable(),
    fullTime: z.object({
      home: z.number().int().min(0).nullable(),
      away: z.number().int().min(0).nullable(),
    }),
    halfTime: z
      .object({
        home: z.number().int().min(0).nullable(),
        away: z.number().int().min(0).nullable(),
      })
      .nullable(),
  }),
})

export const footballScorerSchema = z.object({
  player: z.object({
    id: z.number().int().positive(),
    name: z.string(),
    nationality: z.string().nullable(),
    position: z.string().nullable(),
    /** Normalizzato sempre a null — football-data.org raramente lo fornisce */
    photo: z.string().nullable(),
  }),
  team: footballTeamSchema,
  goals: z.number().int().min(0),
  assists: z.number().int().min(0).nullable(),
  penalties: z.number().int().min(0).nullable(),
  playedMatches: z.number().int().min(0).nullable(),
})

export const footballSeasonMetadataSchema = z.object({
  /** Anno di inizio stagione, formato "YYYY" (es. "2024") */
  year: z.string().regex(/^\d{4}$/),
  startDate: z.string(), // "YYYY-MM-DD"
  endDate: z.string(),   // "YYYY-MM-DD"
  /** Giornata corrente — sempre presente nel DTO (il servizio deve garantirla) */
  currentMatchday: z.number().int().positive(),
  competition: z.object({
    id: z.number().int().positive(),
    name: z.string(),
    code: z.string(),
  }),
})

export const serieAOverviewSchema = z.object({
  standings: z.array(footballStandingEntrySchema),
  latestMatches: z.array(footballMatchSchema),
  nextMatches: z.array(footballMatchSchema),
  scorers: z.array(footballScorerSchema),
  metadata: footballSeasonMetadataSchema,
})

// ---------------------------------------------------------------------------
// 5. Tipi DTO inferiti
// ---------------------------------------------------------------------------

export type FootballTeam = z.infer<typeof footballTeamSchema>
export type FootballStandingEntry = z.infer<typeof footballStandingEntrySchema>
export type MatchStatus = z.infer<typeof matchStatusSchema>
export type FootballMatch = z.infer<typeof footballMatchSchema>
export type FootballScorer = z.infer<typeof footballScorerSchema>
export type FootballSeasonMetadata = z.infer<typeof footballSeasonMetadataSchema>
export type SerieAOverview = z.infer<typeof serieAOverviewSchema>
