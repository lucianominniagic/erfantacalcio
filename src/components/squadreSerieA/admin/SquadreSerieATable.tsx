'use client'
import { Box } from '@mui/material'
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
  type GridRenderCellParams,
} from '@mui/x-data-grid'
import { Edit } from '@mui/icons-material'
import { type SquadraSerieAType } from '~/types/squadreSerieA'
import { autosizeOptions } from '~/utils/datatable'

const PAGE_SIZE = 8

const skeletonRows = Array.from({ length: PAGE_SIZE }, (_, index) => ({
  id: `skeleton-${index}`,
}))

interface SquadreSerieATableProps {
  data: SquadraSerieAType[]
  isLoading: boolean
  onEdit: (id: number) => void
}

export default function SquadreSerieATable({
  data,
  isLoading,
  onEdit,
}: SquadreSerieATableProps) {
  type Row = SquadraSerieAType & { id: number }
  const rows: Row[] = data.map((item) => ({ ...item, id: item.idSquadraSerieA }))

  const columns: GridColDef[] = [
    { field: 'id', type: 'number', hideable: true },
    {
      field: 'maglia',
      type: 'string',
      renderHeader: () => <strong>Maglia</strong>,
      width: 90,
      sortable: false,
      renderCell: (params: GridRenderCellParams<Row>) =>
        params.value ? (
          <img
            src={`/images/maglie/${params.value}`}
            width={24}
            height={21}
            alt={params.row.nome}
            title={params.row.nome}
            style={{ objectFit: 'contain' }}
          />
        ) : null,
    },
    {
      field: 'nome',
      type: 'string',
      renderHeader: () => <strong>Nome</strong>,
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
        rows={isLoading ? skeletonRows : rows}
        disableRowSelectionOnClick={true}
        autosizeOptions={autosizeOptions}
      />
    </Box>
  )
}
