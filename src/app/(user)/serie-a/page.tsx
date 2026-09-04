/**
 * /serie-a — pagina pubblica Serie A
 *
 * Server Component: chiama direttamente getSerieAOverview() (no round-trip HTTP).
 * Revalidate ogni ora via ISR.
 *
 * Struttura:
 *  - header (icona + titolo stagione + giornata)
 *  - SerieAStandings  (classifica, larghezza piena)
 *  - LatestMatches + NextMatches (affiancate su md+)
 *  - TopScorers (larghezza piena)
 *
 * Errori: propagati all'error.tsx locale → UX dedicata senza rompere il layout globale.
 */
import { Box, Grid, Typography } from '@mui/material'
import { SportsSoccer } from '@mui/icons-material'
import { getSerieAOverview } from '~/server/football/football.service'
import SerieAStandings from '~/components/football/SerieAStandings'
import LatestMatches from '~/components/football/LatestMatches'
import NextMatches from '~/components/football/NextMatches'
import TopScorers from '~/components/football/TopScorers'
import { formatSeason } from '~/components/football/footballUtils'

export const revalidate = 3600
export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Serie A — ErFantacalcio',
  description:
    'Classifica, ultimi risultati, prossime partite e marcatori della Serie A italiana.',
}

export default async function SerieAPage() {
  const overview = await getSerieAOverview()
  const { metadata: meta } = overview

  return (
    <Box>
      {/* ── Page header ────────────────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1,
          mb: 3,
        }}
      >
        <SportsSoccer sx={{ color: 'primary.main', fontSize: '1.6rem' }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          Serie A {formatSeason(meta.year)}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', ml: { xs: 0, sm: 1 } }}
        >
          Giornata {meta.currentMatchday}
        </Typography>
      </Box>

      {/* ── Content grid ───────────────────────────────────────────── */}
      <Grid container spacing={3}>
        {/* Classifica — larghezza piena */}
        <Grid item xs={12}>
          <SerieAStandings standings={overview.standings} />
        </Grid>

        {/* Ultimi risultati + Prossime partite, affiancate su md+ */}
        <Grid item xs={12} md={6}>
          <LatestMatches
            matches={overview.latestMatches}
            matchday={meta.currentMatchday}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <NextMatches
            matches={overview.nextMatches}
            nextMatchday={meta.currentMatchday + 1}
          />
        </Grid>

        {/* Marcatori — larghezza piena */}
        <Grid item xs={12}>
          <TopScorers scorers={overview.scorers} />
        </Grid>
      </Grid>
    </Box>
  )
}
