'use client'
import { Box } from '@mui/material'
import { DataGrid, GridActionsCellItem, type GridColDef } from '@mui/x-data-grid'
import { Edit } from '@mui/icons-material'
import { type votoListType } from '~/types/voti'
import { autosizeOptions } from '~/utils/datatable'
import LoadingSpinner from '~/components/LinearProgressBar/LoadingSpinner'

const PAGE_SIZE = 10

const skeletonRows = Array.from({ length: PAGE_SIZE }, (_, index) => ({
  id: `skeleton-${index}`,
}))

interface VotiListProps {
  voti: votoListType[]
  isLoading: boolean
  isSuccess: boolean
  selectedGiocatoreId: number | undefined
  onEditVoto: (idVoto: number) => void
}

export default function VotiList({
  voti,
  isLoading,
  isSuccess,
  selectedGiocatoreId,
  onEditVoto,
}: VotiListProps) {
  if (selectedGiocatoreId === undefined) return <span />

  if (isLoading && !isSuccess) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <LoadingSpinner />
      </Box>
    )
  }

  const columns: GridColDef[] = [
    { field: 'id', type: 'number', hideable: true },
    {
      field: 'giornataSerieA',
      type: 'number',
      renderHeader: () => <strong>Giornata Serie A</strong>,
      flex: 1,
    },
    {
      field: 'torneo',
      type: 'string',
      renderHeader: () => <strong>Torneo</strong>,
      flex: 1,
    },
    {
      field: 'voto',
      type: 'number',
      renderHeader: () => <strong>Voto</strong>,
      flex: 1,
    },
    {
      field: 'gol',
      type: 'number',
      renderHeader: () => <strong>Gol</strong>,
      flex: 1,
    },
    {
      field: 'assist',
      type: 'number',
      renderHeader: () => <strong>Assist</strong>,
      flex: 1,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => [
        <GridActionsCellItem
          key={1}
          icon={<Edit color="action" />}
          label="Edit"
          className="textPrimary"
          onClick={() => onEditVoto(parseInt(id.toString(), 10))}
          color="inherit"
        />,
      ],
    },
  ]

  return (
    <Box sx={{ width: '100%', overflowX: 'auto', contain: 'inline-size' }}>
      <DataGrid
        columnHeaderHeight={45}
        rowHeight={40}
        loading={isLoading}
        initialState={{
          columns: { columnVisibilityModel: { id: false } },
          pagination: { paginationModel: { pageSize: 15 } },
          filter: undefined,
          density: 'compact',
        }}
        slotProps={{ loadingOverlay: { variant: 'skeleton' } }}
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
        rows={isLoading ? skeletonRows : voti}
        disableRowSelectionOnClick={true}
        autosizeOptions={autosizeOptions}
      />
    </Box>
  )
}
