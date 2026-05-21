'use client'
import { Suspense, useState } from 'react'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import Stack from '@mui/material/Stack'
import Link from '@mui/material/Link'
import { LockOpen } from '@mui/icons-material'
import { alpha, useTheme } from '@mui/material/styles'
import { useMutation } from '@tanstack/react-query'
import { orpc } from '~/utils/orpc'
import { requestPasswordResetSchema } from '~/schemas/auth'

// ---------------------------------------------------------------------------
// Inner form — isolated so future useSearchParams usage can be Suspense-safe
// ---------------------------------------------------------------------------

function RecuperaPasswordForm() {
  const requestReset = useMutation(orpc.auth.requestPasswordReset.mutationOptions())
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setClientError(null)

    const result = requestPasswordResetSchema.safeParse({ email })
    if (!result.success) {
      setClientError('Inserisci un indirizzo email valido.')
      return
    }

    try {
      await requestReset.mutateAsync({ email })
    } catch {
      // Intentionally ignored — always show neutral message (security by design)
    } finally {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <Stack spacing={2} alignItems="center" sx={{ width: '100%' }}>
        <Alert severity="info" sx={{ width: '100%' }}>
          <AlertTitle>Email inviata</AlertTitle>
          Se la mail è registrata, riceverai le istruzioni per il recupero
          password.
        </Alert>
        <Link
          href="/login"
          underline="hover"
          variant="body2"
          sx={{ color: 'text.secondary', mt: 1 }}
        >
          ← Torna al login
        </Link>
      </Stack>
    )
  }

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{ width: '100%' }}
    >
      <Stack spacing={2.5}>
        <TextField
          fullWidth
          label="Indirizzo email"
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setClientError(null) }}
          required
          autoComplete="email"
          autoFocus
          placeholder="es. mario.rossi@example.com"
        />

        {clientError && (
          <Alert severity="error" onClose={() => setClientError(null)}>
            <AlertTitle>Errore</AlertTitle>
            {clientError}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={requestReset.isPending}
          sx={{ py: 1.25 }}
        >
          {requestReset.isPending ? 'Invio in corso...' : 'Recupera password'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Link
            href="/login"
            underline="hover"
            variant="body2"
            sx={{ color: 'text.secondary', fontSize: '0.8rem' }}
          >
            ← Torna al login
          </Link>
        </Box>
      </Stack>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// Page — outer container styled like /login
// ---------------------------------------------------------------------------

export default function RecuperaPasswordPage() {
  const theme = useTheme()

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(ellipse at 50% 0%, rgba(255,193,7,0.06) 0%, transparent 70%)',
      }}
    >
      <Container maxWidth="xs">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            p: { xs: 3, sm: 4 },
            borderRadius: '16px',
            border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
            background:
              'linear-gradient(160deg, rgba(26,18,8,0.95) 0%, rgba(22,22,31,0.98) 100%)',
            backdropFilter: 'blur(16px)',
            boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px ${alpha(theme.palette.primary.main, 0.06)}`,
          }}
        >
          {/* Icon */}
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.25)}`,
            }}
          >
            <LockOpen sx={{ color: theme.palette.background.default, fontSize: '1.75rem' }} />
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontSize: '1.5rem',
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.light} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
              letterSpacing: '-0.02em',
            }}
          >
            Recupera password
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', mb: 3, letterSpacing: '0.06em', textAlign: 'center' }}
          >
            Inserisci la tua email per ricevere le istruzioni di recupero
          </Typography>

          <Suspense fallback={<div>Caricamento...</div>}>
            <RecuperaPasswordForm />
          </Suspense>
        </Box>
      </Container>
    </Box>
  )
}
