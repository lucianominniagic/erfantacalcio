'use client'
import { Box } from '@mui/material'
import { CalendarMonth, Edit } from '@mui/icons-material'
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
} from '@mui/x-data-grid'
import dayjs from 'dayjs'
import { autosizeOptions } from '~/utils/datatable'
import PageHeader from '~/components/PageHeader'
import { useCalendarioAdmin } from '~/components/calendario/admin/useCalendarioAdmin'
import CalendarioForm from '~/components/calendario/admin/CalendarioForm'

const PAGE_SIZE = 8

const columns = (onEdit: (id: number) => void): GridColDef[] => [
  { field: 'id', type: 'number', hideable: true },
  {
    field: 'nome',
    type: 'string',
    renderHeader: () => <strong>Nome</strong>,
    flex: 1,
  },
  {
    field: 'giornataSerieA',
    type: 'number',
    renderHeader: () => <strong>Giornata Serie A</strong>,
    flex: 1,
  },
  {
    field: 'girone',
    type: 'number',
    renderHeader: () => <strong>Girone</strong>,
    flex: 1,
  },
  {
    field: 'gruppoFase',
    type: 'string',
    renderHeader: () => <strong>Gruppo fase</strong>,
    flex: 1,
  },
  {
    field: 'data',
    type: 'date',
    valueFormatter: (value) =>
      value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '',
    renderHeader: () => <strong>Data</strong>,
    flex: 1,
  },
  {
    field: 'giornata',
    type: 'number',
    renderHeader: () => <strong>Giornata</strong>,
    flex: 1,
  },
  {
    field: 'isSovrapposta',
    type: 'boolean',
    renderHeader: () => <strong>Sovrapposta</strong>,
  },
  {
    field: 'isRecupero',
    type: 'boolean',
    renderHeader: () => <strong>Recupero</strong>,
  },
  {
    field: 'isGiocata',
    type: 'boolean',
    renderHeader: () => <strong>Giocata</strong>,
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

const skeletonRows = Array.from({ length: PAGE_SIZE }, (_, index) => ({
  id: `skeleton-${index}`,
}))

export default function Calendario() {
  const {
    data,
    openModalEdit,
    calendarioInModifica,
    errorMessageModal,
    messageModal,
    torneiList,
    isLoading,
    handleEdit,
    handleModalClose,
    handleSubmit,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
  } = useCalendarioAdmin()

  return (
    <>
      <PageHeader title="Gestione calendario" Icon={CalendarMonth} />
      <Box sx={{ width: '100%', overflowX: 'auto', contain: 'inline-size' }}>
        <DataGrid
          columnHeaderHeight={45}
          rowHeight={40}
          loading={isLoading}
          initialState={{
            columns: { columnVisibilityModel: { id: false } },
            pagination: { paginationModel: { pageSize: 25 } },
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
          columns={columns(handleEdit)}
          rows={isLoading ? skeletonRows : data}
          disableRowSelectionOnClick={true}
          autosizeOptions={autosizeOptions}
        />
      </Box>

      <CalendarioForm
        open={openModalEdit}
        calendarioInModifica={calendarioInModifica}
        torneiList={torneiList}
        errorMessage={errorMessageModal}
        message={messageModal}
        onSubmit={handleSubmit}
        onClose={handleModalClose}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
        onDateChange={handleDateChange}
      />
    </>
  )
}
