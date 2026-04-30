'use client'
import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import { api } from '~/utils/api'
import { magliaType, ShirtTemplate } from '../selectColors'
import { ShirtSVG } from '../selectColors/shirtSVG'

type SquadraProps = {
  idSquadra: number
}

export default function Squadra({ idSquadra }: SquadraProps) {
  const apiSquadra = api.squadre.get.useQuery(
    { idSquadra: idSquadra },
    { refetchOnWindowFocus: false, refetchOnReconnect: false },
  )
  const apiAlbo = api.albo.get.useQuery(
    { idSquadra: idSquadra },
    { refetchOnWindowFocus: false, refetchOnReconnect: false },
  )

  const datiSquadra = apiSquadra.data
  const datiAlbo = apiAlbo.data
  const maglia = datiSquadra
    ? (JSON.parse(datiSquadra.maglia ?? '{}') as magliaType)
    : null

  return (
    <>
      {(apiSquadra.isLoading || apiAlbo.isLoading) && (
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <CircularProgress color="warning" />
            </Box>
          </Grid>
        </Grid>
      )}
      {datiSquadra && datiAlbo && (
        <Grid container spacing={0}>
          <Grid item xs={12}>
            <Typography color="primary" variant="h4">
              {datiSquadra.squadra}
            </Typography>
            <Typography color="primary" variant="h5">
              Presidente: {datiSquadra.presidente}
            </Typography>
          </Grid>
          <Grid item xs={6} md={12} sx={{ mt: 1 }}>
            {maglia && (
              <ShirtSVG
                template={maglia.selectedTemplate as ShirtTemplate}
                mainColor={maglia.mainColor}
                secondaryColor={maglia.secondaryColor}
                thirdColor={maglia.thirdColor}
                textColor={maglia.textColor}
                size={100}
                number={maglia.shirtNumber}
              />
            )}
          </Grid>
          <Grid item xs={6} md={12} sx={{ mt: 1 }}>
            <Avatar
              src={datiSquadra.foto ?? ''}
              sx={{ width: 100, height: 100 }}
            />
          </Grid>
          <Grid item xs={6} md={12} sx={{ mt: 2 }}>
            <Typography color="primary" variant="h6">
              <u>Trofei vinti</u>
            </Typography>
            <Typography color="primary" variant="body1">
              Campionato: {datiAlbo.campionato}
            </Typography>
            <Typography color="primary" variant="body1">
              Champions: {datiAlbo.champions}
            </Typography>
            <Typography color="primary" variant="body1">
              Secondo: {datiAlbo.secondo}
            </Typography>
            <Typography color="primary" variant="body1">
              Terzo: {datiAlbo.terzo}
            </Typography>
          </Grid>
        </Grid>
      )}
    </>
  )
}
