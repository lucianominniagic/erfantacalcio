import type { Theme } from '@mui/material/styles'

// ==============================|| OVERRIDES - DATAGRID ||============================== //

export default function DataGrid(theme: Theme) {
  return {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          background: 'linear-gradient(135deg, rgba(255,143,0,0.15) 0%, rgba(255,193,7,0.08) 100%)',
          fontFamily: theme.typography.fontFamily,
          fontSize: '0.75rem',
        },
        columnHeader: {
          background: '#393027',
          color: theme.palette.secondary.main,
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
