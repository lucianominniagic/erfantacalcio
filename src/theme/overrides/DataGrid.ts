import { alpha, darken } from '@mui/material/styles'
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
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.08)} 100%)`
            : theme.palette.background.paper,
          fontFamily: theme.typography.fontFamily,
          fontSize: '0.75rem',
        },
        columnHeader: {
          background: isDark
            ? darken(theme.palette.primary.dark, 0.85)
            : theme.palette.primary.dark,
          color: isDark ? theme.palette.secondary.main : theme.palette.common.white,
          fontWeight: 700,
        },
        columnHeaderTitle: {
          fontWeight: 700,
          fontSize: '0.72rem',
        },
        row: {
          '&:nth-of-type(even)': {
            backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.03 : 0.04),
          },
          '&:hover': {
            backgroundColor: alpha(theme.palette.primary.main, isDark ? 0.07 : 0.08),
          },
        },
        cell: {
          borderBottom: `1px solid ${theme.palette.divider}`,
        },
      },
    },
  }
}
