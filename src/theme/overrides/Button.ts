import { alpha } from '@mui/material/styles'
import type { Theme } from '@mui/material/styles'

// ==============================|| OVERRIDES - BUTTON ||============================== //

export default function Button(theme: Theme) {
  const disabledStyle = {
    '&.Mui-disabled': {
      backgroundColor: theme.palette.grey[800],
    },
  }

  return {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: '8px',
          letterSpacing: '0.02em',
        },
        contained: {
          ...disabledStyle,
        },
        containedPrimary: {
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
          color: theme.palette.background.default,
          '&:hover': {
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
          },
        },
        outlined: {
          ...disabledStyle,
        },
        outlinedPrimary: {
          borderColor: alpha(theme.palette.primary.main, 0.5),
          '&:hover': {
            borderColor: theme.palette.primary.main,
            backgroundColor: theme.palette.action.hover,
          },
        },
      },
    },
  }
}
