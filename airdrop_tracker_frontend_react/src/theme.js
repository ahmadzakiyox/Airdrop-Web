// airdrop_tracker_frontend_react/src/theme.js
import { createTheme } from '@mui/material/styles';
import { deepPurple, grey, green, blue, red, orange, cyan } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: deepPurple[400],
      light: deepPurple[300],
      dark: deepPurple[500],
      contrastText: '#fff',
    },
    secondary: {
      main: green['A400'],
      light: green['A200'],
      dark: green['A700'],
      contrastText: '#000',
    },
    error: {
        main: red[500],
        light: red[300],
        dark: red[700],
        contrastText: '#fff',
    },
    warning: {
        main: orange[500],
        light: orange[300],
        dark: orange[700],
        contrastText: '#000',
    },
    info: {
        main: blue[500],
        light: blue[300],
        dark: blue[700],
        contrastText: '#fff',
    },
    success: {
        main: green[500],
        light: green[300],
        dark: green[700],
        contrastText: '#fff',
    },
    background: {
      default: '#0d0d0d', // Latar belakang utama
      paper: '#1a1a1a', // Latar belakang untuk Paper, Card, Alert, dll.
    },
    text: {
      primary: '#e0e0e0', // Warna teks utama
      secondary: '#a0a0a0', // Warna teks sekunder
    },
    metallicGold: {
      main: '#FFD700',
      gradient: 'linear-gradient(45deg, #FFD700 30%, #FF8C00 90%)',
    },
      neonGlow: { // <<< PASTIKAN INI SAMA PERSIS
      main: 'rgba(0, 230, 118, 0.6)',
      primaryGlow: 'rgba(103, 58, 183, 0.4)',
    }
  },
  typography: {
    fontFamily: 'Montserrat, sans-serif',
    h1: { fontSize: '3.2rem', fontWeight: 700, color: '#fff' },
    h2: { fontSize: '2.8rem', fontWeight: 600, color: '#fff' },
    h3: { fontSize: '2.2rem', fontWeight: 600, color: '#fff' },
    h4: { fontSize: '1.9rem', fontWeight: 500, color: '#fff' },
    h5: { fontSize: '1.6rem', fontWeight: 500, color: '#fff' },
    h6: { fontSize: '1.3rem', fontWeight: 500, color: '#fff' },
    body1: { fontSize: '1rem', color: '#e0e0e0' },
    body2: { fontSize: '0.875rem', color: '#a0a0a0' },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 10,
          padding: '10px 20px',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: `0 0 15px 3px ${theme.palette.primary.dark}`,
            transform: 'translateY(-2px)',
          },
        }),
        containedPrimary: ({ theme }) => ({
            background: theme.palette.metallicGold.gradient,
            color: '#1a1a1a',
            boxShadow: `0 4px 20px ${theme.palette.metallicGold.main}40`,
            '&:hover': {
                boxShadow: `0 0 25px 5px ${theme.palette.metallicGold.main}80`,
                background: `linear-gradient(45deg, ${theme.palette.secondary.dark} 30%, ${theme.palette.secondary.light} 90%)`,
            },
        }),
        containedSecondary: ({ theme }) => ({
            background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.secondary.dark} 90%)`,
            boxShadow: `0 4px 20px ${theme.palette.secondary.main}40`,
            '&:hover': {
                boxShadow: `0 0 25px 5px ${theme.palette.neonGlow.main}`,
                background: `linear-gradient(45deg, ${theme.palette.secondary.dark} 30%, ${theme.palette.secondary.main} 90%)`,
            },
        }),
        outlinedPrimary: ({ theme }) => ({
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.light,
            '&:hover': {
                borderColor: theme.palette.primary.light,
                boxShadow: `0 0 10px ${theme.palette.neonGlow.primaryGlow}`,
                backgroundColor: 'rgba(103, 58, 183, 0.1)',
            },
        }),
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#151515',
          boxShadow: '0 8px 30px rgba(0,0,0,0.6)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 16,
          background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, rgba(26,26,26,0.8) 100%)`,
          border: `1px solid rgba(255, 255, 255, 0.08)`,
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out, border-color 0.3s ease-in-out',
          '&:hover': {
            transform: 'translateY(-8px)',
            boxShadow: `0 18px 60px rgba(0,0,0,0.8), 0 0 25px ${theme.palette.neonGlow.primaryGlow}`,
            borderColor: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 16,
          backgroundColor: theme.palette.background.paper,
          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
          border: `1px solid rgba(255, 255, 255, 0.08)`,
        })
      }
    },
    MuiTextField: {
        styleOverrides: {
            root: ({ theme }) => ({
                '& .MuiInputBase-input': {
                    color: theme.palette.text.primary,
                    padding: '12px 14px',
                },
                '& .MuiInputLabel-root': {
                    color: theme.palette.text.secondary,
                },
                '& .MuiInputLabel-root.Mui-focused': {
                    color: theme.palette.primary.main,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.grey[700],
                    borderRadius: 8,
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.grey[600],
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                    borderColor: theme.palette.primary.main + ' !important',
                    boxShadow: `0 0 0 2px ${theme.palette.neonGlow.primaryGlow}`,
                },
            }),
        },
    },
    MuiAlert: {
        styleOverrides: {
            root: ({ theme }) => ({
                borderRadius: 8,
                '&.MuiAlert-standardError': {
                    backgroundColor: theme.palette.error.dark,
                    color: theme.palette.common.white,
                    borderColor: theme.palette.error.main,
                    boxShadow: `0 2px 10px ${theme.palette.error.main}40`,
                },
                '&.MuiAlert-standardSuccess': {
                    backgroundColor: theme.palette.success.dark,
                    color: theme.palette.common.white,
                    borderColor: theme.palette.success.main,
                    boxShadow: `0 2px 10px ${theme.palette.success.main}40`,
                },
                 '&.MuiAlert-standardInfo': {
                    backgroundColor: theme.palette.info.dark,
                    color: theme.palette.common.white,
                    borderColor: theme.palette.info.main,
                    boxShadow: `0 2px 10px ${theme.palette.info.main}40`,
                },
                 '&.MuiAlert-standardWarning': {
                    backgroundColor: theme.palette.warning.dark,
                    color: theme.palette.common.white,
                    borderColor: theme.palette.warning.main,
                    boxShadow: `0 2px 10px ${theme.palette.warning.main}40`,
                }
            })
        }
    },
    MuiChip: {
        styleOverrides: {
            root: ({ theme }) => ({
                fontWeight: 600,
                textTransform: 'uppercase',
                borderRadius: 6,
                padding: '4px 8px',
                '&.MuiChip-colorDefault': {
                    backgroundColor: theme.palette.grey[800],
                    color: theme.palette.text.secondary,
                },
            })
        }
    },
    MuiSvgIcon: {
        styleOverrides: {
            root: ({ theme }) => ({
                color: theme.palette.text.secondary,
            })
        }
    },
    MuiTableCell: { // Styling untuk Table
        styleOverrides: {
            root: ({ theme }) => ({
                borderColor: theme.palette.grey[800], // Border antar cell
                color: theme.palette.text.primary,
            }),
            head: ({ theme }) => ({
                backgroundColor: theme.palette.grey[900], // Header table lebih gelap
                color: theme.palette.text.primary,
                fontWeight: 'bold',
            }),
        }
    }
  },
});

export default theme;