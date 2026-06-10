'use client'
import { Box } from '@mui/material'
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
} from '@mui/x-data-grid'
import { Edit } from '@mui/icons-material'
import { type SquadraType } from '~/types/squadre'
import { autosizeOptions } from '~/utils/datatable'

const PAGE_SIZE = 8

const skeletonRows = Array.from({ length: PAGE_SIZE }, (_, index) => ({
  id: `skeleton-${index}`,
}))

interface PresidentiTableProps {
  data: SquadraType[]
  isLoading: boolean
  onEdit: (id: number) => void
}

export default function PresidentiTable({
  data,
  isLoading,
  onEdit,
}: PresidentiTableProps) {
  const columns: GridColDef[] = [
    { field: 'id', type: 'number', hideable: true },
    {
      field: 'squadra',
      type: 'string',
      renderHeader: () => <strong>Squadra</strong>,
      flex: 1,
    },
    {
      field: 'presidente',
      type: 'string',
      renderHeader: () => <strong>Presidente</strong>,
      flex: 1,
    },
    {
      field: 'email',
      type: 'string',
      renderHeader: () => <strong>Email</strong>,
      flex: 1,
    },
    {
      field: 'isAdmin',
      type: 'boolean',
      renderHeader: () => <strong>Admin</strong>,
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
          onClick={() => onEdit(parseInt(id.toString(), 10))}
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
        rows={isLoading ? skeletonRows : data}
        disableRowSelectionOnClick={true}
        autosizeOptions={autosizeOptions}
      />
    </Box>
  )
}
