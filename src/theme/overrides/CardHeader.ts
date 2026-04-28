import type { Theme } from '@mui/material/styles'

// ==============================|| OVERRIDES - CARD HEADER ||============================== //

export default function CardHeader(theme: Theme) {
  return {
    MuiCardHeader: {
      styleOverrides: {
        root: {
          padding: '8px 12px',
          background: 'linear-gradient(135deg, rgba(255,143,0,0.15) 0%, rgba(255,193,7,0.08) 100%)',
          borderBottom: `1px solid rgba(255, 193, 7, 0.12)`,
          borderRadius: '12px 12px 0 0',
          color: theme.palette.primary.light,
          '&:last-child': {
            paddingBottom: 0,
          },
          '& .MuiCardHeader-subheader': {
            color: theme.palette.secondary.main,
          },
        },
      },
    },
  }
}
