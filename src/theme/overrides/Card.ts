import { alpha } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'

// ==============================|| OVERRIDES - CARD ||============================== //

export default function Card(theme: Theme) {
  return {
    MuiCard: {
      styleOverrides: {
        root: {
          padding: '0px',
          marginTop: '3px',
          marginBottom: '8px',
          borderRadius: '12px',
          border: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(8px)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            borderColor: alpha(theme.palette.primary.main, 0.28),
            boxShadow: `0 4px 20px ${alpha(theme.palette.primary.main, 0.08)}`,
          },
        },
      },
    },
  }
}
