'use client'
import {
  Avatar,
  Box,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import {
  EmojiEvents,
  MilitaryTech,
  Stars,
  WorkspacePremium,
} from '@mui/icons-material'
import { api } from '~/utils/api'
import { magliaType, ShirtTemplate } from '../selectColors'
import { ShirtSVG } from '../selectColors/shirtSVG'

type SquadraProps = {
  idSquadra: number
}

type TrophyBadgeProps = {
  count: number
  label: string
  icon: React.ReactNode
}

function TrophyBadge({ count, label, icon }: TrophyBadgeProps) {
  if (!count || count === 0) return null
  return (
    <Chip
      icon={<>{icon}</>}
      label={`${label}: ${count}`}
      size="small"
      sx={{
        bgcolor: 'rgba(255,255,255,0.18)',
        color: 'white',
        fontWeight: 'bold',
        border: '1px solid rgba(255,255,255,0.35)',
        '& .MuiChip-icon': { color: 'white' },
      }}
    />
  )
}

export default function Squadra({ idSquadra }: SquadraProps) {
  const apiSquadra = api.squadre.get.useQuery(
    { idSquadra },
    { refetchOnWindowFocus: false, refetchOnReconnect: false },
  )
  const apiAlbo = api.albo.get.useQuery(
    { idSquadra },
    { refetchOnWindowFocus: false, refetchOnReconnect: false },
  )

  const datiSquadra = apiSquadra.data
  const datiAlbo = apiAlbo.data
  const maglia = datiSquadra
    ? (JSON.parse(datiSquadra.maglia ?? '{}') as magliaType)
    : null

  if (apiSquadra.isLoading || apiAlbo.isLoading) {
    return (
      <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress color="warning" />
      </Box>
    )
  }

  if (!datiSquadra || !datiAlbo) return null

  const hasTrofei = datiAlbo.campionato || datiAlbo.champions || datiAlbo.secondo || datiAlbo.terzo
  const bgColor = maglia?.mainColor ?? '#1a237e'

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 3,
        mb: 2,
        background: `linear-gradient(135deg, ${bgColor}cc 0%, ${bgColor}99 100%)`,
        bgcolor: bgColor,
        boxShadow: 4,
      }}
    >
      {/* Overlay scuro per leggibilità */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          bgcolor: 'rgba(0,0,0,0.45)',
          zIndex: 0,
        }}
      />

      {/* Watermark maglia */}
      {maglia && (
        <Box
          sx={{
            position: 'absolute',
            bottom: -10,
            right: -10,
            zIndex: 1,
            pointerEvents: 'none',
          }}
        >
          <ShirtSVG
            template={maglia.selectedTemplate as ShirtTemplate}
            mainColor={maglia.mainColor}
            secondaryColor={maglia.secondaryColor}
            thirdColor={maglia.thirdColor}
            textColor={maglia.textColor}
            size={160}
            number={maglia.shirtNumber}
          />
        </Box>
      )}

      {/* Contenuto */}
      <Box sx={{ position: 'relative', zIndex: 2, p: { xs: 2, md: 3 } }}>
        <Grid container spacing={2} alignItems="center">

          {/* Foto presidente */}
          <Grid item xs="auto">
            <Avatar
              src={datiSquadra.foto ?? ''}
              sx={{
                width: { xs: 90, md: 130 },
                height: { xs: 90, md: 130 },
                border: '3px solid rgba(255,255,255,0.85)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
            />
          </Grid>

          {/* Nome squadra + presidente + trofei */}
          <Grid item xs>
            <Typography
              variant="h4"
              sx={{ color: 'white', fontWeight: 'bold', lineHeight: 1.2, textShadow: '0 2px 6px rgba(0,0,0,0.5)' }}
            >
              {datiSquadra.squadra}
            </Typography>
            <Typography
              variant="subtitle1"
              sx={{ color: 'rgba(255,255,255,0.8)', mt: 0.5, mb: 2 }}
            >
              {datiSquadra.presidente}
            </Typography>

            {hasTrofei ? (
              <Stack direction="row" flexWrap="wrap" gap={0.75}>
                <TrophyBadge
                  count={datiAlbo.campionato}
                  label="Campionato"
                  icon={<EmojiEvents fontSize="small" />}
                />
                <TrophyBadge
                  count={datiAlbo.champions}
                  label="Champions"
                  icon={<Stars fontSize="small" />}
                />
                <TrophyBadge
                  count={datiAlbo.secondo}
                  label="2° posto"
                  icon={<WorkspacePremium fontSize="small" />}
                />
                <TrophyBadge
                  count={datiAlbo.terzo}
                  label="3° posto"
                  icon={<MilitaryTech fontSize="small" />}
                />
              </Stack>
            ) : (
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)', fontStyle: 'italic' }}>
                Nessun trofeo ancora
              </Typography>
            )}
          </Grid>

        </Grid>
      </Box>
    </Box>
  )
}
