import type { Theme } from '@mui/material/styles'

// ==============================|| OVERRIDES - DATAGRID ||============================== //

export default function DataGrid(theme: Theme) {
  const isDark = theme.palette.mode === 'dark'
  return {
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          background: isDark
            ? 'linear-gradient(135deg, rgba(255,143,0,0.15) 0%, rgba(255,193,7,0.08) 100%)'
            : theme.palette.background.paper,
          fontFamily: theme.typography.fontFamily,
          fontSize: '0.75rem',
        },
        columnHeader: {
          background: isDark ? '#393027' : theme.palette.primary.dark,
          color: isDark ? theme.palette.secondary.main : '#fff',
          fontWeight: 700,
        },
        columnHeaderTitle: {
          fontWeight: 700,
          fontSize: '0.72rem',
        },
        row: {
          '&:nth-of-type(even)': {
            backgroundColor: isDark
              ? 'rgba(255, 193, 7, 0.03)'
              : 'rgba(255, 143, 0, 0.04)',
          },
          '&:hover': {
            backgroundColor: isDark
              ? 'rgba(255, 193, 7, 0.07)'
              : 'rgba(255, 143, 0, 0.08)',
          },
        },
        cell: {
          borderBottom: `1px solid ${theme.palette.divider}`,
        },
      },
    },
  }
}
