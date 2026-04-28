import type { Theme } from '@mui/material/styles'

// ==============================|| OVERRIDES - DATAGRID ||============================== //

export default function DataGrid(theme: Theme) {
  return {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          backgroundColor: theme.palette.background.paper,
          fontFamily: theme.typography.fontFamily,
          fontSize: '0.75rem',
        },
        columnHeader: {
          background: 'linear-gradient(135deg, #FF8F00 0%, #FFC107 100%)',
          color: '#0d0d14',
          fontWeight: 700,
        },
        columnHeaderTitle: {
          fontWeight: 700,
          fontSize: '0.72rem',
        },
        row: {
          '&:nth-of-type(even)': {
            backgroundColor: 'rgba(255, 193, 7, 0.03)',
          },
          '&:hover': {
            backgroundColor: 'rgba(255, 193, 7, 0.07)',
          },
        },
        cell: {
          borderBottom: `1px solid rgba(255, 193, 7, 0.06)`,
        },
      },
    },
  }
}
