/* eslint-disable @typescript-eslint/no-unsafe-member-access */
'use client'
import { api } from '~/utils/api'
import {
  Avatar,
  Box,
  Chip,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import {
  AccountBalanceWallet,
  EmojiEvents,
  Group,
  MilitaryTech,
  MonetizationOn,
  RemoveCircleOutline,
  TrendingDown,
  TrendingUp,
} from '@mui/icons-material'
import { formatCurrency } from '~/utils/numberUtils'
import { GenericCard } from '~/components/cards'

// Percentuali premi
const PERC_PRIMO = 52
const PERC_SECONDO = 20
const PERC_TERZO = 13
const PERC_CHAMPIONS = 15

function calcolaPercentuale(somma: number, percentuale: number): number {
  return Math.round((somma * percentuale) / 100)
}

function MetricBox({
  label,
  value,
  icon,
  color = 'primary',
}: {
  label: string
  value: string
  icon: React.ReactNode
  color?: 'primary' | 'success' | 'error' | 'warning' | 'info'
}) {
  const theme = useTheme()
  return (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        borderLeft: `4px solid ${theme.palette[color].main}`,
        height: '100%',
      }}
    >
      <Box sx={{ color: `${color}.main`, display: 'flex' }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
          {value}
        </Typography>
      </Box>
    </Paper>
  )
}

function PremioRow({ label, value, perc }: { label: string; value: number; perc: number }) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 0.75,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Chip label={`${perc}%`} size="small" variant="outlined" color="primary" sx={{ fontSize: '0.7rem', height: 20 }} />
        <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 90, textAlign: 'right' }}>
          {formatCurrency(value)}
        </Typography>
      </Box>
    </Box>
  )
}

export default function Economia() {
  const theme = useTheme()

  const detrazioneSito = parseFloat(process.env.NEXT_PUBLIC_COSTI_DOMINIO ?? '0')

  const economiaList = api.squadre.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const saldoData = api.economia.getSaldoSquadre.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const importoAnnuale = economiaList.data?.reduce((acc, item) => acc + (item.importoAnnuale ?? 0), 0) ?? 0
  const importoMulte = economiaList.data?.reduce((acc, item) => acc + (item.importoMulte ?? 0), 0) ?? 0
  const importoMercato = economiaList.data?.reduce((acc, item) => acc + (item.importoMercato ?? 0), 0) ?? 0
  const montepremi = importoAnnuale + importoMercato + importoMulte - detrazioneSito

  const classificaMap: Record<number, number> = saldoData.data?.classificaMap ?? {}
  const idVincitriceChampions = saldoData.data?.idVincitriceChampions ?? null
  const finaleGiocata = saldoData.data?.finaleGiocata ?? false

  function getPremio(idSquadra: number): number {
    let premio = 0
    const pos = classificaMap[idSquadra]
    if (pos === 1) premio += calcolaPercentuale(montepremi, PERC_PRIMO)
    else if (pos === 2) premio += calcolaPercentuale(montepremi, PERC_SECONDO)
    else if (pos === 3) premio += calcolaPercentuale(montepremi, PERC_TERZO)
    if (idVincitriceChampions === idSquadra) premio += calcolaPercentuale(montepremi, PERC_CHAMPIONS)
    return premio
  }

  function getPremiVinti(idSquadra: number): { label: string; color: 'warning' | 'info' | 'default' }[] {
    const premi: { label: string; color: 'warning' | 'info' | 'default' }[] = []
    const pos = classificaMap[idSquadra]
    if (pos === 1) premi.push({ label: '1° Classificato', color: 'warning' })
    else if (pos === 2) premi.push({ label: '2° Classificato', color: 'default' })
    else if (pos === 3) premi.push({ label: '3° Classificato', color: 'default' })
    if (idVincitriceChampions === idSquadra) premi.push({ label: 'Vincitore Champions', color: 'info' })
    return premi
  }

  const isLoading = economiaList.isLoading || saldoData.isLoading

  return (
    <Stack spacing={2}>
      {/* Metric boxes */}
      <Grid container spacing={1.5}>
        <Grid item xs={6} sm={3}>
          <MetricBox label="Montepremi totale" value={formatCurrency(montepremi)} icon={<AccountBalanceWallet />} color="primary" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <MetricBox label="Totale quote" value={formatCurrency(importoAnnuale)} icon={<MonetizationOn />} color="info" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <MetricBox label="Squadre partecipanti" value={String(economiaList.data?.length ?? 0)} icon={<Group />} color="warning" />
        </Grid>
        <Grid item xs={6} sm={3}>
          <MetricBox label="Detrazione sito" value={formatCurrency(detrazioneSito)} icon={<RemoveCircleOutline />} color="error" />
        </Grid>
      </Grid>

      {/* Cards: Riepilogo + Premi */}
      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={6}>
          <GenericCard title="Riepilogo versamenti" titleVariant="h6" avatar={<MonetizationOn color="primary" />} showHeaderDivider>
            <Stack spacing={0}>
              {[
                { label: 'Iscrizioni', value: importoAnnuale },
                { label: 'Multe', value: importoMulte },
                { label: 'Mercato di riparazione', value: importoMercato },
                { label: 'Detrazione sito', value: -detrazioneSito },
              ].map(({ label, value }) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.75, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: value < 0 ? 'error.main' : 'text.primary' }}>
                    {formatCurrency(value)}
                  </Typography>
                </Box>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Totale montepremi</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>{formatCurrency(montepremi)}</Typography>
              </Box>
            </Stack>
          </GenericCard>
        </Grid>

        <Grid item xs={12} sm={6}>
          <GenericCard title="Premi stagionali" titleVariant="h6" avatar={<EmojiEvents color="warning" />} showHeaderDivider>
            <Stack spacing={0}>
              <PremioRow label="1° Classificato" value={calcolaPercentuale(montepremi, PERC_PRIMO)} perc={PERC_PRIMO} />
              <PremioRow label="2° Classificato" value={calcolaPercentuale(montepremi, PERC_SECONDO)} perc={PERC_SECONDO} />
              <PremioRow label="3° Classificato" value={calcolaPercentuale(montepremi, PERC_TERZO)} perc={PERC_TERZO} />
              <PremioRow label="Vincitore Champions" value={calcolaPercentuale(montepremi, PERC_CHAMPIONS)} perc={PERC_CHAMPIONS} />
            </Stack>
          </GenericCard>
        </Grid>
      </Grid>

      {/* Squadre cards */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>Economia squadre</Typography>
        {!finaleGiocata && !isLoading && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
            * La finale Champions non è ancora stata giocata — il saldo è provvisorio.
          </Typography>
        )}
        <Grid container spacing={1.5}>
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                  <Skeleton variant="rounded" height={180} />
                </Grid>
              ))
            : [...(economiaList.data ?? [])]
                .sort((a, b) => getPremio(b.id) - getPremio(a.id))
                .map((squadra) => {
                const pagato = (squadra.importoAnnuale ?? 0) + (squadra.importoMulte ?? 0) + (squadra.importoMercato ?? 0)
                const premio = getPremio(squadra.id)
                const premiVinti = getPremiVinti(squadra.id)
                const saldo = premio - pagato
                const saldoPositivo = saldo > 0
                const saldoZero = saldo === 0

                return (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={squadra.id}>
                    <Paper
                      elevation={1}
                      sx={{
                        p: 2,
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                        borderTop: `3px solid ${saldoZero ? theme.palette.divider : saldoPositivo ? theme.palette.success.main : theme.palette.error.main}`,
                      }}
                    >
                      {/* Header: avatar + nome */}
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar src={squadra.foto ?? undefined} alt={squadra.presidente ?? ''} sx={{ width: 36, height: 36 }} />
                        <Box sx={{ overflow: 'hidden' }}>
                          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {squadra.squadra}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                            {squadra.presidente}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Stats grid */}
                      <Grid container spacing={0.5}>
                        {[
                          { label: 'Quota', value: formatCurrency(squadra.importoAnnuale ?? 0) },
                          { label: 'Multe', value: formatCurrency(squadra.importoMulte ?? 0) },
                          { label: 'Mercato', value: formatCurrency(squadra.importoMercato ?? 0) },
                          { label: 'Fantamilioni', value: squadra.fantamilioni != null ? `${squadra.fantamilioni} M` : '—' },
                        ].map(({ label, value }) => (
                          <Grid item xs={6} key={label}>
                            <Box sx={{ bgcolor: 'action.hover', borderRadius: 1, px: 1, py: 0.5 }}>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', display: 'block' }}>
                                {label}
                              </Typography>
                              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.78rem' }}>
                                {value}
                              </Typography>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>

                      {/* Premi vinti */}
                      {premiVinti.length > 0 && (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {premiVinti.map((p) => (
                            <Chip
                              key={p.label}
                              size="small"
                              icon={<MilitaryTech fontSize="small" />}
                              label={p.label}
                              color={p.color}
                              variant="filled"
                              sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                            />
                          ))}
                        </Box>
                      )}

                      {/* Saldo */}
                      <Box sx={{ mt: 'auto' }}>
                        <Tooltip title={!finaleGiocata ? 'Provvisorio: finale Champions non ancora giocata' : saldoPositivo ? 'Importo da ricevere' : 'Importo da pagare'}>
                          <Chip
                            size="small"
                            icon={
                              saldoZero
                                ? <RemoveCircleOutline fontSize="small" />
                                : saldoPositivo
                                  ? <TrendingUp fontSize="small" />
                                  : <TrendingDown fontSize="small" />
                            }
                            label={`${saldoPositivo ? '+' : saldoZero ? '' : '-'}${formatCurrency(Math.abs(saldo))}${!finaleGiocata ? ' *' : ''}`}
                            color={saldoZero ? 'default' : saldoPositivo ? 'success' : 'error'}
                            variant="outlined"
                            sx={{ fontWeight: 700, fontSize: '0.78rem', width: '100%', justifyContent: 'flex-start' }}
                          />
                        </Tooltip>
                      </Box>
                    </Paper>
                  </Grid>
                )
              })}
        </Grid>
      </Box>
    </Stack>
  )
}

