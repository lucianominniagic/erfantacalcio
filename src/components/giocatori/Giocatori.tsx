/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
'use client'
import {
  Box,
  Divider,
  FormControlLabel,
  Grid,
  Switch,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { api } from '~/utils/api'
import { useTheme } from '@mui/material/styles'
import GenericAutocomplete, {
  type AutocompleteOption,
} from '~/components/autocomplete/GenericAutocomplete'
import Image from 'next/image'
import { type Ruoli } from '~/types/common'
import { getRuoloEsteso } from '~/utils/helper'
import { BarChartOutlined } from '@mui/icons-material'
import Modal from '../modal/Modal'
import Giocatore from './Giocatore'
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
} from '@mui/x-data-grid'

function Giocatori() {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))

  const [selectedGiocatoreId, setSelectedGiocatoreId] = useState<number>()
  const [openModalCalendario, setOpenModalCalendario] = useState(false)
  const giocatoriList = api.giocatori.listAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
  const [ruolo, setRuolo] = useState<Ruoli>('C')
  const giocatoriStats = api.giocatori.listStatistiche.useQuery(
    { ruolo: ruolo },
    { refetchOnWindowFocus: false, refetchOnReconnect: false },
  )
  const [giocatori, setGiocatori] = useState<AutocompleteOption[]>([])

  useEffect(() => {
    if (giocatoriList.data) {
      setGiocatori(giocatoriList.data)
    }
  }, [giocatoriList.data])

  const handleGiocatoreSelected = async (idGiocatore: number | undefined) => {
    setSelectedGiocatoreId(idGiocatore)
    setOpenModalCalendario(true)
  }

  const handleModalClose = () => {
    setOpenModalCalendario(false)
  }

  const columns: GridColDef[] = [
    { field: 'id', hideable: true },
    {
      field: 'maglia',
      type: 'string',
      align: 'left',
      renderCell: (params) => {
        const magliaUrl = params.row?.maglia as string
        return magliaUrl ? (
          <Image
            src={magliaUrl}
            width={30}
            height={26}
            alt={params.row?.squadraSerieA as string}
            title={params.row?.squadraSerieA as string}
          />
        ) : null
      },
      renderHeader: () => '',
      width: 30,
    },
    {
      field: 'nome',
      type: 'string',
      align: 'left',
      renderHeader: () => <strong>Nome</strong>,
      flex: isXs ? 0 : 1,
      sortable: true,
    },
    {
      field: 'squadra',
      type: 'string',
      align: 'left',
      renderHeader: () => <strong>Squadra</strong>,
      flex: isXs ? 0 : 1,
      sortable: true,
    },
    {
      field: 'media',
      type: 'number',
      align: 'right',
      renderHeader: () => <strong>Media</strong>,
      width: isXs ? 90 : 100,
      sortable: true,
    },
    {
      field: 'golfatti',
      type: 'number',
      align: 'right',
      renderHeader: () => <strong>Gol+</strong>,
      renderCell: (params) =>
        params.row?.ruolo !== 'P' ? params.row?.golfatti : '',
      width: isXs ? 90 : 100,
      sortable: true,
    },
    {
      field: 'golsubiti',
      type: 'number',
      align: 'right',
      renderHeader: () => <strong>Gol-</strong>,
      renderCell: (params) =>
        params.row?.ruolo === 'P' ? params.row?.golsubiti : '',
      width: isXs ? 90 : 100,
      sortable: true,
    },
    {
      field: 'assist',
      type: 'number',
      align: 'right',
      renderHeader: () => <strong>Assist</strong>,
      width: isXs ? 90 : 100,
      sortable: true,
    },
    {
      field: 'giocate',
      type: 'number',
      align: 'right',
      renderHeader: () => <strong>Giocate</strong>,
      width: 100,
      sortable: true,
    },
    {
      field: 'actions',
      type: 'actions',
      getActions: (params) => [
        <GridActionsCellItem
          key={params.id}
          icon={<BarChartOutlined color="success" />}
          label="Vedi giocatore"
          onClick={() => handleGiocatoreSelected(params.id as number)}
        />,
      ],
      width: isXs ? 90 : 100,
    },
  ]

  const pageSize = isXs ? 10 : 15

  const skeletonRows = Array.from({ length: pageSize }, (_, index) => ({
    id: `skeleton-${index}`,
  }))

  return (
    <>
      <Grid container spacing={1} paddingTop={2} paddingBottom={2}>
        <Grid item xs={12}>
          <Typography variant="h4">Statistiche Giocatori</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                color="warning"
                onChange={() => setRuolo('P')}
                checked={ruolo === 'P'}
              />
            }
            label={isXs ? 'P' : getRuoloEsteso('P', true)}
          />
          <FormControlLabel
            control={
              <Switch
                color="warning"
                onChange={() => setRuolo('D')}
                checked={ruolo === 'D'}
              />
            }
            label={isXs ? 'D' : getRuoloEsteso('D', true)}
          />
          <FormControlLabel
            control={
              <Switch
                color="warning"
                onChange={() => setRuolo('C')}
                checked={ruolo === 'C'}
              />
            }
            label={isXs ? 'C' : getRuoloEsteso('C', true)}
          />
          <FormControlLabel
            control={
              <Switch
                color="warning"
                onChange={() => setRuolo('A')}
                checked={ruolo === 'A'}
              />
            }
            label={isXs ? 'A' : getRuoloEsteso('A', true)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <GenericAutocomplete
            onItemSelected={(id, text) => {
              const numericId = typeof id === 'number' ? id : undefined
              handleGiocatoreSelected(numericId)
            }}
            items={giocatori ?? []}
          />
        </Grid>
        <Grid item xs={12} sx={{ minHeight: 500 }}>
          <Typography variant="h5">
            Top {getRuoloEsteso(ruolo, true)}
          </Typography>
          <Box
            sx={{ width: '100%', overflowX: 'auto', contain: 'inline-size' }}
          >
            <DataGrid
              columnHeaderHeight={45}
              rowHeight={40}
              loading={giocatoriStats.isLoading}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: pageSize,
                  },
                },
                filter: undefined,
                density: 'comfortable',
              }}
              slotProps={{
                loadingOverlay: {
                  variant: 'skeleton',
                },
              }}
              columnVisibilityModel={{
                id: false,
                golfatti: ruolo !== 'P',
                golsubiti: ruolo === 'P',
              }}
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
              rows={
                giocatoriStats.isLoading ? skeletonRows : giocatoriStats.data
              }
              disableRowSelectionOnClick={true}
              sx={{
                backgroundColor: theme.palette.background.paper,
                '& .MuiDataGrid-columnHeader': {
                  color: theme.palette.primary.light,
                  backgroundColor: theme.palette.primary.dark,
                },
                overflowX: 'auto',
                '& .MuiDataGrid-virtualScroller': {
                  overflowX: 'auto',
                },
                minWidth: '100%',
                '& .MuiDataGrid-viewport': {
                  overflowX: 'auto !important',
                },
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} minHeight={30}></Grid>
      </Grid>

      <Modal
        title={'Statistica giocatore'}
        open={openModalCalendario}
        onClose={handleModalClose}
        width={isXs ? '98%' : '1266px'}
        height={isXs ? '98%' : ''}
      >
        <Divider />
        <Box sx={{ mt: 1, gap: '0px', flexWrap: 'wrap' }}>
          {selectedGiocatoreId !== undefined && (
            <Giocatore idGiocatore={selectedGiocatoreId} />
          )}
        </Box>
      </Modal>
    </>
  )
}

export default Giocatori
