'use client'
import {
  Avatar,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import { EmojiEvents, ScoreOutlined, StarOutlined } from '@mui/icons-material'
import Image from 'next/image'
import { api } from '~/utils/api'

interface TopGiocatoriSquadreProps {
  idTornei: number[]
}

interface TopEntry {
  idGiocatore: number
  nome: string
  ruolo: string
  maglia: string | null
  squadraSerieA: string | null
  value: number
}

interface RowProps {
  icon: React.ReactNode
  label: string
  entry: TopEntry | null
  formatValue: (n: number) => string
}

function StatRow({ icon, label, entry, formatValue }: RowProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={1}
      sx={{ py: 0.5, minHeight: 44 }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
        {icon}
      </Box>
      <Box sx={{ minWidth: 70 }}>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
      {entry ? (
        <>
          {entry.maglia ? (
            <Image
              src={entry.maglia}
              width={22}
              height={20}
              alt={entry.squadraSerieA ?? ''}
              title={entry.squadraSerieA ?? ''}
            />
          ) : null}
          <Typography
            sx={{
              flex: 1,
              fontSize: '0.85rem',
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={entry.nome}
          >
            {entry.nome}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.85rem',
              fontWeight: 700,
              fontFamily: 'monospace',
              color: 'primary.main',
            }}
          >
            {formatValue(entry.value)}
          </Typography>
        </>
      ) : (
        <Typography variant="body2" color="text.disabled" sx={{ flex: 1 }}>
          —
        </Typography>
      )}
    </Stack>
  )
}

export default function TopGiocatoriSquadre({ idTornei }: TopGiocatoriSquadreProps) {
  const top = api.statisticheSquadre.topGiocatori.useQuery(
    { idTornei },
    {
      enabled: idTornei.length > 0,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )

  if (top.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  const data = top.data ?? []

  if (data.length === 0) {
    return (
      <Typography sx={{ pt: 2 }} color="text.secondary">
        Nessun dato disponibile.
      </Typography>
    )
  }

  return (
    <Box sx={{ pt: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Top giocatori per fantasquadra (calcolati sull&apos;intera stagione).
      </Typography>
      <Grid container spacing={2}>
        {data.map((s) => (
          <Grid item xs={12} sm={6} md={4} key={s.idSquadra}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                  {s.foto ? (
                    <Avatar src={s.foto} sx={{ width: 32, height: 32 }} />
                  ) : (
                    <Avatar sx={{ width: 32, height: 32 }}>
                      {s.squadra.charAt(0)}
                    </Avatar>
                  )}
                  <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
                    {s.squadra}
                  </Typography>
                </Stack>
                <Divider sx={{ mb: 1 }} />
                <StatRow
                  icon={<StarOutlined fontSize="small" sx={{ color: '#FFC107' }} />}
                  label="Top media"
                  entry={s.topMedia}
                  formatValue={(n) => n.toFixed(2)}
                />
                <StatRow
                  icon={<ScoreOutlined fontSize="small" sx={{ color: '#4CAF50' }} />}
                  label="Top bomber"
                  entry={s.topBomber}
                  formatValue={(n) => `${n} gol`}
                />
                <StatRow
                  icon={<EmojiEvents fontSize="small" sx={{ color: '#448AFF' }} />}
                  label="Top assist"
                  entry={s.topAssist}
                  formatValue={(n) => `${n} ass.`}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

