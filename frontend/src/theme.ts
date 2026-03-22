import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6C5CE7',
      dark: '#5A4FCF',
      light: '#8B7CF3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00CEC9',
    },
    background: {
      default: '#F5F6FA',
      paper: '#ffffff',
    },
    text: {
      primary: '#0A0E1A',
      secondary: '#636E72',
    },
  },
  typography: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 800 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 700 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
          padding: '10px 24px',
          fontSize: '0.95rem',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #6C5CE7 0%, #8B7CF3 100%)',
          boxShadow: '0 4px 24px rgba(108, 92, 231, 0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #5A4FCF 0%, #7B6CE3 100%)',
            boxShadow: '0 6px 32px rgba(108, 92, 231, 0.45)',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
          border: '1px solid rgba(0,0,0,0.06)',
          transition: 'box-shadow 0.2s ease, transform 0.2s ease',
          '&:hover': {
            boxShadow: '0 8px 40px rgba(108, 92, 231, 0.12)',
            transform: 'translateY(-4px)',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(10, 14, 26, 0.85)',
          backdropFilter: 'blur(20px)',
          boxShadow: 'none',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        },
      },
    },
  },
});

export default theme;
