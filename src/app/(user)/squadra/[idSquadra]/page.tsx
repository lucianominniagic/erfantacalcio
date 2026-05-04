import { Grid } from '@mui/material'
import { Suspense } from 'react'
import Rosa from '~/components/squadra/Rosa'
import StatisticaSquadra from '~/components/squadra/Squadra'

export default async function SquadraPage({
  params,
}: {
  params: Promise<{ idSquadra: string }>
}) {
  const { idSquadra: idSquadraStr } = await params
  const idSquadra = Number(idSquadraStr)

  if (isNaN(idSquadra)) {
    return <p>Errore: ID Squadra non valido</p>
  }

  return (
    <Grid container justifyContent="center" spacing={0}>
      <Grid item xs={12}>
        <Suspense fallback={<div>Caricamento...</div>}>
          <StatisticaSquadra idSquadra={idSquadra} />
        </Suspense>
      </Grid>
      <Grid item xs={12}>
        <Suspense fallback={<div>Caricamento...</div>}>
          <Rosa idSquadra={idSquadra} />
        </Suspense>
      </Grid>
    </Grid>
  )
}
