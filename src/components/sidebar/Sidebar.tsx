'use client'
import * as React from 'react'
import { usePathname } from 'next/navigation'
import { signIn, signOut, useSession } from 'next-auth/react'
import {
  Box,
  Collapse,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Avatar,
  Divider,
  Tooltip,
  Button,
} from '@mui/material'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import { useTheme } from '@mui/material/styles'
import {
  AddAPhoto,
  AssignmentInd,
  Badge,
  Calculate,
  CalendarMonth,
  DarkMode,
  Euro,
  FiberNew,
  Group,
  Groups,
  LightMode,
  ListAlt,
  ManageAccounts,
  Portrait,
  ThumbsUpDown,
  UploadFile,
  SportsSoccer,
  EmojiEvents,
  Login,
  Logout,
} from '@mui/icons-material'
import { RuoloUtente } from '~/utils/enums'
import { Configurazione } from '~/config'
import { useThemeMode } from '~/theme/themeContext'

export const SIDEBAR_WIDTH = 240

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
}

interface NavItem {
  key: string
  label: string
  href: string
  icon: React.ReactNode
  authRequired?: boolean
  adminRequired?: boolean
}

const legaItems: NavItem[] = [
  { key: 'statisticheSquadre', label: 'Statistiche squadre', href: '/statistiche_squadre', icon: <Groups /> },
  { key: 'statistiche', label: 'Statistiche giocatori', href: '/statistiche_giocatori', icon: <Portrait /> },
  { key: 'economia', label: 'Economia e premi', href: '/economia', icon: <Euro /> },
  { key: 'albo', label: "Albo d'oro", href: '/albo', icon: <EmojiEvents /> },
  { key: 'documenti', label: 'Documenti', href: '/documenti', icon: <ListAlt /> },
]

const profiloItems: NavItem[] = [
  { key: 'formazione', label: 'Formazione', href: '/formazione', icon: <FiberNew color="success" /> },
  { key: 'maglia', label: 'Maglia', href: '/maglia', icon: <AssignmentInd color="info" /> },
  { key: 'foto', label: 'Foto profilo', href: '/foto', icon: <Badge color="success" /> },
]

const adminItems: NavItem[] = [
  { key: 'uploadVoti', label: 'Carica voti', href: '/uploadVoti', icon: <UploadFile /> },
  { key: 'risultati', label: 'Risultati', href: '/risultati', icon: <Calculate /> },
  { key: 'calendario', label: 'Calendario', href: '/calendario', icon: <CalendarMonth /> },
  { key: 'presidenti', label: 'Squadre', href: '/presidenti', icon: <Group /> },
  { key: 'giocatori', label: 'Giocatori', href: '/giocatori', icon: <ManageAccounts /> },
  { key: 'voti', label: 'Voti', href: '/voti', icon: <ThumbsUpDown /> },
  { key: 'avvioStagione', label: 'Nuova stagione', href: '/avvioStagione', icon: <FiberNew /> },
]

function SidebarNavItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const theme = useTheme()
  return (
    <ListItem disablePadding sx={{ mb: 0.5 }}>
      <ListItemButton
        href={item.href}
        sx={{
          borderRadius: '8px',
          mx: 1,
          py: 0.75,
          px: 1.5,
          transition: 'all 0.15s ease',
          ...(isActive
            ? {
                background: `linear-gradient(135deg, ${theme.palette.action.hover} 0%, ${theme.palette.action.hover} 100%)`,
                borderLeft: `3px solid ${theme.palette.primary.main}`,
                '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
                '& .MuiListItemText-secondary': { color: `${theme.palette.primary.light} !important` },
              }
            : {
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
                },
              }),
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 36,
            color: isActive ? 'primary.main' : 'text.secondary',
            fontSize: '1.1rem',
            '& .MuiSvgIcon-root': { fontSize: '1.1rem' },
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText
          secondary={item.label}
          secondaryTypographyProps={{
            sx: {
              fontSize: '0.78rem',
              fontWeight: isActive ? 600 : 400,
              color: isActive ? theme.palette.primary.light : 'text.secondary',
            },
          }}
        />
      </ListItemButton>
    </ListItem>
  )
}

function SidebarSection({
  title,
  items,
  pathname,
  defaultOpen = true,
}: {
  title: string
  items: NavItem[]
  pathname: string
  defaultOpen?: boolean
}) {
  const hasActiveItem = items.some((item) => pathname === item.href)
  const [open, setOpen] = React.useState(defaultOpen || hasActiveItem)
  return (
    <Box sx={{ mb: 0.5 }}>
      <ListItemButton
        onClick={() => setOpen((v) => !v)}
        sx={{ py: 0.4, px: 2, borderRadius: '6px', mx: 1 }}
      >
        <Typography
          variant="overline"
          sx={{
            flex: 1,
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.12em',
            color: 'text.secondary',
            opacity: 0.7,
          }}
        >
          {title}
        </Typography>
        {open ? (
          <ExpandLess sx={{ fontSize: '0.9rem', color: 'text.secondary', opacity: 0.5 }} />
        ) : (
          <ExpandMore sx={{ fontSize: '0.9rem', color: 'text.secondary', opacity: 0.5 }} />
        )}
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List dense disablePadding>
          {items.map((item) => (
            <SidebarNavItem key={item.key} item={item} isActive={pathname === item.href} />
          ))}
        </List>
      </Collapse>
    </Box>
  )
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
            sx={{ width: 36, height: 36, border: `2px solid ${theme.palette.primary.main}`, opacity: 0.5 }}
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
            <SidebarSection title="Admin" items={adminItems} pathname={pathname} defaultOpen={false} />
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
        {/* Theme toggle */}
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
