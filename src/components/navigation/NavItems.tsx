import * as React from 'react'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import {
  AddAPhoto,
  AssignmentInd,
  Badge,
  Ballot,
  Calculate,
  CalendarMonth,
  Euro,
  FiberNew,
  Grading,
  Group,
  HistoryEdu,
  ListAlt,
  ManageAccounts,
  Portrait,
  Groups,
  RecentActors,
  ThumbsUpDown,
  UploadFile,
} from '@mui/icons-material'
import { Configurazione } from '~/config'

const listItem = (
  key: string,
  link: string,
  title: string,
  icon: React.JSX.Element,
) => {
  return (
    <ListItemButton key={key} href={link} sx={{ p: 1 }}>
      <ListItemIcon sx={{ mr: 2 }}>{icon}</ListItemIcon>
      <ListItemText secondary={title} />
    </ListItemButton>
  )
}

export function adminListItems() {
  return [
    listItem(
      'admin_upload',
      '/uploadVoti',
      'Carica voti',
      <UploadFile color="primary" />,
    ),
    listItem(
      'admin_risultati',
      '/risultati',
      'Risultati',
      <Calculate color="primary" />,
    ),
    listItem(
      'admin_calendario',
      '/calendario',
      'Calendario',
      <CalendarMonth color="primary" />,
    ),
    listItem(
      'admin_presidenti',
      '/presidenti',
      'Squadre',
      <Group color="primary" />,
    ),
    listItem(
      'admin_giocatori',
      '/giocatori',
      'Giocatori',
      <ManageAccounts color="primary" />,
    ),
    listItem('admin_voti', '/voti', 'Voti', <ThumbsUpDown color="primary" />),
    listItem(
      'admin_nuova_stagione',
      '/avvioStagione',
      'Nuova stagione',
      <FiberNew color="primary" />,
    ),
  ]
}

export function guestListItems(isXs: boolean, isAuthenticated: boolean) {
  return [
    ...(isAuthenticated
      ? [
          listItem(
            'guest_profilo_1',
            `/formazione?isXs=${isXs}`,
            'Formazione',
            <FiberNew color="success" />,
          ),
          listItem(
            'guest_profilo_2',
            `/maglia`,
            'Maglia',
            <AssignmentInd color="info" />,
          ),
          listItem(
            'guest_profilo_3',
            '/foto',
            'Foto profilo',
            <Badge color="success" />,
          ),
        ]
      : []),
    listItem(
      'guest_profilo_4b',
      '/statistiche_squadre',
      'Statistiche squadre',
      <Groups color="error" />,
    ),
    listItem(
      'guest_profilo_4',
      '/statistiche_giocatori',
      'Statistiche giocatori',
      <Portrait color="error" />,
    ),
    listItem(
      'guest_profilo_5',
      '/economia',
      'Economia e premi',
      <Euro color="error" />,
    ),
    listItem(
      'guest_profilo_6',
      '/albo',
      "Albo d'oro",
      <HistoryEdu color="error" />,
    ),
    listItem(
      'guest_profilo_7',
      `/documenti`,
      `Documenti`,
      <ListAlt color="error" />,
    ),
  ]
}
