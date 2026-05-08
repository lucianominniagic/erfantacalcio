'use client'

import React from 'react'
import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { SCORE_COL_W } from './types'

interface ScoreCellProps {
  gol: number | null | undefined
  href: string
  isWinner: boolean
  championsColor: string
}

function ScoreCell({ gol, href, isWinner, championsColor }: ScoreCellProps) {
  return (
    <Box
      component="a"
      href={href}
      sx={{
        width: SCORE_COL_W,
        height: 28,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        borderRadius: 0.75,
        flexShrink: 0,
        transition: 'background 0.15s',
        '&:hover': { bgcolor: alpha(championsColor, 0.15) },
      }}
    >
      <Typography
        sx={{
          fontSize: '0.8rem',
          fontWeight: isWinner ? 700 : 500,
          color:
            isWinner
              ? 'success.main'
              : gol !== null && gol !== undefined
                ? 'text.primary'
                : 'text.disabled',
        }}
      >
        {gol !== null && gol !== undefined ? gol : '–'}
      </Typography>
    </Box>
  )
}

export default ScoreCell
