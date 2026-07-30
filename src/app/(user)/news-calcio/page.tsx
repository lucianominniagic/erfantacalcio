import { Grid } from '@mui/material'
import { Suspense } from 'react'
import NewsPage from '~/components/news/NewsPage'

export const metadata = {
  title: 'News calcio — ErFantacalcio',
}

export default function NewsCalcioPage() {
  return (
    <Grid container justifyContent="center">
      <Grid item xs={12}>
        <Suspense fallback={<div>Caricamento...</div>}>
          <NewsPage />
        </Suspense>
      </Grid>
    </Grid>
  )
}
