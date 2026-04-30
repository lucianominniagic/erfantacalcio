/* eslint-disable @typescript-eslint/no-unsafe-member-access */
'use client'
import { api } from '~/utils/api'
import {
  Avatar,
  Box,
  Chip,
  Grid,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  AccountBalanceWallet,
  EmojiEvents,
  Group,
  MonetizationOn,
  RemoveCircleOutline,
  TrendingDown,
  TrendingUp,
} from '@mui/icons-material'
import { autosizeOptions } from '~/utils/datatable'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
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
  const isXs = useMediaQuery(theme.breakpoints.down('md'))

  const detrazioneSito = parseFloat(process.env.NEXT_PUBLIC_COSTI_DOMINIO ?? '0')

  const economiaList = api.squadre.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const saldoData = api.economia.getSaldoSquadre.useQuery(
    { detrazioneSito },
    { refetchOnWindowFocus: false, refetchOnReconnect: false },
  )

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

  const columns: GridColDef[] = [
    { field: 'id', hideable: true },
    {
      field: 'squadra',
      type: 'string',
      align: 'left',
      renderHeader: () => <strong>Squadra</strong>,
      flex: isXs ? 0 : 1,
    },
    {
      field: 'presidente',
      type: 'string',
      align: 'left',
      renderHeader: () => <strong>Presidente</strong>,
      flex: isXs ? 0 : 1,
    },
    {
      field: 'importoAnnuale',
      type: 'number',
      align: 'right',
      renderHeader: () => <strong>Quota</strong>,
      width: 120,
      valueFormatter: (value?: number) => value != null ? formatCurrency(value) : '',
    },
    {
      field: 'importoMulte',
      type: 'number',
      align: 'right',
      renderHeader: () => <strong>Multe</strong>,
      width: 110,
      valueFormatter: (value?: number) => value != null ? formatCurrency(value) : '',
    },
    {
      field: 'importoMercato',
      type: 'number',
      align: 'right',
      renderHeader: () => <strong>Mercato</strong>,
      width: 110,
      valueFormatter: (value?: number) => value != null ? formatCurrency(value) : '',
    },
    {
      field: 'fantamilioni',
      type: 'number',
      align: 'right',
      renderHeader: () => <strong>Fantamilioni</strong>,
      width: 120,
    },
    {
      field: 'saldo',
      type: 'number',
      align: 'right',
      width: 160,
      renderHeader: () => (
        <Tooltip title={!finaleGiocata ? 'Finale Champions non ancora giocata' : ''}>
          <strong>
            Saldo{!finaleGiocata ? ' *' : ''}
          </strong>
        </Tooltip>
      ),
      valueGetter: (_value: unknown, row: { id: number; importoAnnuale?: number; importoMulte?: number; importoMercato?: number }) => {
        if (!saldoData.data) return null
        const pagato = (row.importoAnnuale ?? 0) + (row.importoMulte ?? 0) + (row.importoMercato ?? 0)
        const premio = getPremio(row.id)
        return premio - pagato
      },
      renderCell: (params) => {
        if (!saldoData.data || params.value === null) return null
        const saldo = params.value as number
        const isPositive = saldo > 0
        const isZero = saldo === 0
        return (
          <Chip
            size="small"
            icon={isZero ? <RemoveCircleOutline fontSize="small" /> : isPositive ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
            label={formatCurrency(Math.abs(saldo))}
            color={isZero ? 'default' : isPositive ? 'success' : 'error'}
            variant="outlined"
            sx={{ fontWeight: 600, fontSize: '0.75rem' }}
          />
        )
      },
    },
  ]

  if (!isXs) {
    columns.splice(1, 0, {
      field: 'foto',
      type: 'string',
      align: 'left',
      renderCell: (params) => (
        <Avatar
          src={params.row?.foto as string}
          alt={params.row?.presidente as string}
          sx={{ width: 24, height: 24 }}
        />
      ),
      renderHeader: () => '',
      width: 40,
    })
  }

  const pageSize = 8
  const skeletonRows = Array.from({ length: pageSize }, (_, index) => ({ id: `skeleton-${index}` }))

  return (
    <Stack spacing={2}>
      {/* Metric boxes */}
      <Grid container spacing={1.5}>
        <Grid item xs={6} sm={3}>
          <MetricBox
            label="Montepremi netto"
            value={formatCurrency(montepremi)}
            icon={<AccountBalanceWallet />}
            color="primary"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <MetricBox
            label="Totale quote"
            value={formatCurrency(importoAnnuale)}
            icon={<MonetizationOn />}
            color="info"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <MetricBox
            label="Squadre partecipanti"
            value={String(economiaList.data?.length ?? 0)}
            icon={<Group />}
            color="warning"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <MetricBox
            label="Detrazione sito"
            value={formatCurrency(detrazioneSito)}
            icon={<RemoveCircleOutline />}
            color="error"
          />
        </Grid>
      </Grid>

      {/* Cards: Riepilogo + Premi */}
      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={6}>
          <GenericCard
            title="Riepilogo versamenti"
            titleVariant="h6"
            avatar={<MonetizationOn color="primary" />}
            showHeaderDivider
          >
            <Stack spacing={0}>
              {[
                { label: 'Iscrizioni', value: importoAnnuale },
                { label: 'Multe', value: importoMulte },
                { label: 'Mercato di riparazione', value: importoMercato },
                { label: 'Detrazione sito', value: -detrazioneSito },
              ].map(({ label, value }) => (
                <Box
                  key={label}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    py: 0.75,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                    '&:last-child': { borderBottom: 'none' },
                  }}
                >
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: value < 0 ? 'error.main' : 'text.primary' }}
                  >
                    {formatCurrency(value)}
                  </Typography>
                </Box>
              ))}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>Totale montepremi</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {formatCurrency(montepremi)}
                </Typography>
              </Box>
            </Stack>
          </GenericCard>
        </Grid>

        <Grid item xs={12} sm={6}>
          <GenericCard
            title="Premi stagionali"
            titleVariant="h6"
            avatar={<EmojiEvents color="warning" />}
            showHeaderDivider
          >
            <Stack spacing={0}>
              <PremioRow label="1° Classificato" value={calcolaPercentuale(montepremi, PERC_PRIMO)} perc={PERC_PRIMO} />
              <PremioRow label="2° Classificato" value={calcolaPercentuale(montepremi, PERC_SECONDO)} perc={PERC_SECONDO} />
              <PremioRow label="3° Classificato" value={calcolaPercentuale(montepremi, PERC_TERZO)} perc={PERC_TERZO} />
              <PremioRow label="Vincitore Champions" value={calcolaPercentuale(montepremi, PERC_CHAMPIONS)} perc={PERC_CHAMPIONS} />
            </Stack>
          </GenericCard>
        </Grid>
      </Grid>

      {/* DataGrid */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>Economia squadre</Typography>
        {!finaleGiocata && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
            * La finale Champions non è ancora stata giocata — il saldo è provvisorio e non include il premio Champions.
          </Typography>
        )}
        <Box sx={{ width: '100%', overflowX: 'auto', contain: 'inline-size' }}>
          <DataGrid
            columnHeaderHeight={45}
            rowHeight={40}
            loading={economiaList.isLoading || saldoData.isLoading}
            initialState={{
              columns: { columnVisibilityModel: { id: false } },
              pagination: undefined,
              filter: undefined,
              density: 'compact',
            }}
            slotProps={{ loadingOverlay: { variant: 'skeleton' } }}
            checkboxSelection={false}
            disableColumnFilter={true}
            disableColumnMenu={true}
            disableColumnSelector={true}
            disableColumnSorting={true}
            disableColumnResize={true}
            hideFooter={true}
            hideFooterPagination={true}
            hideFooterSelectedRowCount={true}
            columns={columns}
            rows={economiaList.isLoading ? skeletonRows : economiaList.data}
            disableRowSelectionOnClick={true}
            autosizeOptions={autosizeOptions}
            sx={{ backgroundColor: theme.palette.background.paper }}
          />
        </Box>
      </Box>
    </Stack>
  )
}

