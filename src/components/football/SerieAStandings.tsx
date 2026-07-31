/**
 * SerieAStandings — classifica Serie A.
 *
 * Server component: riceve standings già tipizzati dallo schema DTO.
 *
 * Colonne visibili:
 *  - Sempre:   pos, squadra (logo+nome), PG, Pt
 *  - sm+:      V, N, P
 *  - md+:      GF, GS, DR
 */
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { TableChart } from '@mui/icons-material'
import type { FootballStandingEntry, FootballTeam } from '~/schemas/football'
import FootballSectionCard from './FootballSectionCard'

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TeamCell({ team }: { team: FootballTeam }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {team.crest ? (
        <Box
          component="img"
          src={team.crest}
          alt=""
          aria-hidden="true"
          sx={{
            width: { xs: 18, sm: 22 },
            height: { xs: 18, sm: 22 },
            objectFit: 'contain',
            flexShrink: 0,
          }}
        />
      ) : (
        <Box sx={{ width: { xs: 18, sm: 22 }, flexShrink: 0 }} />
      )}
      {/* Nome completo su sm+, abbreviazione su xs */}
      <Typography
        variant="body2"
        noWrap
        sx={{
          fontWeight: 600,
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
          display: { xs: 'none', sm: 'block' },
        }}
      >
        {team.shortName ?? team.name}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          fontSize: '0.75rem',
          display: { xs: 'block', sm: 'none' },
        }}
      >
        {team.tla ??
          (team.shortName?.slice(0, 3).toUpperCase() ??
            team.name.slice(0, 3).toUpperCase())}
      </Typography>
    </Box>
  )
}

// Stile cella header condiviso
const thSx = { fontWeight: 700, px: { xs: 0.75, sm: 1.5 }, py: 1 }

// ---------------------------------------------------------------------------
// SerieAStandings
// ---------------------------------------------------------------------------

interface SerieAStandingsProps {
  standings: FootballStandingEntry[]
}

export default function SerieAStandings({ standings }: SerieAStandingsProps) {
  return (
    <FootballSectionCard
      title="Classifica"
      icon={
        <TableChart sx={{ color: 'primary.main', fontSize: '1.1rem' }} />
      }
    >
      {standings.length === 0 ? (
        <Box sx={{ py: 5, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Classifica non disponibile
          </Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table
            size="small"
            aria-label="Classifica Serie A"
            sx={{ tableLayout: 'auto' }}
          >
            <TableHead>
              <TableRow>
                <TableCell sx={{ ...thSx, width: 28 }}>#</TableCell>
                <TableCell sx={thSx}>Squadra</TableCell>
                <TableCell align="center" sx={{ ...thSx, width: 36 }}>
                  PG
                </TableCell>
                {/* sm+ */}
                <TableCell
                  align="center"
                  sx={{
                    ...thSx,
                    width: 32,
                    display: { xs: 'none', sm: 'table-cell' },
                  }}
                >
                  V
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    ...thSx,
                    width: 32,
                    display: { xs: 'none', sm: 'table-cell' },
                  }}
                >
                  N
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    ...thSx,
                    width: 32,
                    display: { xs: 'none', sm: 'table-cell' },
                  }}
                >
                  P
                </TableCell>
                {/* md+ */}
                <TableCell
                  align="center"
                  sx={{
                    ...thSx,
                    width: 36,
                    display: { xs: 'none', md: 'table-cell' },
                  }}
                >
                  GF
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    ...thSx,
                    width: 36,
                    display: { xs: 'none', md: 'table-cell' },
                  }}
                >
                  GS
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    ...thSx,
                    width: 40,
                    display: { xs: 'none', md: 'table-cell' },
                  }}
                >
                  DR
                </TableCell>
                {/* Sempre */}
                <TableCell align="center" sx={{ ...thSx, width: 40 }}>
                  Pt
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {standings.map((entry) => {
                const gd = entry.goalDifference
                return (
                  <TableRow key={entry.team.id} hover>
                    {/* Posizione */}
                    <TableCell
                      sx={{ px: { xs: 0.75, sm: 1.5 }, py: 0.75 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: 'text.secondary',
                          fontSize: '0.75rem',
                        }}
                      >
                        {entry.position}
                      </Typography>
                    </TableCell>

                    {/* Squadra */}
                    <TableCell sx={{ px: { xs: 0.75, sm: 1.5 }, py: 0.75 }}>
                      <TeamCell team={entry.team} />
                    </TableCell>

                    {/* PG */}
                    <TableCell
                      align="center"
                      sx={{ px: { xs: 0.75, sm: 1.5 }, py: 0.75 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      >
                        {entry.playedGames}
                      </Typography>
                    </TableCell>

                    {/* V, N, P — sm+ */}
                    <TableCell
                      align="center"
                      sx={{
                        px: { xs: 0.75, sm: 1.5 },
                        py: 0.75,
                        display: { xs: 'none', sm: 'table-cell' },
                      }}
                    >
                      <Typography variant="body2">{entry.won}</Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        px: { xs: 0.75, sm: 1.5 },
                        py: 0.75,
                        display: { xs: 'none', sm: 'table-cell' },
                      }}
                    >
                      <Typography variant="body2">{entry.draw}</Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        px: { xs: 0.75, sm: 1.5 },
                        py: 0.75,
                        display: { xs: 'none', sm: 'table-cell' },
                      }}
                    >
                      <Typography variant="body2">{entry.lost}</Typography>
                    </TableCell>

                    {/* GF, GS, DR — md+ */}
                    <TableCell
                      align="center"
                      sx={{
                        px: { xs: 0.75, sm: 1.5 },
                        py: 0.75,
                        display: { xs: 'none', md: 'table-cell' },
                      }}
                    >
                      <Typography variant="body2">{entry.goalsFor}</Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        px: { xs: 0.75, sm: 1.5 },
                        py: 0.75,
                        display: { xs: 'none', md: 'table-cell' },
                      }}
                    >
                      <Typography variant="body2">
                        {entry.goalsAgainst}
                      </Typography>
                    </TableCell>
                    <TableCell
                      align="center"
                      sx={{
                        px: { xs: 0.75, sm: 1.5 },
                        py: 0.75,
                        display: { xs: 'none', md: 'table-cell' },
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color:
                            gd > 0
                              ? 'success.main'
                              : gd < 0
                                ? 'error.main'
                                : 'text.primary',
                        }}
                      >
                        {gd > 0 ? `+${gd}` : gd}
                      </Typography>
                    </TableCell>

                    {/* Punti */}
                    <TableCell
                      align="center"
                      sx={{ px: { xs: 0.75, sm: 1.5 }, py: 0.75 }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 800,
                          fontSize: { xs: '0.8rem', sm: '0.9rem' },
                        }}
                      >
                        {entry.points}
                      </Typography>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </FootballSectionCard>
  )
}
