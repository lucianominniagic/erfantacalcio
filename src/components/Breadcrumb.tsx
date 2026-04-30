'use client'
import { Breadcrumbs, Link, Typography } from '@mui/material'
import { Home, NavigateNext } from '@mui/icons-material'
import { usePathname } from 'next/navigation'

const PATH_LABELS: Record<string, string> = {
  '/formazione': 'Inserisci formazione',
  '/formazioni': 'Formazioni',
  '/tabellini': 'Tabellini',
  '/maglia': 'Cambia maglia',
  '/foto': 'Foto profilo',
  '/statistiche_giocatori': 'Statistiche giocatori',
  '/statistiche_giocatore': 'Statistiche giocatore',
  '/statistiche_squadre': 'Statistiche squadre',
  '/economia': 'Economia e premi',
  '/albo': "Albo d'oro",
  '/documenti': 'Documenti',
  '/squadra': 'Squadra',
  '/uploadVoti': 'Carica voti',
  '/risultati': 'Risultati',
  '/calendario': 'Calendario',
  '/presidenti': 'Squadre',
  '/giocatori': 'Giocatori',
  '/voti': 'Voti',
  '/avvioStagione': 'Nuova stagione',
}

const ADMIN_PATHS = new Set([
  '/uploadVoti',
  '/risultati',
  '/calendario',
  '/presidenti',
  '/giocatori',
  '/voti',
  '/avvioStagione',
])

function getLabel(pathname: string): string {
  // Match esatto
  if (PATH_LABELS[pathname]) return PATH_LABELS[pathname]
  // Match sul primo segmento (es. /squadra/1/NomeSquadra → /squadra)
  const firstSegment = '/' + pathname.split('/')[1]
  return PATH_LABELS[firstSegment] ?? pathname
}

const HIDDEN_PATHS = ['/', '/login']

function isAdminPath(pathname: string): boolean {
  const firstSegment = '/' + pathname.split('/')[1]
  return ADMIN_PATHS.has(firstSegment)
}

export default function Breadcrumb() {
  const pathname = usePathname()

  if (HIDDEN_PATHS.includes(pathname)) return null

  const label = getLabel(pathname)
  const isAdmin = isAdminPath(pathname)

  return (
    <Breadcrumbs
      separator={<NavigateNext fontSize="small" sx={{ color: 'rgba(255,193,7,0.4)' }} />}
      aria-label="breadcrumb"
      sx={{ mb: 1, mt: 0.5 }}
    >
      <Link
        href="/"
        underline="hover"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          color: 'rgba(255,193,7,0.7)',
          fontSize: '0.75rem',
          fontWeight: 500,
          '&:hover': { color: '#FFC107' },
          transition: 'color 0.2s ease',
        }}
      >
        <Home sx={{ fontSize: '0.95rem' }} />
        Home
      </Link>
      {isAdmin && (
        <Typography sx={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(255,193,7,0.5)' }}>
          Admin
        </Typography>
      )}
      <Typography
        sx={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: '#FFC107',
        }}
      >
        {label}
      </Typography>
    </Breadcrumbs>
  )
}
