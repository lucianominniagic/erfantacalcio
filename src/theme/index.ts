import type { ThemeOptions } from '@mui/material/styles'

export const themeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      light: '#FFD54F',
      main: '#FFC107',
      dark: '#FF8F00',
    },
    secondary: {
      light: '#cfcfcf',
      main: '#9e9e9e',
      dark: '#707070',
    },
    info: {
      light: '#82b1ff',
      main: '#448aff',
      dark: '#2962ff',
    },
    success: {
      light: 'rgb(12, 236, 79)',
      main: 'rgb(8, 204, 67)',
      dark: 'rgb(3, 148, 47)',
    },
    error: {
      light: '#ff6f60',
      main: '#e53935',
      dark: '#ab000d',
    },
    warning: {
      light: '#ffe57f',
      main: '#ffd740',
      dark: '#c8a600',
    },
    background: {
      default: '#0d0d14',
      paper: '#16161f',
    },
    action: {
      active: '#FFC107',
      hover: 'rgba(255, 193, 7, 0.08)',
    },
    text: {
      primary: '#f5f5f5',
      secondary: '#bdbdbd',
    },
    divider: 'rgba(255, 193, 7, 0.12)',
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 768,
      md: 1024,
      lg: 1266,
      xl: 1536,
    },
  },
  direction: 'ltr',
  mixins: {
    toolbar: {
      minHeight: 60,
      paddingTop: 8,
      paddingBottom: 8,
    },
  },
  typography: {
    htmlFontSize: 16,
    fontFamily: [
      '"Montserrat"',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      color: '#f5f5f5',
      fontWeight: 700,
      fontSize: '2.0rem',
      lineHeight: 1.21,
      letterSpacing: '-0.02em',
    },
    h2: {
      color: '#FFD54F',
      fontWeight: 700,
      fontSize: '1.675rem',
      lineHeight: 1.27,
      letterSpacing: '-0.01em',
    },
    h3: {
      color: '#FFD54F',
      fontWeight: 600,
      fontSize: '1.4rem',
      lineHeight: 1.33,
    },
    h4: {
      // titolo classifica — gold gradient
      background: 'linear-gradient(135deg, #FF8F00 0%, #FFD54F 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 700,
      fontSize: '1.1rem',
      lineHeight: 1.4,
      letterSpacing: '0.02em',
    },
    h5: {
      // titolo card partite
      color: '#FFD54F',
      fontWeight: 600,
      fontSize: '0.9rem',
      lineHeight: 1.5,
    },
    h6: {
      color: '#bdbdbd',
      fontWeight: 400,
      fontSize: '0.875rem',
      lineHeight: 1.57,
    },
    caption: {
      color: '#9e9e9e',
      fontWeight: 400,
      fontSize: '0.75rem',
      lineHeight: 1.66,
    },
    body1: {
      color: '#bdbdbd',
      fontSize: '0.75rem',
      lineHeight: 1.57,
    },
    body2: {
      color: '#bdbdbd',
      fontSize: '0.75rem',
      lineHeight: 1.66,
    },
    subtitle1: {
      color: '#cfcfcf',
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.57,
    },
    subtitle2: {
      color: '#9e9e9e',
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.66,
    },
    overline: {
      lineHeight: 1.66,
      letterSpacing: '0.08em',
    },
    button: {
      textTransform: 'capitalize',
      fontSize: '0.875rem',
      fontWeight: 600,
    },
  },
}
