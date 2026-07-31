/**
 * LatestMatches — ultimi risultati Serie A.
 *
 * Server component: riceve partite già filtrate (status "finished")
 * e ordinate per data decrescente dal service.
 */
import { Box, Divider, Typography } from '@mui/material'
import { CheckCircleOutline } from '@mui/icons-material'
import type { FootballMatch } from '~/schemas/football'
import FootballSectionCard from './FootballSectionCard'
import FootballMatchRow from './FootballMatchRow'

// ---------------------------------------------------------------------------
// LatestMatches
// ---------------------------------------------------------------------------

interface LatestMatchesProps {
  matches: FootballMatch[]
  matchday: number
}

export default function LatestMatches({
  matches,
  matchday,
}: LatestMatchesProps) {
  return (
    <FootballSectionCard
      title="Ultimi risultati"
      subtitle={`Giornata ${matchday}`}
      icon={
        <CheckCircleOutline sx={{ color: 'primary.main', fontSize: '1.1rem' }} />
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
            Nessun risultato disponibile per questa giornata
          </Typography>
        </Box>
      ) : (
        <Box component="ul" role="list" sx={{ m: 0, p: 0, listStyle: 'none' }}>
          {matches.map((match, idx) => (
            <Box
              key={match.id}
              component="li"
              role="listitem"
              aria-label={`${match.homeTeam.name} ${match.score.fullTime.home ?? '–'} – ${match.score.fullTime.away ?? '–'} ${match.awayTeam.name}`}
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
