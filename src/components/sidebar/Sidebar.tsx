'use client'
import * as React from 'react'
import { usePathname } from 'next/navigation'
import { signIn, signOut, useSession } from 'next-auth/react'
import {
  Box,
  Drawer,
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
import {
  AddAPhoto,
  AssignmentInd,
  Badge,
  Calculate,
  CalendarMonth,
  Euro,
  FiberNew,
  Group,
  Groups,
  HistoryEdu,
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
import useSeasonal from '~/components/appbar/seasonalHooks'

export const SIDEBAR_WIDTH = 240

interface SidebarProps {
  mobileOpen: boolean
  onMobileClose: () => void
  isXs: boolean
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
  { key: 'statistiche', label: 'Statistiche giocatori', href: '/statistiche_giocatori', icon: <Portrait /> },
  { key: 'statisticheSquadre', label: 'Statistiche squadre', href: '/statistiche_squadre', icon: <Groups /> },
  { key: 'economia', label: 'Economia e premi', href: '/economia', icon: <Euro /> },
  { key: 'albo', label: "Albo d'oro", href: '/albo', icon: <EmojiEvents /> },
  { key: 'documenti', label: 'Documenti', href: '/documenti', icon: <ListAlt /> },
]

const profiloItems: NavItem[] = [
  { key: 'formazione', label: 'Inserisci formazione', href: '/formazione', icon: <FiberNew color="success" /> },
  { key: 'maglia', label: 'Cambia maglia', href: '/maglia', icon: <AssignmentInd color="info" /> },
  { key: 'foto', label: 'Foto profilo', href: '/foto', icon: <Badge color="success" /> },
]

const adminItems: NavItem[] = [
  { key: 'uploadVoti', label: 'Carica voti', href: '/uploadVoti', icon: <UploadFile /> },
  { key: 'risultati', label: 'Risultati', href: '/risultati', icon: <Calculate /> },
  { key: 'calendario', label: 'Calendario', href: '/calendario', icon: <CalendarMonth /> },
  { key: 'presidenti', label: 'Squadre', href: '/presidenti', icon: <Group /> },
  { key: 'giocatori', label: 'Giocatori', href: '/giocatori', icon: <ManageAccounts /> },
  { key: 'voti', label: 'Voti', href: '/voti', icon: <ThumbsUpDown /> },
  { key: 'avvioStagione', label: 'Nuova stagione', href: '/avvioStagione', icon: <AddAPhoto /> },
]

function SidebarNavItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
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
                background: 'linear-gradient(135deg, rgba(255,143,0,0.18) 0%, rgba(255,193,7,0.10) 100%)',
                borderLeft: '3px solid #FFC107',
                '& .MuiListItemIcon-root': { color: '#FFC107' },
                '& .MuiListItemText-secondary': { color: '#FFD54F !important' },
              }
            : {
                '&:hover': {
                  backgroundColor: 'rgba(255, 193, 7, 0.06)',
                  '& .MuiListItemIcon-root': { color: '#FFC107' },
                },
              }),
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 36,
            color: isActive ? '#FFC107' : 'text.secondary',
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
              color: isActive ? '#FFD54F' : 'text.secondary',
            },
          }}
        />
      </ListItemButton>
    </ListItem>
  )
}

function SidebarSection({ title, items, pathname }: { title: string; items: NavItem[]; pathname: string }) {
  return (
    <Box sx={{ mb: 1 }}>
      <Typography
        variant="overline"
        sx={{
          px: 2,
          py: 0.5,
          display: 'block',
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          color: 'rgba(255,193,7,0.55)',
        }}
      >
        {title}
      </Typography>
      <List dense disablePadding>
        {items.map((item) => (
          <SidebarNavItem key={item.key} item={item} isActive={pathname === item.href} />
        ))}
      </List>
    </Box>
  )
}

function SidebarContent({ isXs }: { isXs: boolean }) {
  const { data: session } = useSession()
  const pathname = usePathname() ?? ''
  const { variant: seasonalVariant } = useSeasonal(isXs)

  const headerBg =
    seasonalVariant === 'christmas'
      ? 'linear-gradient(135deg, #0b6623 0%, #7a0000 100%)'
      : seasonalVariant === 'january'
        ? 'linear-gradient(180deg, #0960bd 0%, #1a2a40 100%)'
        : 'linear-gradient(135deg, #0d0d14 0%, #1a1208 100%)'

  const titleColor =
    seasonalVariant === 'january' ? '#82b1ff' : '#FFC107'

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#0f0f18',
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
          borderBottom: '1px solid rgba(255,193,7,0.10)',
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
            borderBottom: '1px solid rgba(255,193,7,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
          }}
        >
          <Avatar
            src={session.user.image?.toString()}
            alt={session.user.squadra}
            sx={{ width: 36, height: 36, border: '2px solid rgba(255,193,7,0.3)' }}
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
        <SidebarSection title="Lega" items={legaItems} pathname={pathname} />

        {session?.user && (
          <>
            <Divider sx={{ mx: 2, my: 0.5, borderColor: 'rgba(255,193,7,0.08)' }} />
            <SidebarSection title="Il mio profilo" items={profiloItems} pathname={pathname} />
          </>
        )}

        {session?.user?.ruolo === RuoloUtente.admin && (
          <>
            <Divider sx={{ mx: 2, my: 0.5, borderColor: 'rgba(255,193,7,0.08)' }} />
            <SidebarSection title="Admin" items={adminItems} pathname={pathname} />
          </>
        )}
      </Box>

      {/* Bottom: sign in/out */}
      <Box
        sx={{
          p: 1.5,
          borderTop: '1px solid rgba(255,193,7,0.08)',
        }}
      >
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

export default function Sidebar({ mobileOpen, onMobileClose, isXs }: SidebarProps) {
  return (
    <>
      {/* Desktop permanent sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(255,193,7,0.10)',
            background: '#0f0f18',
          },
        }}
        open
      >
        <SidebarContent isXs={isXs} />
      </Drawer>

      {/* Mobile temporary drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onMobileClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            borderRight: '1px solid rgba(255,193,7,0.10)',
            background: '#0f0f18',
          },
        }}
      >
        <SidebarContent isXs={isXs} />
      </Drawer>
    </>
  )
}
