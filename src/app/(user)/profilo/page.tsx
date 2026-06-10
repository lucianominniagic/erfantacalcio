'use client'
import { useState } from 'react'
import { useSession } from 'next-auth/react'
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  AlertTitle,
  InputAdornment,
  IconButton,
  Stack,
} from '@mui/material'
import { Visibility, VisibilityOff, Lock } from '@mui/icons-material'
import { alpha, useTheme } from '@mui/material/styles'
import { useMutation } from '@tanstack/react-query'
import { orpc } from '~/utils/orpc'

export default function ProfiloPage() {
  const { data: session } = useSession()
  const theme = useTheme()
  const changePassword = useMutation(orpc.profilo.changePassword.mutationOptions())

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showOld, setShowOld] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [clientError, setClientError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setClientError(null)
    setSuccess(false)
    changePassword.reset()

    if (!oldPassword) {
      setClientError('Inserisci la vecchia password.')
      return
    }

    if (newPassword.length < 6) {
      setClientError('La nuova password deve contenere almeno 6 caratteri.')
      return
    }

    if (newPassword !== confirmPassword) {
      setClientError('Le nuove password non coincidono.')
      return
    }

    if (!session?.user?.idSquadra) return

    try {
      await changePassword.mutateAsync({
        id: session.user.idSquadra,
        oldPassword,
        newPassword,
      })
      setSuccess(true)
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      // error surfaced via changePassword.error
    }
  }

  const serverError = (() => {
    const msg = changePassword.error?.message
    if (!msg) return null
    try {
      JSON.parse(msg)
      return 'Si è verificato un errore. Riprova.'
    } catch {
      return msg
    }
  })()

  return (
    <Box sx={{ maxWidth: 480, mx: 'auto', mt: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.2)}`,
          }}
        >
          <Lock sx={{ color: theme.palette.background.default, fontSize: '1.2rem' }} />
        </Box>
        <Box>
          <Typography variant="h2" sx={{ fontSize: '1.1rem', mb: 0 }}>
            Cambia password
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {session?.user?.presidente} · {session?.user?.squadra}
          </Typography>
        </Box>
      </Box>

      {/* Form card */}
      <Box
        component="form"
        onSubmit={handleSubmit}
        noValidate
        sx={{
          p: 3,
          borderRadius: '16px',
          border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
          background: alpha(theme.palette.background.paper, 0.6),
          backdropFilter: 'blur(8px)',
        }}
      >
        <Stack spacing={2.5}>
          {/* Vecchia password */}
          <TextField
            fullWidth
            label="Vecchia password"
            type={showOld ? 'text' : 'password'}
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            required
            autoComplete="current-password"
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowOld((v) => !v)}
                    edge="end"
                    size="small"
                    aria-label={showOld ? 'Nascondi password' : 'Mostra password'}
                  >
                    {showOld ? (
                      <VisibilityOff fontSize="small" />
                    ) : (
                      <Visibility fontSize="small" />
                    )}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Nuova password */}
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

          {/* Conferma nuova password */}
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

          {/* Errore client-side */}
          {clientError && (
            <Alert severity="error" onClose={() => setClientError(null)}>
              <AlertTitle>Errore</AlertTitle>
              {clientError}
            </Alert>
          )}

          {/* Errore server */}
          {serverError && (
            <Alert severity="error" onClose={() => changePassword.reset()}>
              <AlertTitle>Errore</AlertTitle>
              {serverError}
            </Alert>
          )}

          {/* Successo */}
          {success && (
            <Alert severity="success" onClose={() => setSuccess(false)}>
              <AlertTitle>Password aggiornata</AlertTitle>
              La tua password è stata cambiata con successo.
            </Alert>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={changePassword.isPending}
            sx={{ py: 1.25 }}
          >
            {changePassword.isPending ? 'Salvataggio...' : 'Cambia password'}
          </Button>
        </Stack>
      </Box>
    </Box>
  )
}
