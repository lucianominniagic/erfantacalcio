'use client'
import {
  Avatar,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import {
  EmojiEvents,
  Home,
  Shield,
  SportsSoccer,
  TrendingDown,
  TrendingUp,
} from '@mui/icons-material'
import { api } from '~/utils/api'

interface RiepilogoSquadreProps {
  idTornei: number[]
}

interface StatRowProps {
  icon: React.ReactNode
  label: string
  value: React.ReactNode
}

function StatRow({ icon, label, value }: StatRowProps) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 0.4, minHeight: 36 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary', flexShrink: 0 }}>
        {icon}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ minWidth: 90 }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '0.85rem', fontWeight: 600, flex: 1, textAlign: 'right', fontFamily: 'monospace', color: 'primary.main' }}>
        {value}
      </Typography>
    </Stack>
  )
}

export default function RiepilogoSquadre({ idTornei }: RiepilogoSquadreProps) {
  const riepilogo = api.statisticheSquadre.riepilogo.useQuery(
    { idTornei },
    {
      enabled: idTornei.length > 0,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )

  if (riepilogo.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  const data = riepilogo.data ?? []

  if (data.length === 0) {
    return (
      <Typography sx={{ pt: 2 }} color="text.secondary">
        Nessun dato disponibile.
      </Typography>
    )
  }

  return (
    <Box sx={{ pt: 2 }}>
      <Grid container spacing={2}>
        {data.map((s, idx) => (
          <Grid item xs={12} sm={6} md={4} key={s.idSquadra}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                {/* Header: rank + avatar + nome */}
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                  {s.foto ? (
                    <Avatar src={s.foto} sx={{ width: 32, height: 32 }} />
                  ) : (
                    <Avatar sx={{ width: 32, height: 32 }}>{s.squadra.charAt(0)}</Avatar>
                  )}
                  <Typography variant="h6" sx={{ fontSize: '0.95rem', fontWeight: 700, flex: 1 }}>
                    {s.squadra}
                  </Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
                  <Stack direction="row" spacing={0.5}>
                    <Chip label={`${s.vittorie} V`} size="small" color="success" sx={{ fontSize: '0.7rem', height: 20 }} />
                    <Chip label={`${s.pareggi} N`} size="small" sx={{ fontSize: '0.7rem', height: 20 }} />
                    <Chip label={`${s.sconfitte} P`} size="small" color="error" sx={{ fontSize: '0.7rem', height: 20 }} />
                  </Stack>
                </Stack>

                <Divider sx={{ mb: 0.5 }} />

                {/* Fantapunti */}
                <StatRow
                  icon={<TrendingUp fontSize="small" />}
                  label="Media FP"
                  value={s.mediaFantapunti}
                />
                <StatRow
                  icon={<EmojiEvents fontSize="small" />}
                  label="Miglior FP"
                  value={
                    s.miglioreFantapunti != null
                      ? `${s.miglioreFantapunti} (G${s.miglioreGiornata})`
                      : '—'
                  }
                />
                <StatRow
                  icon={<TrendingDown fontSize="small" />}
                  label="Peggior FP"
                  value={
                    s.peggioreFantapunti != null
                      ? `${s.peggioreFantapunti} (G${s.peggioreGiornata})`
                      : '—'
                  }
                />

                <Divider sx={{ my: 0.5 }} />

                {/* Gol */}
                <StatRow
                  icon={<SportsSoccer fontSize="small" />}
                  label="Gol fatti"
                  value={s.mediaGolFatti}
                />
                <StatRow
                  icon={<SportsSoccer fontSize="small" sx={{ opacity: 0.5 }} />}
                  label="Gol subiti"
                  value={s.mediaGolSubiti}
                />
                <StatRow
                  icon={<Shield fontSize="small" />}
                  label="Clean sheet"
                  value={s.cleanSheet}
                />

                <Divider sx={{ my: 0.5 }} />

                {/* Casa / trasferta */}
                <StatRow
                  icon={<Home fontSize="small" />}
                  label="% W casa"
                  value={`${s.percVittorieCasa}%`}
                />
                <StatRow
                  icon={<Home fontSize="small" sx={{ opacity: 0.5 }} />}
                  label="% W trasf."
                  value={`${s.percVittorieTrasferta}%`}
                />

                {(s.miglioreVittoria ?? s.peggioreSconfitta) && (
                  <>
                    <Divider sx={{ my: 0.5 }} />
                    {s.miglioreVittoria && (
                      <StatRow
                        icon={<TrendingUp fontSize="small" color="success" />}
                        label="Miglior W"
                        value={<Typography component="span" sx={{ fontSize: '0.75rem', fontFamily: 'inherit' }}>{s.miglioreVittoria}</Typography>}
                      />
                    )}
                    {s.peggioreSconfitta && (
                      <StatRow
                        icon={<TrendingDown fontSize="small" color="error" />}
                        label="Peggior L"
                        value={<Typography component="span" sx={{ fontSize: '0.75rem', fontFamily: 'inherit' }}>{s.peggioreSconfitta}</Typography>}
                      />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
