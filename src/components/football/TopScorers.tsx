/**
 * TopScorers — classifica marcatori Serie A.
 *
 * Server component: riceve scorer già ordinati per goal decrescente.
 * Mostra: rank, avatar/fallback, nome giocatore, squadra, goal, assists.
 * Layout 2 colonne su md+ per contenere fino a 20 voci senza scroll eccessivo.
 */
import { Avatar, Box, Grid, Typography } from '@mui/material'
import { EmojiEvents } from '@mui/icons-material'
import type { FootballScorer } from '~/schemas/football'
import FootballSectionCard from './FootballSectionCard'

// ---------------------------------------------------------------------------
// ScorerRow
// ---------------------------------------------------------------------------

interface ScorerRowProps {
  scorer: FootballScorer
  rank: number
}

function ScorerRow({ scorer, rank }: ScorerRowProps) {
  const { player, team, goals, assists } = scorer

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        py: 1.25,
        px: { xs: 1.5, sm: 2 },
      }}
    >
      {/* Rank */}
      <Typography
        variant="body2"
        sx={{
          fontWeight: 700,
          color: 'text.disabled',
          width: 20,
          textAlign: 'center',
          flexShrink: 0,
          fontSize: '0.75rem',
        }}
      >
        {rank}
      </Typography>

      {/* Avatar — foto se disponibile, altrimenti iniziale */}
      <Avatar
        src={player.photo ?? undefined}
        alt={player.name}
        sx={{ width: 36, height: 36, flexShrink: 0, fontSize: '0.85rem' }}
      >
        {player.name.charAt(0)}
      </Avatar>

      {/* Info giocatore */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          noWrap
          sx={{ fontWeight: 600, lineHeight: 1.2, fontSize: '0.875rem' }}
        >
          {player.name}
        </Typography>
        <Typography
          variant="caption"
          sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.3 }}
        >
          {team.shortName ?? team.name}
        </Typography>
      </Box>

      {/* Statistiche: goal + assists */}
      <Box
        sx={{
          display: 'flex',
          gap: { xs: 1, sm: 2 },
          flexShrink: 0,
          alignItems: 'center',
        }}
      >
        <Box sx={{ textAlign: 'center', minWidth: 32 }}>
          <Typography
            variant="body1"
            sx={{
              fontWeight: 800,
              lineHeight: 1,
              color: 'primary.main',
              fontSize: { xs: '1rem', sm: '1.1rem' },
            }}
          >
            {goals}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: 'text.disabled',
              fontSize: '0.6rem',
              display: 'block',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            gol
          </Typography>
        </Box>
        {assists !== null && (
          <Box sx={{ textAlign: 'center', minWidth: 28 }}>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, lineHeight: 1, fontSize: '0.9rem' }}
            >
              {assists}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: 'text.disabled',
                fontSize: '0.6rem',
                display: 'block',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              ass
            </Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// TopScorers
// ---------------------------------------------------------------------------

interface TopScorersProps {
  scorers: FootballScorer[]
}

export default function TopScorers({ scorers }: TopScorersProps) {
  return (
    <FootballSectionCard
      title="Classifica marcatori"
      icon={
        <EmojiEvents sx={{ color: 'primary.main', fontSize: '1.1rem' }} />
      }
    >
      {scorers.length === 0 ? (
        <Box sx={{ py: 5, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Nessuna statistica marcatori disponibile
          </Typography>
        </Box>
      ) : (
        /**
         * 2 colonne su md+: i marcatori vengono distribuiti così la lista
         * non occupa eccessiva altezza su desktop.
         *
         * Divisore: borderBottom su ogni riga tranne l'ultima.
         * Su xs (1 colonna) è corretto per default;
         * su md (2 colonne) l'ultimo elemento di ciascuna colonna
         * non ha il bordo inferiore grazie al check idx+2 >= length.
         */
        <Grid container>
          {scorers.map((scorer, idx) => {
            const isLeftCol = idx % 2 === 0
            // Mostra bordo basso se c'è un altro elemento nella stessa colonna
            const hasNextInCol = idx + 2 < scorers.length
            // Su xs mostra sempre bordo tranne sull'ultimo
            const showBorder = idx < scorers.length - 1

            return (
              <Grid
                item
                key={scorer.player.id}
                xs={12}
                md={6}
                sx={{
                  borderBottom: {
                    xs: showBorder ? 1 : 0,
                    md: hasNextInCol ? 1 : 0,
                  },
                  borderRight: {
                    md:
                      isLeftCol && idx + 1 < scorers.length ? 1 : 0,
                  },
                  borderColor: 'divider',
                }}
              >
                <ScorerRow scorer={scorer} rank={idx + 1} />
              </Grid>
            )
          })}
        </Grid>
      )}
    </FootballSectionCard>
  )
}
