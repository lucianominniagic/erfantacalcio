'use client'
import { Suspense, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Alert from '@mui/material/Alert'
import AlertTitle from '@mui/material/AlertTitle'
import InputAdornment from '@mui/material/InputAdornment'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import { LockReset, Visibility, VisibilityOff } from '@mui/icons-material'
import { alpha, useTheme } from '@mui/material/styles'
import { useMutation } from '@tanstack/react-query'
import { orpc } from '~/utils/orpc'

// ---------------------------------------------------------------------------
// Inner form — uses useSearchParams() so must be wrapped in <Suspense>
// ---------------------------------------------------------------------------

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const theme = useTheme()
  const token = searchParams?.get('token') ?? ''

  const resetPassword = useMutation(orpc.auth.resetPassword.mutationOptions())

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  // Token assente — link non valido
  if (!token) {
    return (
      <Alert severity="error" sx={{ width: '100%' }}>
        <AlertTitle>Link non valido</AlertTitle>
        Il link che hai utilizzato non è valido. Richiedine uno nuovo dalla
        pagina di recupero password.
      </Alert>
    )
  }

  if (done) {
    return (
      <Stack spacing={2} alignItems="center" sx={{ width: '100%' }}>
        <Alert severity="success" sx={{ width: '100%' }}>
          <AlertTitle>Password aggiornata!</AlertTitle>
          Puoi ora accedere con la tua nuova password.
        </Alert>
        <Button
          variant="contained"
          fullWidth
          onClick={() => router.push('/login')}
          sx={{ py: 1.25 }}
        >
          Vai al login
        </Button>
      </Stack>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setClientError(null)
    resetPassword.reset()

    if (newPassword.length < 6) {
      setClientError('La nuova password deve contenere almeno 6 caratteri.')
      return
    }

    if (newPassword !== confirmPassword) {
      setClientError('Le password non coincidono.')
      return
    }

    try {
      await resetPassword.mutateAsync({ token, newPassword })
      setDone(true)
    } catch {
      // error surfaced via resetPassword.error
    }
  }

  // Mappa i codici oRPC in messaggi user-friendly
  const getServerErrorMessage = () => {
    // oRPC exposes the error code directly on the error object (not via .data.code like tRPC)
    const code = (resetPassword.error as { code?: string } | null)?.code
    if (code === 'NOT_FOUND') return 'Link non valido o già utilizzato.'
    if (code === 'BAD_REQUEST') return 'Link scaduto. Richiedine uno nuovo.'
    return resetPassword.error?.message ?? null
  }

  const serverError = getServerErrorMessage()

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
          label="Nuova password"
          type={showNew ? 'text' : 'password'}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          helperText="Minimo 6 caratteri"
          autoComplete="new-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowNew((v) => !v)}
                  edge="end"
                  size="small"
                  aria-label={showNew ? 'Nascondi password' : 'Mostra password'}
                >
                  {showNew ? (
                    <VisibilityOff fontSize="small" />
                  ) : (
                    <Visibility fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          label="Conferma nuova password"
          type={showConfirm ? 'text' : 'password'}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          autoComplete="new-password"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowConfirm((v) => !v)}
                  edge="end"
                  size="small"
                  aria-label={showConfirm ? 'Nascondi password' : 'Mostra password'}
                >
                  {showConfirm ? (
                    <VisibilityOff fontSize="small" />
                  ) : (
                    <Visibility fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {clientError && (
          <Alert severity="error" onClose={() => setClientError(null)}>
            <AlertTitle>Errore</AlertTitle>
            {clientError}
          </Alert>
        )}

        {serverError && (
          <Alert severity="error" onClose={() => resetPassword.reset()}>
            <AlertTitle>Errore</AlertTitle>
            {serverError}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={resetPassword.isPending}
          sx={{ py: 1.25 }}
        >
          {resetPassword.isPending ? 'Salvataggio...' : 'Imposta nuova password'}
        </Button>
      </Stack>
    </Box>
  )
}

// ---------------------------------------------------------------------------
// Page — outer container styled like /login
// ---------------------------------------------------------------------------

export default function ResetPasswordPage() {
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
            <LockReset sx={{ color: theme.palette.background.default, fontSize: '1.75rem' }} />
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
            Nuova password
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', mb: 3, letterSpacing: '0.06em' }}
          >
            Scegli una nuova password per il tuo account
          </Typography>

          <Suspense fallback={<div>Caricamento...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </Box>
      </Container>
    </Box>
  )
}
