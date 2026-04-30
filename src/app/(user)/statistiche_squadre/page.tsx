import { Grid } from '@mui/material'
import { Suspense } from 'react'
import StatisticheSquadre from '~/components/statisticheSquadre/StatisticheSquadre'

export default function StatisticheSquadrePage() {
  return (
    <Grid container justifyContent="center" spacing={0}>
      <Grid item xs={12}>
        <Suspense fallback={<div>Caricamento...</div>}>
          <StatisticheSquadre />
        </Suspense>
      </Grid>
    </Grid>
  )
}
