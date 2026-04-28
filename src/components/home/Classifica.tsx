/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React, { useEffect, useState } from 'react'
import { api } from '~/utils/api'
import { Avatar, Box, Typography, useMediaQuery, useTheme } from '@mui/material'
import { getNomeTorneo } from '~/utils/helper'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { autosizeOptions } from '~/utils/datatable'
import { z } from 'zod'
import { classificaSchema } from '~/schemas/classifica'

interface ClassificaProps {
  nomeTorneo: string
  idTorneo: number | undefined
  gruppo: string | null
}

export default function Classifica({
  nomeTorneo = '',
  idTorneo = undefined,
  gruppo = null,
}: ClassificaProps) {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))

  const classificaList = api.classifica.list.useQuery(
    { idTorneo: idTorneo! },
    {
      enabled: !!idTorneo,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const [rows, setRows] = useState<z.infer<typeof classificaSchema>[]>([])

  useEffect(() => {
    if (
      !classificaList.isFetching &&
      classificaList.isSuccess &&
      classificaList.data
    ) {
      setRows(classificaList.data)
    }
  }, [classificaList.data, classificaList.isSuccess, classificaList.isFetching])

  const columns: GridColDef[] = [
    { field: 'id', hideable: true },
    {
      field: 'squadra',
      type: 'string',
      align: 'left',
      renderHeader: () => <strong>Squadra</strong>,
      flex: 1,
      minWidth: 100,
    },
    {
      field: 'punti',
      type: 'number',
      align: 'right',
      renderHeader: () => <strong>Punti</strong>,
      flex: 1,
      width: 80,
    },
    {
      field: 'golFatti',
      type: 'number',
      align: 'right',
      renderHeader: () => <strong>Gol+</strong>,
      flex: 1,
      width: 80,
    },
    {
      field: 'golSubiti',
      type: 'number',
      align: 'right',
      renderHeader: () => <strong>Gol-</strong>,
      flex: 1,
      width: 80,
    },
    {
      field: 'giocate',
      type: 'number',
      align: 'right',
      renderHeader: () => <strong>Giocate</strong>,
      flex: 1,
      width: 80,
    },
    {
      field: 'fantapunti',
      type: 'number',
      align: 'right',
      renderHeader: () => <strong>Fantapunti</strong>,
      width: 80,
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

  const pageSize = gruppo ? 8 : 4

  const skeletonRows = Array.from({ length: pageSize }, (_, index) => ({
    id: `skeleton-${index}`,
  }))

  return (
    <>
      <Typography variant="h4">
        Classifica {getNomeTorneo(nomeTorneo, gruppo)}
      </Typography>
      <Box
        sx={{
          borderRadius: '0 0 12px 12px',
          overflow: 'hidden',
          border: '1px solid rgba(255,193,7,0.12)',
          borderTop: 'none',
              }}
      >
        <DataGrid
          columnHeaderHeight={40}
          rowHeight={36}
          loading={classificaList.isLoading}
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
          rows={classificaList.isLoading ? skeletonRows : rows}
          disableRowSelectionOnClick={true}
          autosizeOptions={autosizeOptions}
          sx={{
            borderRadius: '0 0 12px 12px',
              }}
        />
      </Box>
      <br></br>
    </>
  )
}
