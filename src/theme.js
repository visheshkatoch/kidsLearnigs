import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#7C4DFF',
      light: '#B47CFF',
      dark: '#5B2FD6',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF6D00',
      light: '#FF9E40',
      dark: '#C43C00',
      contrastText: '#ffffff',
    },
    success: { main: '#2E7D32', light: '#4CAF50' },
    error:   { main: '#C62828', light: '#F44336' },
    background: {
      default: '#EDE7F6',
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Nunito", "Segoe UI", Arial, sans-serif',
    h4: { fontWeight: 900 },
    h5: { fontWeight: 800 },
    h6: { fontWeight: 700 },
    body1: { fontWeight: 600 },
    button: { fontWeight: 700, textTransform: 'none', letterSpacing: 0.3 },
  },
  shape: { borderRadius: 16 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 50,
          fontSize: '1rem',
          padding: '10px 28px',
        },
        contained: {
          boxShadow: '0 4px 14px rgba(0,0,0,0.18)',
          '&:hover': { boxShadow: '0 6px 20px rgba(0,0,0,0.25)' },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 4px 20px rgba(0,0,0,0.10)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 8 },
        bar:  { borderRadius: 8 },
      },
    },
  },
})
