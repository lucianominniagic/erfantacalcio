'use client'

import { useId } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Alert,
  Avatar,
  Box,
  Skeleton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { MilitaryTech } from '@mui/icons-material'
import { orpc } from '~/utils/orpc'
import { getNomeTorneo } from '~/utils/torneo'
import { classificaSchema } from '~/schemas/classifica'
import { z } from 'zod'

interface ClassificaProps {
  nomeTorneo: string
  idTorneo: number | undefined
  gruppo: string | null
}

type ClassificaRow = z.infer<typeof classificaSchema>

export default function Classifica({
  nomeTorneo = '',
  idTorneo,
  gruppo = null,
}: ClassificaProps) {
  const id = useId()
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))
  const classificaList = useQuery(
    orpc.classifica.list.queryOptions({
      input: { idTorneo: idTorneo ?? 0 },
      enabled: idTorneo !== undefined,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
  )
  const rows = classificaList.data ?? []
  const columns: GridColDef<ClassificaRow>[] = [
    {
      field: 'squadra',
      headerName: 'Squadra',
      flex: isXs ? 5 : 4,
      minWidth: 0,
      renderCell: ({ row }) => (
        <Box
          sx={{
            whiteSpace: 'normal',
            overflowWrap: 'anywhere',
            lineHeight: 1.35,
            py: 0.75,
          }}
        >
          {row.squadra}
        </Box>
      ),
    },
    ...(!isXs
      ? [
          {
            field: 'foto',
            headerName: '',
            width: 36,
            minWidth: 36,
            renderCell: ({ row }: { row: ClassificaRow }) => (
              <Avatar
                src={row.foto ?? undefined}
                alt=""
                sx={{ width: 24, height: 24 }}
              />
            ),
          },
        ]
      : []),
    {
      field: 'punti',
      type: 'number',
      headerName: isXs ? 'P.' : 'Punti',
      description: 'Punti',
      flex: 1,
      minWidth: 24,
      cellClassName: 'classifica-punti',
    },
    {
      field: 'golFatti',
      type: 'number',
      headerName: 'Gol+',
      description: 'Gol fatti',
      flex: 1,
      minWidth: 30,
    },
    {
      field: 'golSubiti',
      type: 'number',
      headerName: 'Gol-',
      description: 'Gol subiti',
      flex: 1,
      minWidth: 30,
    },
    {
      field: 'giocate',
      type: 'number',
      headerName: isXs ? 'G.' : 'Giocate',
      description: 'Giocate',
      flex: 1,
      minWidth: isXs ? 24 : 55,
    },
    {
      field: 'fantapunti',
      type: 'number',
      headerName: isXs ? 'FP.' : 'Fantapunti',
      description: 'Fantapunti',
      valueFormatter: (value: number) =>
        value.toLocaleString('it-IT', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
      flex: 2,
      minWidth: isXs ? 58 : 78,
    },
  ]

  return (
    <Box sx={{ width: '100%', minWidth: 0 }}>
      <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 2 }}>
        <MilitaryTech sx={{ color: 'champions.main', fontSize: '1.4rem' }} />
        <Typography id={`${id}-titolo`} variant="h5" component="h2">
          Classifica {getNomeTorneo(nomeTorneo, gruppo)}
        </Typography>
      </Stack>
      {classificaList.isError ? (
        <Alert severity="error">
          Impossibile caricare la classifica: {classificaList.error.message}
        </Alert>
      ) : classificaList.isLoading || idTorneo === undefined ? (
        <Stack spacing={1} aria-busy="true" aria-label="Caricamento classifica">
          {Array.from({ length: gruppo ? 8 : 4 }, (_, i) => (
            <Skeleton key={i} variant="rounded" height={36} />
          ))}
        </Stack>
      ) : rows.length === 0 ? (
        <Alert severity="info">Classifica non ancora disponibile.</Alert>
      ) : (
        <Box
          sx={{
            borderRadius: '0 0 12px 12px',
            border: 1,
            borderColor: 'divider',
            borderTop: 0,
          }}
        >
          <DataGrid
            aria-labelledby={`${id}-titolo`}
            autoHeight
            columnHeaderHeight={40}
            rowHeight={36}
            getRowHeight={() => 'auto'}
            getEstimatedRowHeight={() => 36}
            getRowId={(row: ClassificaRow) => row.idSquadra}
            columns={columns}
            rows={rows}
            disableColumnFilter
            disableColumnMenu
            disableColumnSelector
            disableColumnSorting
            disableColumnResize
            disableRowSelectionOnClick
            hideFooter
            sx={{
              borderRadius: '0 0 12px 12px',
              '& .MuiDataGrid-cell, & .MuiDataGrid-columnHeader': { px: 0.5 },
              '& .MuiDataGrid-columnHeaderTitle': {
                fontSize: isXs ? '0.6875rem' : '0.72rem',
              },
              '& .MuiDataGrid-cell': {
                display: 'flex',
                alignItems: 'center',
                minHeight: 36,
                fontVariantNumeric: 'tabular-nums',
              },
              '& .MuiDataGrid-cell--textRight': { justifyContent: 'flex-end' },
              '& .classifica-punti': { fontWeight: 700, color: 'primary.main' },
            }}
          />
        </Box>
      )}
    </Box>
  )
}
