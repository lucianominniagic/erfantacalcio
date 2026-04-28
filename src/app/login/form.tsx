'use client'
import { signIn } from 'next-auth/react'
import { useSearchParams, useRouter } from 'next/navigation'
import { type ChangeEvent, useState } from 'react'

//import material ui
import { Button, TextField, Box, Typography } from '@mui/material'
import { loginFormSchema } from '~/schemas/presidente'

export const LoginForm = () => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formValues, setFormValues] = useState({
    username: '',
    password: '',
  })
  const [error, setError] = useState('')

  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') ?? '/'

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    console.log('submitting form', formValues)
    try {
      const validationResult = loginFormSchema.safeParse(formValues)
      if (!validationResult.success) {
        setError('compilare i campi')
      } else {
        setLoading(true)

        const res = await signIn('erFantacalcio', {
          redirect: false,
          username: formValues.username,
          password: formValues.password,
          callbackUrl,
        })

        setLoading(false)
        if (res?.error) {
          setError('invalid username or password')
        } else {
          setFormValues({ username: '', password: '' })
          router.push(callbackUrl)
        }
      }
    } catch (error) {
      setLoading(false)
      setError(error instanceof Error ? error.message : 'Unknown Error')
    }
  }

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormValues({ ...formValues, [name]: value })
  }

  return (
    <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
      <TextField
        margin="normal"
        required
        fullWidth
        id="username"
        label="Username"
        name="username"
        autoComplete="username"
        autoFocus
        onChange={handleChange}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        onChange={handleChange}
        autoComplete="current-password"
      />
      {error && (
        <Typography color="error" variant="h3">
          {error}
        </Typography>
      )}
      <Button
        type="submit"
        fullWidth
        color="primary"
        variant="contained"
        sx={{ mt: 3, mb: 2, py: 1.25 }}
        disabled={loading}
      >
        {loading ? 'loading...' : 'Sign in'}
      </Button>
    </Box>
  )
}
