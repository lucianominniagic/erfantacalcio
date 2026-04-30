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
  },
}
