'use client'
import { Grid, Typography } from '@mui/material'
import Image from 'next/image'

interface ProfiloData {
  urlCampioncino: string
  nome: string
  media?: number | string | null
  gol?: number | string | null
  assist?: number | string | null
  ammonizioni?: number | string | null
  espulsioni?: number | string | null
  ruoloEsteso?: string | null
  giocate?: number | string | null
  costo?: number | string | null
  squadraSerieA?: string | null
  squadra?: string | null
}

interface GiocatoreProfileProps {
  profilo: ProfiloData
}

export function GiocatoreProfile({ profilo }: GiocatoreProfileProps) {
  const statBlock = (
    <Grid container>
      <Grid item sm={3} xs={6}>
        <img
          src={profilo.urlCampioncino}
          width={115}
          height={170}
          alt={profilo.nome}
        />
      </Grid>
      <Grid item sm={4} xs={6}>
        <Typography variant="h5">
          Nome: {profilo.nome}
          <br />
          Media voti: {profilo.media}
          <br />
          Gol: {profilo.gol}
          <br />
          Assist: {profilo.assist}
          <br />
          Ammonizioni: {profilo.ammonizioni}
          <br />
          Espulsioni: {profilo.espulsioni}
        </Typography>
      </Grid>
      <Grid item sm={5} xs={12}>
        <Typography variant="h5">
          Ruolo: {profilo.ruoloEsteso}
          <br />
          Partite giocate: {profilo.giocate}
          <br />
          Costo trasferimento: {profilo.costo}
          <br />
          Squadra serie A: {profilo.squadraSerieA}
          <br />
          Squadra: {profilo.squadra}
        </Typography>
      </Grid>
    </Grid>
  )

  return (
    <>
      {/* Desktop */}
      <Grid item xs={12} sm={6} sx={{ display: { xs: 'none', sm: 'block' } }}>
        {statBlock}
      </Grid>
      {/* Mobile */}
      <Grid item xs={12} sx={{ display: { xs: 'block', sm: 'none' } }}>
        <Grid container>
          <Grid item xs={6}>
            <Typography variant="h6">
              Nome: {profilo.nome}
              <br />
              Media voti: {profilo.media}
              <br />
              Gol: {profilo.gol}
              <br />
              Assist: {profilo.assist}
              <br />
              Ammonizioni: {profilo.ammonizioni}
              <br />
              Espulsioni: {profilo.espulsioni}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="h6">
              Ruolo: {profilo.ruoloEsteso}
              <br />
              Partite giocate: {profilo.giocate}
              <br />
              Costo trasferimento: {profilo.costo}
              <br />
              Squadra serie A: {profilo.squadraSerieA}
              <br />
              Squadra: {profilo.squadra}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
    </>
  )
}
