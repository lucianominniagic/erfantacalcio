/* eslint-disable @typescript-eslint/no-unsafe-member-access */
'use client'
import { Grid, Zoom } from '@mui/material'
import { BarChart } from '@mui/x-charts/BarChart'
import { axisClasses } from '@mui/x-charts/ChartsAxis'
import { LineChart } from '@mui/x-charts/LineChart'

interface VotoRow {
  giornataSerieA: number
  voto: number | null
  gol: number
  assist: number
  ammonizione: number
  espulsione: number
  [key: string]: unknown
}

interface StatsStagioneRow {
  stagione: string
  media: number
  gol: number
  assist: number
  giocate: number
  [key: string]: unknown
}

interface GiocatoreStatsProps {
  voti: VotoRow[]
  statsStagioni: StatsStagioneRow[]
}

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

const chartSetting = {
  yAxis: [{ label: 'Statistiche stagioni' }],
  sx: {
    [`.${axisClasses.left} .${axisClasses.label}`]: {
      transform: 'translate(0px, 0)',
    },
  },
}

const valueFormatter = (value: number | null) => `${value}`

const customizegraphvoti = {
  height: 280,
  legend: { hidden: false },
  margin: { top: 5 },
  stackingOrder: 'descending',
}

const customizegraphstagioni = {
  height: 280,
  legend: { hidden: false },
  margin: { top: 5 },
}

export function GiocatoreStats({ voti, statsStagioni }: GiocatoreStatsProps) {
  return (
    <>
      <Zoom in={true}>
        <Grid item xs={12} sm={6} display={'flex'} justifyContent={'flex-end'}>
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
                valueFormatter: (value: number | null, item: { dataIndex: number }) => {
                  const dataIndex = item.dataIndex
                  return value === null
                    ? ''
                    : `${value} - Gol: ${voti[dataIndex]?.gol ?? 0} - Assist: ${
                        voti[dataIndex]?.assist ?? 0
                      } ${
                        (voti[dataIndex]?.ammonizione ?? 0) !== 0 ? ' - Ammonizione' : ''
                      } ${(voti[dataIndex]?.espulsione ?? 0) !== 0 ? '- Espulsione' : ''}`
                },
                showMark: true,
                ...stackStrategy,
              }))}
            grid={{ vertical: true, horizontal: true }}
            dataset={voti}
            {...customizegraphvoti}
          />
        </Grid>
      </Zoom>

      <Zoom in={true}>
        <Grid item xs={12} sm={6} display={'flex'} justifyContent={'flex-end'}>
          <BarChart
            dataset={statsStagioni}
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
    </>
  )
}
