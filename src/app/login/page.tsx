import { LoginForm } from './form'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { SportsSoccer } from '@mui/icons-material'
import { Suspense } from 'react'

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(ellipse at 50% 0%, rgba(255,193,7,0.06) 0%, transparent 70%)',
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
            border: '1px solid rgba(255,193,7,0.18)',
            background: 'linear-gradient(160deg, rgba(26,18,8,0.95) 0%, rgba(22,22,31,0.98) 100%)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,193,7,0.06)',
          }}
        >
          {/* Logo */}
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #FF8F00 0%, #FFC107 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              boxShadow: '0 4px 16px rgba(255,193,7,0.25)',
            }}
          >
            <SportsSoccer sx={{ color: '#0d0d14', fontSize: '1.75rem' }} />
          </Box>

          <Typography
            variant="h1"
            sx={{
              fontSize: '1.5rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #FF8F00 0%, #FFD54F 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5,
              letterSpacing: '-0.02em',
            }}
          >
            erFantacalcio
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', mb: 3, letterSpacing: '0.06em' }}
          >
            Accedi al tuo account
          </Typography>

          <Suspense fallback={<div>Loading...</div>}>
            <LoginForm />
          </Suspense>
        </Box>
      </Container>
    </Box>
  )
}

