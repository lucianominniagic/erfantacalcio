'use client'

import { Box, Chip, List, ListItem, Stack, Typography } from '@mui/material'
import { type RouterOutputs } from '~/utils/api'

type GiocatoreStats = RouterOutputs['giocatori']['listStatistiche'][number]

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
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary">Caricamento...</Typography>
      </Box>
    )
  }

  return (
    <List disablePadding>
      {giocatori.map((g, idx) => (
        <ListItem key={g.id} divider sx={{ px: 1, py: 0.75 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} width="100%">
            {/* Rank */}
            <Typography
              variant="body2"
              color="text.disabled"
              sx={{ minWidth: 32, textAlign: 'right', fontWeight: 700, display: { xs: 'none', sm: 'block' } }}
            >
              #{idx + 1}
            </Typography>

            {/* Maglia */}
            {g.maglia ? (
              <img
                src={g.maglia}
                width={24}
                height={21}
                alt={g.squadraSerieA ?? ''}
                title={g.squadraSerieA ?? ''}
                style={{ objectFit: 'contain' }}
              />
            ) : (
              <Box sx={{ width: 24, height: 21 }} />
            )}

            {/* Nome + Squadra */}
            <Stack flex={1} spacing={0} overflow="hidden">
              <Typography
                variant="body2"
                fontWeight={700}
                noWrap
                sx={{
                  cursor: 'pointer',
                  color: 'primary.main',
                  '&:hover': { textDecoration: 'underline' },
                }}
                onClick={() => onNomeClick(g.id)}
              >
                {g.nome}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {g.squadra ?? 'Svincolato'}
              </Typography>
            </Stack>

            {/* Media — stat principale prominente */}
            <Typography
              variant="h6"
              sx={{
                minWidth: 52,
                textAlign: 'right',
                color: 'primary.main',
                fontWeight: 800,
                lineHeight: 1,
              }}
            >
              {g.media != null ? Number(g.media).toFixed(2) : '—'}
            </Typography>

            {/* Pillole statistiche secondarie */}
            <Stack
              direction="row"
              spacing={0.5}
              flexWrap="wrap"
              justifyContent="flex-end"
            >
              {ruolo === 'P' ? (
                <Chip
                  size="small"
                  label={`GS: ${g.golsubiti ?? 0}`}
                  color="error"
                  variant="outlined"
                />
              ) : (
                <Chip
                  size="small"
                  label={`GF: ${g.golfatti ?? 0}`}
                  color="success"
                  variant="outlined"
                />
              )}
              { ruolo !== 'P' && (
                <Chip
                  size="small"
                  label={`AS: ${g.assist ?? 0}`}
                  color="info"
                  variant="outlined"
                />
              )}
              <Chip
                size="small"
                label={`P: ${g.giocate ?? 0}`}
                variant="outlined"
                sx={{ display: { xs: 'none', sm: 'flex' } }}
              />
            </Stack>
          </Stack>
        </ListItem>
      ))}
    </List>
  )
}
