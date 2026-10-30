'use client'

import React from 'react'
import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { SCORE_COL_W } from './types'

interface ScoreCellProps {
  gol: number | null | undefined
  href: string | undefined
  label: string
  isWinner: boolean
  championsColor: string
}

function ScoreCell({
  gol,
  href,
  label,
  isWinner,
  championsColor,
}: ScoreCellProps) {
  return (
    <Box
      component={href ? 'a' : 'span'}
      href={href}
      aria-label={label}
      sx={{
        width: SCORE_COL_W,
        height: 44,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        borderRadius: 0.75,
        flexShrink: 0,
        transition: 'background 0.15s',
        '&:hover': { bgcolor: alpha(championsColor, 0.15) },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'champions.main',
        },
      }}
    >
      <Typography
        sx={{
          fontSize: '0.875rem',
          fontWeight: isWinner ? 700 : 500,
          color: isWinner
            ? 'success.main'
            : gol !== null && gol !== undefined
              ? 'text.primary'
              : 'text.disabled',
        }}
      >
        {gol ?? '—'}
      </Typography>
    </Box>
  )
}

export default ScoreCell
