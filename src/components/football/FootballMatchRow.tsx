/**
 * FootballMatchRow — riga singola partita condivisa da LatestMatches e NextMatches.
 *
 * Server component: nessun hook, nessuna interazione client.
 * - status "finished" → mostra il risultato finale
 * - altri status  → mostra data + orario in Europe/Rome
 */
import { Box, Typography } from '@mui/material'
import type { FootballMatch, FootballTeam } from '~/schemas/football'
import { formatMatchDate, formatMatchTime } from './footballUtils'

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TeamLogo({ crest, name }: { crest: string | null; name: string }) {
  if (!crest) return <Box sx={{ width: { xs: 20, sm: 24 }, flexShrink: 0 }} />
  return (
    <Box
      component="img"
      src={crest}
      alt={`Stemma ${name}`}
      sx={{
        width: { xs: 20, sm: 24 },
        height: { xs: 20, sm: 24 },
        objectFit: 'contain',
        flexShrink: 0,
      }}
    />
  )
}

/**
 * Mostra nome completo (shortName/name) su sm+
 * e sigla TLA (o abbreviazione) su xs.
 */
function TeamName({ team }: { team: FootballTeam }) {
  const fullLabel = team.shortName ?? team.name
  const shortLabel =
    team.tla ??
    (team.shortName?.slice(0, 3).toUpperCase() ??
      team.name.slice(0, 3).toUpperCase())

  return (
    <>
      <Typography
        variant="body2"
        noWrap
        sx={{
          fontWeight: 600,
          fontSize: '0.875rem',
          display: { xs: 'none', sm: 'block' },
        }}
      >
        {fullLabel}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          fontSize: '0.75rem',
          display: { xs: 'block', sm: 'none' },
        }}
      >
        {shortLabel}
      </Typography>
    </>
  )
}

// ---------------------------------------------------------------------------
// FootballMatchRow
// ---------------------------------------------------------------------------

interface FootballMatchRowProps {
  match: FootballMatch
}

export default function FootballMatchRow({ match }: FootballMatchRowProps) {
  const { homeTeam, awayTeam, score, status, utcDate } = match
  const isFinished = status === 'finished'

  const centerContent = isFinished ? (
    /* Risultato finale */
    <Box
      aria-label={`${score.fullTime.home ?? '-'} a ${score.fullTime.away ?? '-'}`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        minWidth: { xs: 52, sm: 64 },
        justifyContent: 'center',
      }}
    >
      <Typography
        variant="body1"
        sx={{ fontWeight: 800, fontSize: { xs: '0.95rem', sm: '1.05rem' } }}
      >
        {score.fullTime.home ?? '–'}
      </Typography>
      <Typography sx={{ fontWeight: 700, color: 'text.disabled', fontSize: '0.875rem' }}>
        –
      </Typography>
      <Typography
        variant="body1"
        sx={{ fontWeight: 800, fontSize: { xs: '0.95rem', sm: '1.05rem' } }}
      >
        {score.fullTime.away ?? '–'}
      </Typography>
    </Box>
  ) : (
    /* Data / orario */
    <Box
      sx={{
        minWidth: { xs: 52, sm: 64 },
        textAlign: 'center',
      }}
    >
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          color: 'primary.main',
          fontSize: { xs: '0.8rem', sm: '0.875rem' },
          lineHeight: 1.1,
        }}
      >
        {formatMatchTime(utcDate)}
      </Typography>
      <Typography
        variant="caption"
        sx={{ color: 'text.secondary', display: 'block', fontSize: '0.65rem', mt: 0.25 }}
      >
        {formatMatchDate(utcDate)}
      </Typography>
    </Box>
  )

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        py: 1.25,
        px: { xs: 1.5, sm: 2 },
      }}
    >
      {/* Home team — allineato a destra */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          flex: 1,
          justifyContent: 'flex-end',
          overflow: 'hidden',
        }}
      >
        <TeamName team={homeTeam} />
        <TeamLogo crest={homeTeam.crest} name={homeTeam.name} />
      </Box>

      {/* Centro: risultato o orario */}
      <Box sx={{ mx: { xs: 1, sm: 1.5 }, flexShrink: 0 }}>{centerContent}</Box>

      {/* Away team — allineato a sinistra */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.75,
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <TeamLogo crest={awayTeam.crest} name={awayTeam.name} />
        <TeamName team={awayTeam} />
      </Box>
    </Box>
  )
}
