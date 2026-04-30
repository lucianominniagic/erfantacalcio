'use client'
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useMemo } from 'react'
import { api } from '~/utils/api'
import { useTheme } from '@mui/material/styles'
import { type GiocatoreType } from '~/types/squadre'
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
} from '@mui/x-data-grid'
import Modal from '../modal/Modal'
import Giocatore from '../giocatori/Giocatore'
import { useGiocatoreModal } from '../cardPartite/usePartitaParams'

type RosaProps = {
  idSquadra: number
  squadra: string
}

const RUOLO_ORDER: Record<string, number> = { A: 0, C: 1, D: 2, P: 3 }

function Rosa({ idSquadra, squadra }: RosaProps) {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))

  const {
    idGiocatore: selectedGiocatoreId,
    openModalCalendario,
    handleStatGiocatore: handleGiocatoreSelected,
    handleModalClose,
  } = useGiocatoreModal()

  const rosaList = api.squadre.getRosa.useQuery(
    { idSquadra, includeVenduti: true },
    { refetchOnWindowFocus: false, refetchOnReconnect: false },
  )

  const { rosaAttiva, rosaVenduta } = useMemo(() => {
    if (!rosaList.data) return { rosaAttiva: [], rosaVenduta: [] }
    const attiva = rosaList.data
      .filter((g: GiocatoreType) => !g.isVenduto)
      .sort((a: GiocatoreType, b: GiocatoreType) =>
        (RUOLO_ORDER[b.ruolo] ?? 9) - (RUOLO_ORDER[a.ruolo] ?? 9) || b.costo - a.costo,
      )
    const venduta = rosaList.data
      .filter((g: GiocatoreType) => g.isVenduto)
      .sort((a: GiocatoreType, b: GiocatoreType) =>
        (RUOLO_ORDER[b.ruolo] ?? 9) - (RUOLO_ORDER[a.ruolo] ?? 9) || b.costo - a.costo,
      )
    return { rosaAttiva: attiva, rosaVenduta: venduta }
  }, [rosaList.data])

  const columns: GridColDef[] = [
    {
      field: 'urlCampioncinoSmall',
      headerName: '',
      width: 40,
      sortable: false,
      filterable: false,
      hideable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Avatar
          src={params.value as string}
          alt={params.row.nome as string}
          variant="square"
          sx={{ width: 28, height: 28 }}
        />
      ),
    },
    {
      field: 'ruolo',
      headerName: 'Ruolo',
      width: 90,
      sortable: false,
      filterable: false,
      hideable: false,
    },
    {
      field: 'nome',
      headerName: 'Giocatore',
      flex: 1,
      minWidth: 120,
      sortable: false,
      filterable: false,
      hideable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Typography
          variant="body2"
          sx={{ cursor: 'pointer', color: 'primary.main', fontWeight: 500 }}
          onClick={() => handleGiocatoreSelected(params.row.idGiocatore as number)}
        >
          {params.value as string}
        </Typography>
      ),
    },
    {
      field: 'nomeSquadraSerieA',
      headerName: 'Squadra',
      flex: 1,
      minWidth: 100,
      sortable: false,
      filterable: false,
      hideable: false,
    },
    {
      field: 'costo',
      headerName: 'Costo',
      width: 80,
      type: 'number',
      sortable: false,
      filterable: false,
      hideable: false,
      valueFormatter: (value: number) => `${value.toFixed(0)} M€`,
    },
  ]

  const gridSx = {
    border: 'none',
    '& .MuiDataGrid-columnHeaders': { bgcolor: 'action.hover' },
    '& .MuiDataGrid-row:hover': { cursor: 'default' },
    '& .MuiDataGrid-cell': { alignItems: 'center', display: 'flex' },
  }

  return (
    <>
      <Box>
        <Typography variant="h4" sx={{ mb: 2 }}>Rosa</Typography>

        {rosaList.isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress color="warning" />
          </Box>
        ) : (
          <>
            <DataGrid
              rows={rosaAttiva}
              columns={columns}
              getRowId={(row: GiocatoreType) => row.idGiocatore}
              disableRowSelectionOnClick
              disableColumnSorting
              hideFooter={rosaAttiva.length <= 100}
              rowHeight={36}
              sx={gridSx}
              initialState={{
                sorting: { sortModel: [{ field: 'ruolo', sort: 'desc' }] },
              }}
            />

            {rosaVenduta.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 1 }}>
                  Giocatori ceduti
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <DataGrid
                  rows={rosaVenduta}
                  columns={columns}
                  getRowId={(row: GiocatoreType) => row.idGiocatore}
                  disableRowSelectionOnClick
                  disableColumnSorting
                  hideFooter={rosaVenduta.length <= 100}
                  rowHeight={36}
                  sx={{
                    ...gridSx,
                    '& .MuiDataGrid-row': { color: 'text.disabled' },
                  }}
                  initialState={{
                    sorting: { sortModel: [{ field: 'ruolo', sort: 'asc' }] },
                  }}
                />
              </Box>
            )}
          </>
        )}

        <Box sx={{ height: '100px' }} />
      </Box>

      <Modal
        title={'Statistica giocatore'}
        open={openModalCalendario}
        onClose={handleModalClose}
        width={isXs ? '98%' : '1266px'}
        height={isXs ? '98%' : ''}
      >
        <Divider />
        <Box sx={{ mt: 1 }}>
          {selectedGiocatoreId !== undefined && (
            <Giocatore idGiocatore={selectedGiocatoreId} />
          )}
        </Box>
      </Modal>
    </>
  )
}

export default Rosa
