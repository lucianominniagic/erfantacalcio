'use client'

import { Grid } from '@mui/material'
import { Suspense } from 'react'
import Formazione from '~/components/squadra/Formazione'

export default function SchieraFormazione() {
  return (
    <Suspense fallback={<div>Caricamento...</div>}>
      <Grid container justifyContent="center" spacing={0}>
        <Grid item xs={12}>
          <Formazione />
        </Grid>
      </Grid>
    </Suspense>
  )
}
