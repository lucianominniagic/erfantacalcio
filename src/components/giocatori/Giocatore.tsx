/* eslint-disable @typescript-eslint/no-unsafe-member-access */
'use client'
import { Box, CircularProgress, Fade, Grid } from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import { api } from '~/utils/api'
import { orpc } from '~/utils/orpc'
import { GiocatoreProfile } from './GiocatoreProfile'
import { GiocatoreStats } from './GiocatoreStats'
import { GiocatoreStorico } from './GiocatoreStorico'

interface GiocatoreProps {
  idGiocatore: number
}

function Giocatore({ idGiocatore }: GiocatoreProps) {
  const giocatoreProfilo = useQuery(
    orpc.giocatori.getStatistica.queryOptions({
      input: { idGiocatore },
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
  )
  const giocatoreVoti = api.voti.getStatisticaVoti.useQuery(
    { idGiocatore },
    { refetchOnWindowFocus: false, refetchOnReconnect: false },
  )
  const giocatoreTrasferimenti = useQuery(
    orpc.trasferimenti.list.queryOptions({
      input: { idGiocatore },
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
  )
  const giocatoreStatsStagioni = useQuery(
    orpc.trasferimenti.statsStagioni.queryOptions({
      input: { idGiocatore },
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
  )

  const isLoading =
    giocatoreProfilo.isLoading ||
    giocatoreVoti.isLoading ||
    giocatoreTrasferimenti.isLoading ||
    giocatoreStatsStagioni.isLoading

  return (
    <>
      {isLoading && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
          <CircularProgress size={48} />
        </Box>
      )}
      <Fade in={!isLoading} timeout={400} unmountOnExit={false}>
        <Grid container spacing={1} paddingTop={2} paddingBottom={2}>
          {idGiocatore && giocatoreProfilo.data && (
            <GiocatoreProfile profilo={giocatoreProfilo.data} />
          )}
          {idGiocatore && giocatoreVoti.data && giocatoreStatsStagioni.data && (
            <GiocatoreStats
              voti={giocatoreVoti.data}
              statsStagioni={giocatoreStatsStagioni.data}
            />
          )}
          {idGiocatore && giocatoreTrasferimenti.data && (
            <GiocatoreStorico
              trasferimenti={giocatoreTrasferimenti.data}
              isLoading={giocatoreTrasferimenti.isLoading}
            />
          )}
          <Grid item xs={12} minHeight={30} />
        </Grid>
      </Fade>
    </>
  )
}

export default Giocatore
