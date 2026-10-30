'use client'

import {
  Alert,
  Box,
  List,
  ListItem,
  ListItemButton,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { magliaRichiedeSfondoBianco } from '~/utils/maglia'
import type { GiocatoreStats } from '~/components/giocatori/giocatoriRanking'

interface GiocatoriRankingListProps {
  giocatori: GiocatoreStats[]
  isLoading: boolean
  onNomeClick: (id: number) => void
  ruolo: 'P' | 'D' | 'C' | 'A'
}

export default function GiocatoriRankingList({
  giocatori,
  isLoading,
  onNomeClick,
  ruolo,
}: GiocatoriRankingListProps) {
  if (isLoading) {
    return (
      <Stack
        spacing={1}
        sx={{ p: 2 }}
        aria-busy="true"
        aria-label="Caricamento giocatori"
      >
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} variant="rounded" height={88} />
        ))}
      </Stack>
    )
  }
  if (giocatori.length === 0)
    return (
      <Alert severity="info">Nessun giocatore corrisponde ai filtri.</Alert>
    )

  return (
    <List disablePadding aria-label="Statistiche giocatori">
      {giocatori.map((g, index) => (
        <ListItem key={g.id} disablePadding divider>
          <ListItemButton
            component="button"
            onClick={() => onNomeClick(g.id)}
            aria-label={`Apri statistiche di ${g.nome}`}
            sx={{
              width: '100%',
              textAlign: 'left',
              px: { xs: 1.5, sm: 2 },
              py: 1.5,
              gap: 1.5,
              overflowWrap: 'anywhere',
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ width: 20, flexShrink: 0 }}
            >
              {index + 1}
            </Typography>
            <Box
              sx={{
                width: 24,
                flexShrink: 0,
                display: { xs: 'none', sm: 'block' },
              }}
            >
              {g.maglia && (
                <Box
                  component="img"
                  src={g.maglia}
                  width={24}
                  height={21}
                  alt={g.squadraSerieA ?? ''}
                  sx={{
                    objectFit: 'contain',
                    bgcolor: magliaRichiedeSfondoBianco(g.maglia)
                      ? 'common.white'
                      : undefined,
                  }}
                />
              )}
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" fontWeight={800}>
                {g.nome}
              </Typography>
              <Typography
                variant="caption"
                color={g.squadra ? 'text.secondary' : 'success.main'}
              >
                {g.squadra ?? 'Svincolato'}
                {g.squadraSerieA ? ` · ${g.squadraSerieA}` : ''}
              </Typography>
              <Stack direction="row" flexWrap="wrap" gap={1.5} sx={{ mt: 0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {ruolo === 'P'
                    ? `${g.golsubiti ?? 0} gol subiti`
                    : `${g.golfatti ?? 0} gol`}
                </Typography>
                {ruolo !== 'P' && (
                  <Typography variant="caption" color="text.secondary">
                    {g.assist ?? 0} assist
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  {g.giocate ?? 0} presenze
                </Typography>
              </Stack>
            </Box>
            <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
              <Typography variant="caption" color="text.secondary">
                Media
              </Typography>
              <Typography variant="h3" component="p" color="primary.main">
                {g.media != null
                  ? Number(g.media).toLocaleString('it-IT', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })
                  : '—'}
              </Typography>
            </Box>
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  )
}
