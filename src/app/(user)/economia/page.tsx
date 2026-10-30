import { Grid } from '@mui/material'
import { Suspense } from 'react'
import Economia from '~/components/home/Economia'
export default function EconomiaPage() {
  return (
    <Grid container justifyContent="center" spacing={0}>
      <Grid item xs={12}>
        <Suspense fallback={<div>Caricamento...</div>}>
          <Economia />
        </Suspense>
      </Grid>
    </Grid>
  )
}
