/**
 * NextMatches — prossime partite Serie A.
 *
 * Server component: riceve partite già filtrate (status "scheduled"/"timed")
 * e ordinate per data crescente dal service.
 */
import { Box, Divider, Typography } from '@mui/material'
import { CalendarMonth } from '@mui/icons-material'
import type { FootballMatch } from '~/schemas/football'
import FootballSectionCard from './FootballSectionCard'
import FootballMatchRow from './FootballMatchRow'

// ---------------------------------------------------------------------------
// NextMatches
// ---------------------------------------------------------------------------

interface NextMatchesProps {
  matches: FootballMatch[]
  /** Giornata successiva a quella corrente */
  nextMatchday: number
}

export default function NextMatches({ matches, nextMatchday }: NextMatchesProps) {
  return (
    <FootballSectionCard
      title="Prossime partite"
      subtitle={`Giornata ${nextMatchday}`}
      icon={
        <CalendarMonth sx={{ color: 'primary.main', fontSize: '1.1rem' }} />
      }
    >
      {matches.length === 0 ? (
        <Box
          sx={{
            py: 5,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Nessuna partita in programma
          </Typography>
        </Box>
      ) : (
        <Box component="ul" role="list" sx={{ m: 0, p: 0, listStyle: 'none' }}>
          {matches.map((match, idx) => (
            <Box
              key={match.id}
              component="li"
              role="listitem"
              aria-label={`${match.homeTeam.name} vs ${match.awayTeam.name}`}
            >
              <FootballMatchRow match={match} />
              {idx < matches.length - 1 && <Divider />}
            </Box>
          ))}
        </Box>
      )}
    </FootballSectionCard>
  )
}
