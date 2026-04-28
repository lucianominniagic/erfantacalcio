/* eslint-disable @typescript-eslint/no-unsafe-member-access */
'use client'
import { Box, Grid, Typography, useTheme, Zoom } from '@mui/material'
import { api } from '~/utils/api'
import { BarChart } from '@mui/x-charts/BarChart'
import { axisClasses } from '@mui/x-charts/ChartsAxis'
import { LineChart } from '@mui/x-charts/LineChart'
import Image from 'next/image'
import { DataGrid, type GridColDef } from '@mui/x-data-grid'
import { autosizeOptions } from '~/utils/datatable'

import dayjs from 'dayjs'

interface GiocatoreProps {
  idGiocatore: number
}

function Giocatore({ idGiocatore }: GiocatoreProps) {
  const theme = useTheme()

  const giocatoreProfilo = api.giocatori.getStatistica.useQuery(
    { idGiocatore: idGiocatore },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const giocatoreVoti = api.voti.getStatisticaVoti.useQuery(
    { idGiocatore: idGiocatore },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const giocatoreTrasferimenti = api.trasferimenti.list.useQuery(
    { idGiocatore: idGiocatore },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const giocatoreStatsStagioni = api.trasferimenti.statsStagioni.useQuery(
    { idGiocatore: idGiocatore },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )

  //#region bar graph
  const valueFormatter = (value: number | null) => `${value}`

  const chartSetting = {
    yAxis: [
      {
        label: 'Statistiche stagioni',
      },
    ],
    sx: {
      [`.${axisClasses.left} .${axisClasses.label}`]: {
        transform: 'translate(0px, 0)',
      },
    },
  }

  const customizegraphstagioni = {
    height: 280,
    legend: { hidden: false },
    margin: { top: 5 },
  }
  //#endregion

  //#region line graph

  const keyToLabel: Record<string, string> = {
    voto: 'Voto',
    gol: 'Gol',
    assist: 'Assist',
    ammonizione: 'Ammonizioni',
    espulsione: 'Espulsioni',
  }

  const stackStrategy = {
    stack: 'total',
    area: false,
    stackOffset: 'none',
  } as const

  const customizegraphvoti = {
    height: 280,
    legend: { hidden: false },
    margin: { top: 5 },
    stackingOrder: 'descending',
  }

  //#endregion

  const columns: GridColDef[] = [
    { field: 'id', hideable: true },
    {
      field: 'stagione',
      type: 'string',
      align: 'left',
      renderHeader: () => <strong>Stagione</strong>,
    },
    {
      field: 'maglia',
      type: 'string',
      align: 'left',
      renderCell: (params) => (
        <Image
          src={params.row?.maglia as string}
          width={30}
          height={26}
          alt={params.row?.squadraSerieA as string}
          title={params.row?.squadraSerieA as string}
        />
      ),
      renderHeader: () => '',
    },
    {
      field: 'squadra',
      type: 'string',
      align: 'left',
      renderHeader: () => <strong>Squadra</strong>,
    },
    {
      field: 'costo',
      type: 'number',
      align: 'right',
      renderHeader: () => <strong>Costo</strong>,
    },
    {
      field: 'dataAcquisto',
      type: 'date',
      valueFormatter: (value) => {
        if (value) {
          return dayjs(value).format('DD/MM/YYYY HH:mm')
        }
        return ''
      },
      renderHeader: () => <strong>Data acquisto</strong>,
    },
    {
      field: 'dataCessione',
      type: 'date',
      valueFormatter: (value) => {
        if (value) {
          return dayjs(value).format('DD/MM/YYYY HH:mm')
        }
        return ''
      },
      renderHeader: () => <strong>Data cessione</strong>,
    },
  ]

  return (
    <Grid container spacing={1} paddingTop={2} paddingBottom={2}>
      {idGiocatore && giocatoreProfilo.data && (
        <>
          <Grid
            item
            xs={12}
            sm={6}
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            <Grid container>
              <Grid item sm={3}>
                <img
                  src={giocatoreProfilo.data.urlCampioncino}
                  width={115}
                  height={170}
                  alt={giocatoreProfilo.data.nome}
                />
              </Grid>
              <Grid item sm={4}>
                <Typography variant="h5">
                  Nome: {giocatoreProfilo.data.nome}
                  <br></br>
                  Media voti: {giocatoreProfilo.data.media}
                  <br></br>
                  Gol: {giocatoreProfilo.data.gol}
                  <br></br>
                  Assist: {giocatoreProfilo.data.assist}
                  <br></br>
                  Ammonizioni: {giocatoreProfilo.data.ammonizioni}
                  <br></br>
                  Espulsioni: {giocatoreProfilo.data.espulsioni}
                </Typography>
              </Grid>
              <Grid item sm={5}>
                <Typography variant="h5">
                  Ruolo: {giocatoreProfilo.data.ruoloEsteso}
                  <br></br>
                  Partite giocate: {giocatoreProfilo.data.giocate}
                  <br></br>
                  Costo trasferimento: {giocatoreProfilo.data.costo}
                  <br></br>
                  Squadra serie A: {giocatoreProfilo.data.squadraSerieA}
                  <br></br>
                  Squadra: {giocatoreProfilo.data.squadra}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} sx={{ display: { xs: 'block', sm: 'none' } }}>
            <Grid container>
              <Grid item xs={6}>
                <Typography variant="h6">
                  Nome: {giocatoreProfilo.data.nome}
                  <br></br>
                  Media voti: {giocatoreProfilo.data.media}
                  <br></br>
                  Gol: {giocatoreProfilo.data.gol}
                  <br></br>
                  Assist: {giocatoreProfilo.data.assist}
                  <br></br>
                  Ammonizioni: {giocatoreProfilo.data.ammonizioni}
                  <br></br>
                  Espulsioni: {giocatoreProfilo.data.espulsioni}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6">
                  Ruolo: {giocatoreProfilo.data.ruoloEsteso}
                  <br></br>
                  Partite giocate: {giocatoreProfilo.data.giocate}
                  <br></br>
                  Costo trasferimento: {giocatoreProfilo.data.costo}
                  <br></br>
                  Squadra serie A: {giocatoreProfilo.data.squadraSerieA}
                  <br></br>
                  Squadra: {giocatoreProfilo.data.squadra}
                </Typography>
              </Grid>
            </Grid>
          </Grid>
        </>
      )}
      {idGiocatore && giocatoreVoti.data && (
        <Zoom in={true}>
          <Grid
            item
            xs={12}
            sm={6}
            display={'flex'}
            justifyContent={'flex-end'}
          >
            <LineChart
              yAxis={[
                {
                  min: 0,
                  max: 10,
                  label: 'Voti stagionali',
                  colorMap: {
                    type: 'piecewise',
                    thresholds: [6, 10],
                    colors: ['red', 'green'],
                  },
                },
              ]}
              xAxis={[
                {
                  dataKey: 'giornataSerieA',
                  valueFormatter: (value: number) => `Giornata ${value}`,
                  min: 1,
                  max: 38,
                },
              ]}
              series={Object.keys(keyToLabel)
                .filter((c) => c === 'voto')
                .map((key) => ({
                  dataKey: key,
                  label: keyToLabel[key],
                  valueFormatter: (value, item) => {
                    const dataIndex = item.dataIndex
                    return value === null
                      ? ''
                      : `${value} - Gol: ${
                          giocatoreVoti?.data[dataIndex]?.gol ?? 0
                        } - Assist: ${
                          giocatoreVoti?.data[dataIndex]?.assist ?? 0
                        } ${
                          (giocatoreVoti?.data[dataIndex]?.ammonizione ?? 0) !==
                          0
                            ? ' - Ammonizione'
                            : ''
                        } ${
                          (giocatoreVoti?.data[dataIndex]?.espulsione ?? 0) !==
                          0
                            ? '- Espulsione'
                            : ''
                        }`
                  },
                  showMark: true,
                  ...stackStrategy,
                }))}
              grid={{ vertical: true, horizontal: true }}
              dataset={giocatoreVoti.data}
              {...customizegraphvoti}
            />
          </Grid>
        </Zoom>
      )}
      {idGiocatore && giocatoreTrasferimenti.data && (
        <Grid item xs={12} sm={6}>
          <Typography variant="h5">Trasferimenti giocatore</Typography>
          <Box sx={{ height: 234, width: '100%' }}>
            <DataGrid
              columnHeaderHeight={45}
              rowHeight={40}
              loading={giocatoreTrasferimenti.isLoading}
              initialState={{
                columns: {
                  columnVisibilityModel: {
                    id: false,
                  },
                },
                pagination: {
                  paginationModel: {
                    pageSize: 5,
                  },
                },
                filter: undefined,
                density: 'compact',
              }}
              checkboxSelection={false}
              disableColumnFilter={true}
              disableColumnMenu={true}
              disableColumnSelector={true}
              disableColumnSorting={true}
              disableColumnResize={true}
              hideFooter={false}
              hideFooterPagination={false}
              pageSizeOptions={[5, 10, 20]}
              paginationMode="client"
              pagination={true}
              hideFooterSelectedRowCount={true}
              columns={columns}
              autosizeOptions={autosizeOptions}
              rows={giocatoreTrasferimenti.data}
              disableRowSelectionOnClick={true}
              sx={{
                backgroundColor: theme.palette.background.paper,
                '& .MuiDataGrid-columnHeader': {
                  background: 'linear-gradient(135deg, #FF8F00 0%, #FFC107 100%)',
                  color: '#0d0d14',
                },
              }}
            />
          </Box>
        </Grid>
      )}
      {idGiocatore && giocatoreStatsStagioni.data && (
        <Zoom in={true}>
          <Grid
            item
            xs={12}
            sm={6}
            display={'flex'}
            justifyContent={'flex-end'}
          >
            <BarChart
              dataset={giocatoreStatsStagioni.data}
              xAxis={[{ scaleType: 'band', dataKey: 'stagione' }]}
              series={[
                { dataKey: 'media', label: 'Media', valueFormatter },
                { dataKey: 'gol', label: 'Gol', valueFormatter },
                { dataKey: 'assist', label: 'Assist', valueFormatter },
                { dataKey: 'giocate', label: 'Giocate', valueFormatter },
              ]}
              {...chartSetting}
              {...customizegraphstagioni}
            />
          </Grid>
        </Zoom>
      )}
      <Grid item xs={12} minHeight={30}></Grid>
    </Grid>
  )
}

export default Giocatore
