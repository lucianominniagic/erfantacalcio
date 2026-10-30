import { Typography } from '@mui/material'
import { SCORE_COL_W } from './types'

export default function LegLabel({
  label,
  fullLabel,
}: {
  label: string
  fullLabel: string
}) {
  return (
    <Typography
      component="abbr"
      title={fullLabel}
      variant="caption"
      color="text.secondary"
      sx={{
        width: SCORE_COL_W,
        flexShrink: 0,
        textAlign: 'center',
        textDecoration: 'none',
      }}
    >
      {label}
    </Typography>
  )
}
