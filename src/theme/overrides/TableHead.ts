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
          background: 'linear-gradient(135deg, #FF8F00 0%, #FFC107 100%)',
        },
        head: {
          fontWeight: 700,
          paddingTop: '0px',
          paddingBottom: '2px',
          color: '#0d0d14',
        },
      },
    },
  }
}
