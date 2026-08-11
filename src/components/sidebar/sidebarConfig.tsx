import React from 'react'
import {
  AssignmentInd,
  Badge,
  Calculate,
  CalendarMonth,
  Euro,
  FiberNew,
  Gavel,
  Group,
  Groups,
  ListAlt,
  ManageAccounts,
  MenuBook,
  Newspaper,
  Portrait,
  Schedule,
  SportsSoccer,
  Storefront,
  ThumbsUpDown,
  UploadFile,
  EmojiEvents,
  Key,
} from '@mui/icons-material'

export interface NavItem {
  key: string
  label: string
  href: string
  icon: React.ReactNode
  authRequired?: boolean
  adminRequired?: boolean
}

export const legaItems: NavItem[] = [
  {
    key: 'statisticheSquadre',
    label: 'Statistiche squadre',
    href: '/statistiche_squadre',
    icon: <Groups />,
  },
  {
    key: 'statistiche',
    label: 'Statistiche giocatori',
    href: '/statistiche_giocatori',
    icon: <Portrait />,
  },
  {
    key: 'economia',
    label: 'Economia e premi',
    href: '/economia',
    icon: <Euro />,
  },
  { key: 'albo', label: "Albo d'oro", href: '/albo', icon: <EmojiEvents /> },
  {
    key: 'newsCalcio',
    label: 'News calcio',
    href: '/news-calcio',
    icon: <Newspaper />,
  },
  {
    key: 'serieA',
    label: 'Serie A',
    href: '/serie-a',
    icon: <SportsSoccer />,
  },
  {
    key: 'regolamento',
    label: 'Regolamento',
    href: '/regolamento',
    icon: <MenuBook />,
  },
  {
    key: 'documenti',
    label: 'Documenti',
    href: '/documenti',
    icon: <ListAlt />,
  },
]

export const profiloItems: NavItem[] = [
  {
    key: 'formazione',
    label: 'Formazione',
    href: '/formazione',
    icon: <FiberNew color="success" />,
  },
  {
    key: 'maglia',
    label: 'Maglia',
    href: '/maglia',
    icon: <AssignmentInd color="info" />,
  },
  {
    key: 'foto',
    label: 'Foto profilo',
    href: '/foto',
    icon: <Badge color="error" />,
  },
  {
    key: 'profilo',
    label: 'Cambio password',
    href: '/profilo',
    icon: <Key color="action" />,
  },
  {
    key: 'mercato',
    label: 'Proposta di acquisto',
    href: '/mercato',
    icon: <Gavel color="success" />,
    authRequired: true,
  },
  {
    key: 'sessioni-mercato',
    label: 'Sessioni di mercato',
    href: '/sessioni-mercato',
    icon: <Storefront color="info" />,
    authRequired: true,
  },
]

export const adminItems: NavItem[] = [
  {
    key: 'uploadVoti',
    label: 'Carica voti',
    href: '/uploadVoti',
    icon: <UploadFile />,
  },
  {
    key: 'risultati',
    label: 'Risultati',
    href: '/risultati',
    icon: <Calculate />,
  },
  {
    key: 'calendario',
    label: 'Calendario',
    href: '/calendario',
    icon: <CalendarMonth />,
  },
  { key: 'presidenti', label: 'Squadre', href: '/presidenti', icon: <Group /> },
  {
    key: 'giocatori',
    label: 'Giocatori',
    href: '/giocatori',
    icon: <ManageAccounts />,
  },
  {
    key: 'squadreSerieA',
    label: 'Squadre Serie A',
    href: '/squadre-serie-a',
    icon: <SportsSoccer />,
  },
  { key: 'voti', label: 'Voti', href: '/voti', icon: <ThumbsUpDown /> },
  {
    key: 'avvioStagione',
    label: 'Nuova stagione',
    href: '/avvioStagione',
    icon: <FiberNew />,
  },
  {
    key: 'gestione-mercato',
    label: 'Sessioni mercato',
    href: '/gestione-mercato',
    icon: <Storefront />,
  },
  {
    key: 'jobs',
    label: 'Job pianificati',
    href: '/jobs',
    icon: <Schedule />,
  },
]
