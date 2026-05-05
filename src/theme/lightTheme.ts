import type { ThemeOptions } from '@mui/material/styles'

export const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      light: '#FFD54F',
      main: '#FF8F00',
      dark: '#E65100',
    },
    secondary: {
      light: '#757575',
      main: '#616161',
      dark: '#424242',
    },
    info: {
      light: '#82b1ff',
      main: '#448aff',
      dark: '#2962ff',
    },
    success: {
      light: '#66bb6a',
      main: '#43a047',
      dark: '#2e7d32',
    },
    error: {
      light: '#ef9a9a',
      main: '#e53935',
      dark: '#b71c1c',
    },
    warning: {
      light: '#ffcc02',
      main: '#ffb300',
      dark: '#e65100',
    },
    background: {
      default: '#f0f0f5',
      paper: '#ffffff',
    },
    action: {
      active: '#FF8F00',
      hover: 'rgba(255, 143, 0, 0.08)',
    },
    text: {
      primary: '#1a1a2e',
      secondary: '#4a4a6a',
    },
    divider: 'rgba(255, 143, 0, 0.2)',
    champions: {
      main: '#7c3aed',
      light: '#a855f7',
      dark: '#5b21b6',
      contrastText: '#fff',
    },
  },
  typography: {
    h1: {
      color: '#1a1a2e',
      fontWeight: 700,
      fontSize: '2.0rem',
      lineHeight: 1.21,
      letterSpacing: '-0.02em',
    },
    h2: {
      color: '#E65100',
      fontWeight: 700,
      fontSize: '1.675rem',
      lineHeight: 1.27,
      letterSpacing: '-0.01em',
    },
    h3: {
      color: '#E65100',
      fontWeight: 600,
      fontSize: '1.4rem',
      lineHeight: 1.33,
    },
    h4: {
      // titolo classifica — gradient più scuro su sfondo chiaro
      background: 'linear-gradient(135deg, #E65100 0%, #FF8F00 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 700,
      fontSize: '1.1rem',
      lineHeight: 1.4,
      letterSpacing: '0.02em',
    },
    h5: {
      // titolo card partite
      color: '#E65100',
      fontWeight: 600,
      fontSize: '0.9rem',
      lineHeight: 1.5,
    },
    h6: {
      color: '#4a4a6a',
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.57,
    },
    caption: {
      color: '#4a4a6a',
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 1.66,
    },
    body1: {
      color: '#1a1a2e',
      fontSize: '0.75rem',
      lineHeight: 1.57,
    },
    body2: {
      color: '#1a1a2e',
      fontSize: '0.75rem',
      lineHeight: 1.66,
    },
    subtitle1: {
      color: '#1a1a2e',
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.57,
    },
    subtitle2: {
      color: '#4a4a6a',
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.66,
    },
  },
}
