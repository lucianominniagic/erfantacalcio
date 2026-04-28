// ==============================|| OVERRIDES - CARD ||============================== //

export default function Card() {
  return {
    MuiCard: {
      styleOverrides: {
        root: {
          padding: '0px',
          marginTop: '3px',
          marginBottom: '8px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 193, 7, 0.12)',
          backdropFilter: 'blur(8px)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
          '&:hover': {
            borderColor: 'rgba(255, 193, 7, 0.28)',
            boxShadow: '0 4px 20px rgba(255, 193, 7, 0.08)',
          },
        },
      },
    },
  }
}
