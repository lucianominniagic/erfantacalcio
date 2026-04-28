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
          background: 'linear-gradient(135deg, #FF8F00 0%, #FFC107 100%)',
          color: '#0d0d14',
          '&:hover': {
            background: 'linear-gradient(135deg, #FFC107 0%, #FFD54F 100%)',
          },
        },
        outlined: {
          ...disabledStyle,
        },
        outlinedPrimary: {
          borderColor: 'rgba(255, 193, 7, 0.5)',
          '&:hover': {
            borderColor: '#FFC107',
            backgroundColor: 'rgba(255, 193, 7, 0.08)',
          },
        },
      },
    },
  }
}
