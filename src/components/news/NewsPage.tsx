'use client'
import { Box, Grid, Typography } from '@mui/material'
import { Newspaper } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { NEWS_FEEDS } from '~/schemas/news'
import { orpc } from '~/utils/orpc'
import NewsFeedCard from './NewsFeedCard'

/**
 * NewsPage — client component for the public /news-calcio page.
 *
 * Fetches all four RSS feeds via the public oRPC `news.getFeeds` procedure
 * and renders them as a 2×2 responsive grid of cards.
 *
 * Isolation: a single failed feed shows an error inside its own card while
 * the other three remain fully operational.
 */
export default function NewsPage() {
  const { data, isLoading } = useQuery(
    orpc.news.getFeeds.queryOptions({
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
  )

  return (
    <Box>
      {/* Page title */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <Newspaper sx={{ color: 'primary.main', fontSize: '1.6rem' }} />
        <Typography variant="h5" sx={{ fontWeight: 700 }}>
          News calcio
        </Typography>
      </Box>

      {/* 2×2 grid — xs: 1 column, sm+: 2 columns */}
      <Grid container spacing={2}>
        {NEWS_FEEDS.map((feed) => {
          const result = data?.feeds.find((f) => f.feedId === feed.id)
          return (
            <Grid item xs={12} sm={6} key={feed.id}>
              <NewsFeedCard
                label={feed.label}
                result={result}
                isLoading={isLoading}
              />
            </Grid>
          )
        })}
      </Grid>
    </Box>
  )
}
