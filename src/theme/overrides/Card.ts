// ==============================|| OVERRIDES - CARD ||============================== //

export default function Card() {
  return {
    MuiCard: {
      styleOverrides: {
        root: {
          padding: '0px',
          marginTop: '3px',
          marginBottom: '8px',
          border: '1px solid rgba(229, 57, 53, 0.15)',
        },
      },
    },
  }
}
