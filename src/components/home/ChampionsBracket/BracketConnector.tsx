'use client'

import React from 'react'
import { Box } from '@mui/material'
import { alpha } from '@mui/material/styles'

function BracketConnector({ color }: { color: string }) {
  const b = `2px solid ${alpha(color, 0.4)}`
  return (
    <Box sx={{ display: 'flex', alignSelf: 'stretch', alignItems: 'center', mx: 0.25 }}>
      {/* Vertical ] */}
      <Box sx={{ width: 12, alignSelf: 'stretch', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1.8, borderRight: 0, borderBottom: b }} />
        <Box sx={{ flex: 3, borderRight: b, borderBottom: 0 }} />
        <Box sx={{ flex: 1.4, borderRight: 0, borderTop: b }} />
      </Box>
      {/* Horizontal bridge */}
      <Box sx={{ width: 12, alignSelf: 'stretch', display: 'flex', flexDirection: 'column' }}>
        <Box sx={{ flex: 1.2, borderBottom: b }} />
        <Box sx={{ flex: 1 }} />
      </Box>
    </Box>
  )
}

export default BracketConnector
