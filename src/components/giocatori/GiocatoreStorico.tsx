'use client'
import { Grid, Typography } from '@mui/material'
import { Box } from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { autosizeOptions } from '~/utils/datatable'
import Image from 'next/image'
import dayjs from 'dayjs'

interface TrasferimentoRow {
  id: number
  stagione?: string | null
  maglia?: string | null
  squadraSerieA?: string | null
  squadra?: string | null
  costo?: number | null
  dataAcquisto?: Date | null
  dataCessione?: Date | null
  [key: string]: unknown
}

interface GiocatoreStoricoProps {
  trasferimenti: TrasferimentoRow[]
  isLoading: boolean
}

const columns: GridColDef[] = [
  { field: 'id', hideable: true },
  {
    field: 'stagione',
    type: 'string',
    align: 'left',
    renderHeader: () => <strong>Stagione</strong>,
  },
  {
    field: 'maglia',
    type: 'string',
    align: 'left',
    renderCell: (params) => (
      <Image
        src={params.row?.maglia as string}
        width={30}
        height={26}
        alt={params.row?.squadraSerieA as string}
        title={params.row?.squadraSerieA as string}
      />
    ),
    renderHeader: () => '',
  },
  {
    field: 'squadra',
    type: 'string',
    align: 'left',
    renderHeader: () => <strong>Squadra</strong>,
  },
  {
    field: 'costo',
    type: 'number',
    align: 'right',
    renderHeader: () => <strong>Costo</strong>,
  },
  {
    field: 'dataAcquisto',
    type: 'date',
    valueFormatter: (value) => {
      if (value) return dayjs(value as Date).format('DD/MM/YYYY HH:mm')
      return ''
    },
    renderHeader: () => <strong>Data acquisto</strong>,
  },
  {
    field: 'dataCessione',
    type: 'date',
    valueFormatter: (value) => {
      if (value) return dayjs(value as Date).format('DD/MM/YYYY HH:mm')
      return ''
    },
    renderHeader: () => <strong>Data cessione</strong>,
  },
]

export function GiocatoreStorico({ trasferimenti, isLoading }: GiocatoreStoricoProps) {
  return (
    <Grid item xs={12} sm={6}>
      <Typography variant="h5">Trasferimenti giocatore</Typography>
      <Box sx={{ height: 234, width: '100%' }}>
        <DataGrid
          columnHeaderHeight={45}
          rowHeight={40}
          loading={isLoading}
          initialState={{
            columns: { columnVisibilityModel: { id: false } },
            pagination: { paginationModel: { pageSize: 5 } },
            filter: undefined,
            density: 'compact',
          }}
          checkboxSelection={false}
          disableColumnFilter
          disableColumnMenu
          disableColumnSelector
          disableColumnSorting
          disableColumnResize
          hideFooter={false}
          hideFooterPagination={false}
          pageSizeOptions={[5, 10, 20]}
          paginationMode="client"
          pagination
          hideFooterSelectedRowCount
          columns={columns}
          autosizeOptions={autosizeOptions}
          rows={trasferimenti}
          disableRowSelectionOnClick
          sx={{}}
        />
      </Box>
    </Grid>
  )
}
