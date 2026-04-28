/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
'use client'
import {
  Box,
  Grid,
  useMediaQuery,
} from '@mui/material'
import { api } from '~/utils/api'
import { useTheme } from '@mui/material/styles'
import Image from 'next/image'
import {
  DataGrid,
  type GridColDef,
} from '@mui/x-data-grid'

type StatisticaProps = {
  idSquadra: number
}


function Statistica({ idSquadra }: StatisticaProps) {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))

  const giocatoriStats = api.giocatori.listStatisticheSquadra.useQuery(
    { id_squadra: idSquadra },
    { refetchOnWindowFocus: false, refetchOnReconnect: false },
  )
  
  const columns: GridColDef[] = [
    { field: 'id', hideable: true },
    // {
    //   field: 'maglia',
    //   type: 'string',
    //   align: 'left',
    //   renderCell: (params) => (
    //     <Image
    //       src={params.row?.maglia as string}
    //       width={30}
    //       height={26}
    //       alt={params.row?.squadraSerieA as string}
    //       title={params.row?.squadraSerieA as string}
    //     />
    //   ),
    //   renderHeader: () => '',
    //   width: 30,
    // },
    {
      field: 'nome',
      type: 'string',
      align: 'left',
      renderHeader: () => <strong>Nome</strong>,
      sortable: true,
    },
    {
      field: 'media',
      type: 'number',
      align: 'right',
      renderHeader: () => <strong>Media</strong>,
      sortable: false,
      flex: 1,
    },
    {
      field: 'gol',
      type: 'number',
      align: 'right',
      renderHeader: () => <strong>Gol</strong>,
      sortable: false,
      flex: 1,
    },
    {
      field: 'assist',
      type: 'number',
      align: 'right',
      renderHeader: () => <strong>Assist</strong>,
      sortable: false,
      flex: 1,
    },
    {
      field: 'giocate',
      type: 'number',
      align: 'right',
      renderHeader: () => <strong>Giocate</strong>,
      sortable: false,
      flex: 1,
    },
  ]

  const pageSize = 30

  const skeletonRows = Array.from({ length: pageSize }, (_, index) => ({
    id: `skeleton-${index}`,
  }))

  return (
    <>
      <Grid container spacing={1} paddingTop={2} paddingBottom={2}>
        <Grid item xs={12} sx={{ minHeight: 500 }}>
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
                // golfatti: ruolo !== 'P',
                // golsubiti: ruolo === 'P',
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
              rows={
                giocatoriStats.isLoading ? skeletonRows : giocatoriStats.data
              }
              disableRowSelectionOnClick={true}
              sx={{
                backgroundColor: theme.palette.background.paper,
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
    </>
  )
}

export default Statistica
