'use client'

import React from 'react'
import { Box, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { SCORE_COL_W } from './types'

function LegLabel({
  label,
  championsColor,
  disabled,
}: {
  label: string
  championsColor: string
  disabled?: boolean
}) {
  return (
    <Box
      sx={{
        width: SCORE_COL_W,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Typography
        sx={{
          fontSize: '0.58rem',
          fontWeight: 700,
          color: disabled ? 'text.disabled' : championsColor,
          bgcolor: disabled ? alpha('#888', 0.1) : alpha(championsColor, 0.12),
          borderRadius: 1,
          px: 0.6,
          py: 0.1,
          letterSpacing: '0.04em',
          lineHeight: 1.6,
          userSelect: 'none',
        }}
      >
        {label}
      </Typography>
    </Box>
  )
}

export default LegLabel
