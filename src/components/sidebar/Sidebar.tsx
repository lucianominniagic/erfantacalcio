'use client'
import * as React from 'react'
import { usePathname } from 'next/navigation'
import { signIn, signOut, useSession } from 'next-auth/react'
import {
  Avatar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material'
import { DarkMode, LightMode, Login, Logout, SportsSoccer } from '@mui/icons-material'
import { useTheme } from '@mui/material/styles'
import { RuoloUtente } from '~/utils/enums'
import { Configurazione } from '~/config'
import { useThemeMode } from '~/theme/themeContext'
import { legaItems, profiloItems, adminItems } from './sidebarConfig'
import { SidebarSection } from './SidebarSection'

export const SIDEBAR_WIDTH = 240

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

function SidebarContent() {
  const { data: session } = useSession()
  const pathname = usePathname() ?? ''
  const theme = useTheme()
  const { mode, toggleMode } = useThemeMode()

  const headerBg = `linear-gradient(135deg, ${theme.palette.background.default} 0%, #1a1208 100%)`
  const titleColor = theme.palette.primary.main

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: theme.palette.background.default,
      }}
    >
      {/* Header */}
      <Box
        onClick={() => (window.location.href = '/')}
        sx={{
          cursor: 'pointer',
          p: 2,
          pt: 2.5,
          pb: 2,
          background: headerBg,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        <SportsSoccer sx={{ color: titleColor, fontSize: '1.4rem' }} />
        <Box>
          <Typography
            sx={{
              fontWeight: 700,
              fontSize: '0.95rem',
              letterSpacing: '-0.01em',
              color: titleColor,
              lineHeight: 1.1,
            }}
          >
            erFantacalcio
          </Typography>
          <Typography
            sx={{
              fontSize: '0.65rem',
              color: 'rgba(255,255,255,0.45)',
              fontWeight: 500,
              letterSpacing: '0.05em',
            }}
          >
            Stagione {Configurazione.stagione}
          </Typography>
        </Box>
      </Box>

      {/* User info */}
      {session?.user && (
        <Box
          sx={{
            px: 2,
            py: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Avatar
            src={session.user.image?.toString()}
            alt={session.user.squadra}
            sx={{
              width: 36,
              height: 36,
              border: `2px solid ${theme.palette.primary.main}`,
              opacity: 0.5,
            }}
          />
          <Box sx={{ overflow: 'hidden' }}>
            <Typography
              sx={{
                fontSize: '0.78rem',
                fontWeight: 600,
                color: 'text.primary',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {session.user.squadra}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.65rem',
                color: 'text.secondary',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {session.user.presidente}
            </Typography>
          </Box>
        </Box>
      )}

      {/* Nav sections */}
      <Box sx={{ flex: 1, overflowY: 'auto', py: 1 }}>
        {session?.user && (
          <>
            <Divider sx={{ mx: 2, my: 0.5 }} />
            <SidebarSection title="Il mio profilo" items={profiloItems} pathname={pathname} />
          </>
        )}
        <SidebarSection title="Lega" items={legaItems} pathname={pathname} />
        {session?.user?.ruolo === RuoloUtente.admin && (
          <>
            <Divider sx={{ mx: 2, my: 0.5 }} />
            <SidebarSection
              title="Admin"
              items={adminItems}
              pathname={pathname}
              defaultOpen={false}
            />
          </>
        )}
      </Box>

      {/* Bottom: theme toggle + sign in/out */}
      <Box
        sx={{
          p: 1.5,
          borderTop: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="caption" color="text.secondary">
            {mode === 'dark' ? 'Tema scuro' : 'Tema chiaro'}
          </Typography>
          <Tooltip title={mode === 'dark' ? 'Passa al tema chiaro' : 'Passa al tema scuro'}>
            <IconButton size="small" onClick={toggleMode} sx={{ color: 'primary.main' }}>
              {mode === 'dark' ? <LightMode fontSize="small" /> : <DarkMode fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>

        {!session ? (
          <Button
            fullWidth
            variant="contained"
            color="primary"
            size="small"
            startIcon={<Login />}
            onClick={() => void signIn('erFantacalcio')}
            sx={{ borderRadius: '8px', fontSize: '0.75rem' }}
          >
            Sign in
          </Button>
        ) : (
          <Tooltip title="Logout">
            <Button
              fullWidth
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<Logout />}
              onClick={() => void signOut()}
              sx={{ borderRadius: '8px', fontSize: '0.75rem' }}
            >
              Sign out
            </Button>
          </Tooltip>
        )}
      </Box>
    </Box>
  )
}

export default function Sidebar({ mobileOpen, onMobileClose }: SidebarProps) {
  const theme = useTheme()
  const drawerSx = {
    width: SIDEBAR_WIDTH,
    boxSizing: 'border-box' as const,
    borderRight: `1px solid ${theme.palette.divider}`,
    background: theme.palette.background.default,
  }

  return (
    <>
      {/* Desktop permanent sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': drawerSx,
        }}
        open
      >
        <SidebarContent />
      </Drawer>
      {/* Mobile temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': drawerSx,
        }}
      >
        <SidebarContent />
      </Drawer>
    </>
  )
}
