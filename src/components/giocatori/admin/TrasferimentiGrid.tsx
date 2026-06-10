'use client'
import { Box, Typography } from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { DataGrid, GridActionsCellItem, type GridColDef } from '@mui/x-data-grid'
import { BarChartOutlined } from '@mui/icons-material'
import { type trasferimentoListType } from '~/types/trasferimenti'
import { Configurazione } from '~/config'
import LoadingSpinner from '~/components/LinearProgressBar/LoadingSpinner'

const PAGE_SIZE = 5

const skeletonRows = Array.from({ length: PAGE_SIZE }, (_, index) => ({
  id: `skeleton-${index}`,
}))

interface TrasferimentiGridProps {
  trasferimenti: trasferimentoListType[]
  isLoading: boolean
  isSuccess: boolean
  selectedGiocatoreId: number | undefined
  giocatoreNome: string | undefined
  onEditTrasferimento: (idTrasferimento: number) => void
}

export default function TrasferimentiGrid({
  trasferimenti,
  isLoading,
  isSuccess,
  selectedGiocatoreId,
  giocatoreNome,
  onEditTrasferimento,
}: TrasferimentiGridProps) {
  const theme = useTheme()

  if (selectedGiocatoreId === undefined) return <span />

  if (isLoading && !isSuccess) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <LoadingSpinner />
      </Box>
    )
  }

  const columns: GridColDef[] = [
    { field: 'id', hideable: true },
    {
      field: 'id_pf',
      type: 'string',
      align: 'left',
      renderHeader: () => <strong>ID P.F.</strong>,
      flex: 1,
      sortable: true,
    },
    {
      field: 'ruolo',
      type: 'string',
      align: 'left',
      renderHeader: () => <strong>Ruolo</strong>,
      flex: 1,
      sortable: true,
    },
    {
      field: 'squadra',
      type: 'string',
      align: 'left',
      renderHeader: () => <strong>Squadra</strong>,
      flex: 1,
      sortable: true,
    },
    {
      field: 'squadraSerieA',
      type: 'string',
      align: 'left',
      renderHeader: () => <strong>Squadra serie A</strong>,
      flex: 1,
      sortable: true,
    },
    {
      field: 'dataAcquisto',
      type: 'date',
      align: 'left',
      renderHeader: () => <strong>Data acquisto</strong>,
      flex: 1,
      sortable: true,
    },
    {
      field: 'dataCessione',
      type: 'date',
      align: 'left',
      renderHeader: () => <strong>Data cessione</strong>,
      flex: 1,
      sortable: true,
    },
    {
      field: 'stagione',
      type: 'string',
      align: 'left',
      renderHeader: () => <strong>Stagione</strong>,
      flex: 1,
      sortable: true,
    },
    {
      field: 'costo',
      type: 'number',
      align: 'right',
      renderHeader: () => <strong>Costo</strong>,
      flex: 1,
      sortable: true,
    },
    {
      field: 'actions',
      type: 'actions',
      getActions: (params) => {
        if (params.row.stagione === Configurazione.stagione) {
          return [
            <GridActionsCellItem
              key={params.id}
              icon={<BarChartOutlined color="success" />}
              label="Vedi giocatore"
              onClick={() => onEditTrasferimento(params.id as number)}
            />,
          ]
        }
        return []
      },
      width: 100,
    },
  ]

  return (
    <>
      <Typography variant="h5">Trasferimenti {giocatoreNome}</Typography>
      <Box
        sx={{ width: '100%', overflowX: 'auto', contain: 'inline-size' }}
      >
        <DataGrid
          columnHeaderHeight={45}
          rowHeight={40}
          loading={isLoading}
          initialState={{
            pagination: {
              paginationModel: { pageSize: PAGE_SIZE },
            },
            filter: undefined,
            density: 'comfortable',
          }}
          slotProps={{
            loadingOverlay: { variant: 'skeleton' },
          }}
          columnVisibilityModel={{ id: false }}
          checkboxSelection={false}
          disableColumnFilter={true}
          disableColumnMenu={true}
          disableColumnSelector={true}
          disableColumnSorting={false}
          disableColumnResize={true}
          hideFooter={false}
          hideFooterPagination={false}
          pageSizeOptions={[5, 10, 20]}
          paginationMode="client"
          pagination={true}
          hideFooterSelectedRowCount={true}
          columns={columns}
          rows={isLoading ? skeletonRows : trasferimenti}
          disableRowSelectionOnClick={true}
          sx={{
            backgroundColor: theme.palette.background.paper,
            overflowX: 'auto',
            '& .MuiDataGrid-virtualScroller': { overflowX: 'auto' },
            minWidth: '100%',
            '& .MuiDataGrid-viewport': { overflowX: 'auto !important' },
          }}
        />
      </Box>
    </>
  )
}
