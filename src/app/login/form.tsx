'use client'
import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'

import {
  Alert,
  AlertTitle,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Box,
  Link,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { loginFormSchema } from '~/schemas/presidente'

export const LoginForm = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formValues, setFormValues] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') ?? '/'

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const validationResult = loginFormSchema.safeParse(formValues)
    if (!validationResult.success) {
      setError('Compila username (o email) e password.')
      return
    }

    try {
      setLoading(true)
      const res = await signIn('erFantacalcio', {
        redirect: false,
        username: formValues.username,
        password: formValues.password,
        callbackUrl,
      })
      setLoading(false)

      if (res?.error) {
        setError('Username o password non corretti.')
      } else {
        setFormValues({ username: '', password: '' })
        router.push(callbackUrl)
      }
    } catch (err) {
      setLoading(false)
      setError(err instanceof Error ? err.message : 'Si è verificato un errore.')
    }
  }

  return (
    <Box
      component="form"
      onSubmit={onSubmit}
      noValidate
      sx={{ width: '100%' }}
    >
      <Stack spacing={2.5}>
        <TextField
          required
          fullWidth
          id="username"
          label="Username o email"
          name="username"
          autoComplete="username email"
          autoFocus
          value={formValues.username}
          onChange={(e) => setFormValues((v) => ({ ...v, username: e.target.value }))}
        />

        <TextField
          required
          fullWidth
          name="password"
          label="Password"
          type={showPassword ? 'text' : 'password'}
          id="password"
          autoComplete="current-password"
          value={formValues.password}
          onChange={(e) => setFormValues((v) => ({ ...v, password: e.target.value }))}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowPassword((v) => !v)}
                  edge="end"
                  size="small"
                  aria-label={showPassword ? 'Nascondi password' : 'Mostra password'}
                >
                  {showPassword ? (
                    <VisibilityOff fontSize="small" />
                  ) : (
                    <Visibility fontSize="small" />
                  )}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        {error && (
          <Alert severity="error" onClose={() => setError('')}>
            <AlertTitle>Errore</AlertTitle>
            {error}
          </Alert>
        )}

        <Button
          type="submit"
          fullWidth
          color="primary"
          variant="contained"
          sx={{ py: 1.25 }}
          disabled={loading}
        >
          {loading ? 'Accesso in corso...' : 'Accedi'}
        </Button>

        <Box sx={{ textAlign: 'center' }}>
          <Link
            href="/recupera-password"
            underline="hover"
            variant="body2"
            sx={{ color: 'text.secondary', fontSize: '0.8rem' }}
          >
            Hai dimenticato la password?
          </Link>
        </Box>
      </Stack>
    </Box>
  )
}
