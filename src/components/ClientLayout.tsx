'use client'
import {
  CssBaseline,
  Box,
  Container,
  Typography,
  AppBar,
  Toolbar,
  IconButton,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { Menu as MenuIcon, SportsSoccer } from '@mui/icons-material'
import { useState } from 'react'
import ProvidersWrapper from '~/ProvidersWrapper'
import Sidebar, { SIDEBAR_WIDTH } from '~/components/sidebar/Sidebar'
import { Configurazione } from '~/config'

function MobileTopBar({ onMenuClick }: { onMenuClick: () => void }) {
  return (
    <AppBar
      position="fixed"
      sx={{
        display: { xs: 'flex', md: 'none' },
        background: 'linear-gradient(135deg, #0d0d14 0%, #1a1208 100%)',
        borderBottom: '1px solid rgba(255,193,7,0.12)',
        boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar variant="dense" sx={{ gap: 1 }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          size="small"
          sx={{ color: '#FFC107' }}
        >
          <MenuIcon />
        </IconButton>
        <SportsSoccer sx={{ color: '#FFC107', fontSize: '1.2rem' }} />
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '0.9rem',
            color: '#FFC107',
            letterSpacing: '-0.01em',
          }}
        >
          erFantacalcio {Configurazione.stagione}
        </Typography>
      </Toolbar>
    </AppBar>
  )
}

function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        py: 0.75,
        px: 2,
        borderTop: '1px solid rgba(255,193,7,0.10)',
        background: 'rgba(13,13,20,0.95)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexShrink: 0,
        mt: 'auto',
      }}
    >
      <a href="mailto:lucianominni@gmail.com" style={{ textDecoration: 'none' }}>
        <Typography
          sx={{ fontSize: '0.65rem', color: 'rgba(255,193,7,0.55)', fontWeight: 500 }}
        >
          Powered by Luciano Minni
        </Typography>
      </a>
      <Typography sx={{ fontSize: '0.65rem', color: 'rgba(255,193,7,0.35)' }}>
        Next.js · React · MUI · TypeORM
      </Typography>
    </Box>
  )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <ProvidersWrapper>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />

        {/* Mobile top bar */}
        <MobileTopBar onMenuClick={() => setMobileOpen(true)} />

        {/* Sidebar */}
        <Sidebar
          mobileOpen={mobileOpen}
          onMobileClose={() => setMobileOpen(false)}
          isXs={isXs}
        />

        {/* Main content */}
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            width: { md: `calc(100% - ${SIDEBAR_WIDTH}px)` },
            ml: { md: 0 },
          }}
        >
          {/* Mobile spacer for top bar */}
          <Box sx={{ display: { xs: 'block', md: 'none' }, height: '48px' }} />

          <Container maxWidth="lg" sx={{ mt: '8px', mb: '8px', flex: 1 }}>
            {children}
          </Container>

          <Footer />
        </Box>
      </Box>
    </ProvidersWrapper>
  )
}

