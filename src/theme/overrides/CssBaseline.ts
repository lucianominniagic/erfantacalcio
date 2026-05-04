import type { Theme } from '@mui/material/styles'

// ==============================|| OVERRIDES - CSS BASELINE ||============================== //

export default function CssBaseline(theme: Theme) {
  const isDark = theme.palette.mode === 'dark'

  const dotColor = isDark
    ? 'rgba(255, 193, 7, 0.12)'
    : 'rgba(180, 120, 0, 0.09)'

  return {
    MuiCssBaseline: {
      styleOverrides: {
        '@keyframes dotPulse': {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0.35 },
        },
        'body::before': {
          content: '""',
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          pointerEvents: 'none',
          backgroundImage: `radial-gradient(circle, ${dotColor} 1px, transparent 1px)`,
          backgroundSize: '24px 24px',
          animation: 'dotPulse 6s ease-in-out infinite',
        },
        // ensure page content sits above the pseudo-element
        '#__next, body > div': {
          position: 'relative',
          zIndex: 1,
        },
      },
    },
  }
}
