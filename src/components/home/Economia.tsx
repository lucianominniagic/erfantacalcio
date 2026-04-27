/* eslint-disable @typescript-eslint/no-unsafe-member-access */
'use client'
import { api } from '~/utils/api'
import {
  Avatar,
  Box,
  Grid,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { autosizeOptions } from '~/utils/datatable'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { formatCurrency } from '~/utils/numberUtils'
import { GenericCard } from '~/components/cards'

export default function Economia() {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))
  const economiaList = api.squadre.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const importoAnnuale =
    economiaList?.data?.reduce(
      (acc, item) => acc + (item.importoAnnuale || 0),
      0,
    ) ?? 0
  const importoMulte =
    economiaList?.data?.reduce(
      (acc, item) => acc + (item.importoMulte || 0),
      0,
    ) ?? 0
  const importoMercato =
    economiaList?.data?.reduce(
      (acc, item) => acc + (item.importoMercato || 0),
      0,
    ) ?? 0
  const detrazioneSito = parseFloat(
    process.env.NEXT_PUBLIC_COSTI_DOMINIO ?? '-1',
  )

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
      width: 130,
      valueGetter: (value) => value,
      valueFormatter: (value?: number) =>
        value != null ? formatCurrency(value) : '',
    },
    {
      field: 'importoMulte',
      type: 'number',
      align: 'right',
      renderHeader: () => <strong>Multe</strong>,
      width: 130,
      valueGetter: (value) => value,
      valueFormatter: (value?: number) =>
        value != null ? formatCurrency(value) : '',
    },
    {
      field: 'importoMercato',
      type: 'number',
      align: 'right',
      renderHeader: () => <strong>Mercato</strong>,
      width: 130,
      valueGetter: (value) => value,
      valueFormatter: (value?: number) =>
        value != null ? formatCurrency(value) : '',
    },
    {
      field: 'fantamilioni',
      type: 'number',
      align: 'right',
      renderHeader: () => <strong>Fantamilioni</strong>,
      width: 130,
    },
  ]

  // Inserisce la colonna "foto" in posizione [1] solo se !isXs
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

  const skeletonRows = Array.from({ length: pageSize }, (_, index) => ({
    id: `skeleton-${index}`,
  }))

  return (
    <Grid container spacing={0}>
      <Grid item xs={12} sm={6} lg={6} paddingInlineEnd={isXs ? 0 : 1}>
        <GenericCard
          title="Riepilogo"
          titleVariant="h5"
        >
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Importo annuale iscrizioni: {formatCurrency(importoAnnuale)}{' '}
            <br></br>
            Importo multe: {formatCurrency(importoMulte)} <br></br>
            Importo mercato di riparazione: {formatCurrency(
              importoMercato,
            )}{' '}
            <br></br>
            Detrazione sito: {formatCurrency(detrazioneSito)} <br></br>
          </Typography>
        </GenericCard>
      </Grid>
      <Grid item xs={12} sm={6} lg={6} paddingInlineStart={isXs ? 0 : 1}>
        <GenericCard
          title="Premi stagionali"
          titleVariant="h5"
        >
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            1° Classificato:{' '}
            {formatCurrency(
              calcolaPercentuale(
                importoAnnuale + importoMercato + importoMulte - detrazioneSito,
                52,
              ),
            )}{' '}
            <br></br>
            2° Classificato:{' '}
            {formatCurrency(
              calcolaPercentuale(
                importoAnnuale + importoMercato + importoMulte - detrazioneSito,
                20,
              ),
            )}{' '}
            <br></br>
            3° Classificato:{' '}
            {formatCurrency(
              calcolaPercentuale(
                importoAnnuale + importoMercato + importoMulte - detrazioneSito,
                13,
              ),
            )}{' '}
            <br></br>
            Vincitore Champions:{' '}
            {formatCurrency(
              calcolaPercentuale(
                importoAnnuale + importoMercato + importoMulte - detrazioneSito,
                15,
              ),
            )}{' '}
            <br></br>
          </Typography>
        </GenericCard>
      </Grid>
      <Grid item xs={12} xl={12} sm={12} lg={12}>
        <br></br>
      </Grid>
      <Grid item xs={12} xl={12} sm={12} lg={12}>
        <Typography variant="h5">Economia squadre</Typography>
        <Box sx={{ width: '100%', overflowX: 'auto', contain: 'inline-size' }}>
          <DataGrid
            columnHeaderHeight={45}
            rowHeight={40}
            loading={economiaList.isLoading}
            initialState={{
              columns: {
                columnVisibilityModel: {
                  id: false,
                },
              },
              pagination: undefined,
              filter: undefined,
              density: 'compact',
            }}
            slotProps={{
              loadingOverlay: {
                variant: 'skeleton',
              },
            }}
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
            sx={{
              backgroundColor: theme.palette.background.paper,
              '& .MuiDataGrid-columnHeader': {
                color: theme.palette.primary.light,
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          />
        </Box>
      </Grid>
    </Grid>
  )
}

function calcolaPercentuale(somma: number, percentuale: number): number {
  return Math.round((somma * percentuale) / 100)
}
