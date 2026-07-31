'use client'
/**
 * error.tsx — error boundary per /serie-a.
 *
 * Richiede 'use client' per Next.js App Router.
 * Cattura errori del service (API football-data.org non disponibile,
 * rate limit, rete, ecc.) mostrando un messaggio dedicato
 * invece di far esplodere il layout globale.
 */
import { Box, Button, Typography } from '@mui/material'
import { ErrorOutline, SportsSoccer } from '@mui/icons-material'

interface SerieAErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function SerieAError({ error, reset }: SerieAErrorProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        gap: 2,
        textAlign: 'center',
      }}
      role="alert"
      aria-live="assertive"
    >
      <SportsSoccer sx={{ fontSize: '3rem', color: 'text.disabled' }} />
      <ErrorOutline sx={{ fontSize: '2rem', color: 'error.main' }} />

      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        Dati Serie A non disponibili
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ maxWidth: 380 }}
      >
        Non è stato possibile recuperare i dati della Serie A. Il servizio
        potrebbe essere temporaneamente non disponibile o in fase di
        configurazione.
      </Typography>

      {process.env.NODE_ENV === 'development' && error.message && (
        <Typography
          variant="caption"
          sx={{
            color: 'error.main',
            bgcolor: 'action.hover',
            px: 2,
            py: 1,
            borderRadius: 1,
            fontFamily: 'monospace',
            maxWidth: 480,
            wordBreak: 'break-all',
          }}
        >
          {error.message}
        </Typography>
      )}

      <Button variant="contained" onClick={reset} sx={{ mt: 1 }}>
        Riprova
      </Button>
    </Box>
  )
}
