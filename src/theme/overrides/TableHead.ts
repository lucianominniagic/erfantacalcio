import type { Theme } from '@mui/material/styles'

// ==============================|| OVERRIDES - TABLE HEAD ||============================== //

export default function TableHead(theme: Theme) {
  return {
    MuiTableHead: {
      styleOverrides: {
        root: {
          fontSize: '0.875rem',
          padding: '2px',
          borderColor: theme.palette.divider,
          background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
        },
        head: {
          fontWeight: 700,
          paddingTop: '0px',
          paddingBottom: '2px',
          color: theme.palette.background.default,
        },
      },
    },
  }
}
