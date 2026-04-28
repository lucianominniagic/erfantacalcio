'use client'
import React from 'react'
import { api } from '~/utils/api'
import { Box, Typography, useMediaQuery, useTheme } from '@mui/material'
import { autosizeOptions } from '~/utils/datatable'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'

export default function Albo() {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))
  const alboList = api.albo.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const columns: GridColDef[] = [
    { field: 'id', hideable: true },
    {
      field: 'stagione',
      type: 'string',
      align: 'left',
      renderHeader: () => <strong>Stagione</strong>,
      flex: isXs ? 0 : 1,
    },
    {
      field: 'campionato',
      type: 'string',
      align: 'left',
      renderHeader: () => <strong>Campionato</strong>,
      flex: isXs ? 0 : 1,
    },
    {
      field: 'champions',
      type: 'string',
      align: 'left',
      renderHeader: () => <strong>Champions</strong>,
      flex: isXs ? 0 : 1,
    },
    {
      field: 'secondo',
      type: 'string',
      align: 'left',
      renderHeader: () => <strong>Secondo</strong>,
      flex: isXs ? 0 : 1,
    },
    {
      field: 'terzo',
      type: 'string',
      align: 'left',
      renderHeader: () => <strong>Terzo</strong>,
      flex: isXs ? 0 : 1,
    },
  ]

  const pageSize = 20

  const skeletonRows = Array.from({ length: pageSize }, (_, index) => ({
    id: `skeleton-${index}`,
  }))

  return (
    <Box sx={{ width: '100%', overflowX: 'auto', contain: 'inline-size' }}>
      <Typography variant="h5">Albo d&apos;oro</Typography>
      <DataGrid
        columnHeaderHeight={45}
        rowHeight={40}
        loading={alboList.isLoading}
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
        rows={alboList.isLoading ? skeletonRows : alboList.data}
        disableRowSelectionOnClick={true}
        autosizeOptions={autosizeOptions}
        sx={{
          backgroundColor: theme.palette.background.paper,
          border: 'none',
                    '& .MuiDataGrid-columnHeader': {
                  background: 'linear-gradient(135deg, #FF8F00 0%, #FFC107 100%)',
                  color: '#0d0d14',
            fontWeight: 700,
          },
          '& .MuiDataGrid-columnHeaderTitle': { fontWeight: 700, fontSize: '0.72rem' },
          '& .MuiDataGrid-row:nth-of-type(even)': { backgroundColor: 'rgba(255,193,7,0.03)' },
          '& .MuiDataGrid-row:hover': { backgroundColor: 'rgba(255,193,7,0.07)' },
          '& .MuiDataGrid-cell': { borderBottom: '1px solid rgba(255,193,7,0.06)' },
        }}
      />
    </Box>
  )
}
