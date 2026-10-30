'use client'

import { Box, Stack, Typography, useTheme } from '@mui/material'
import { EmojiEvents } from '@mui/icons-material'
import { ChampionsBracketProps } from './types'
import SFCard from './SFCard'
import FinaleCard from './FinaleCard'
import { findRitorno, hasTeams } from './utils'

export default function ChampionsBracket({
  titolo,
  semifinaliAndata,
  semifinaliRitorno,
  finale,
}: ChampionsBracketProps) {
  const theme = useTheme()
  const championsColor = theme.palette.champions.main

  if (!semifinaliAndata || !hasTeams(semifinaliAndata.partite)) return null

  return (
    <Box component="section" aria-label={titolo} sx={{ mt: 2, minWidth: 0 }}>
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <EmojiEvents sx={{ color: championsColor }} />
        <Typography variant="h5" component="h2">
          {titolo}
        </Typography>
      </Stack>
      <Box
        role="region"
        aria-label={`Tabellone ${titolo}`}
        tabIndex={0}
        sx={{
          overflowX: 'auto',
          p: 0.5,
          '&:focus-visible': {
            outline: '2px solid',
            outlineColor: 'champions.main',
          },
        }}
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1fr) 32px minmax(270px, 1fr)',
            alignItems: 'center',
            minWidth: 622,
          }}
        >
          <Stack spacing={3}>
            <Typography variant="h6" component="h3">
              Semifinali
            </Typography>
            {semifinaliAndata.partite.slice(0, 2).map((partita, index) => (
              <SFCard
                key={partita.idPartita}
                numero={index + 1}
                andataPartita={partita}
                ritornoPartita={findRitorno(
                  partita,
                  semifinaliRitorno?.partite,
                )}
                andataIsGiocata={semifinaliAndata.isGiocata}
                ritornoIsGiocata={semifinaliRitorno?.isGiocata ?? false}
                andataIdCalendario={semifinaliAndata.idCalendario}
                ritornoIdCalendario={semifinaliRitorno?.idCalendario}
                championsColor={championsColor}
              />
            ))}
          </Stack>
          <Box
            aria-hidden="true"
            sx={{ borderTop: 1, borderColor: 'champions.main' }}
          />
          <FinaleCard finaleGiornata={finale} championsColor={championsColor} />
        </Box>
      </Box>
    </Box>
  )
}
