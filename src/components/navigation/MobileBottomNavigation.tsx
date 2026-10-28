'use client'
import {
  BottomNavigation,
  BottomNavigationAction,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import {
  Euro,
  EmojiEvents,
  Gavel,
  Groups,
  Home,
  Portrait,
  ViewWeek,
} from '@mui/icons-material'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import type { SyntheticEvent } from 'react'
import {
  getMobileNavigationIntent,
  type MobileHomeSection,
  type MobileNavigationActionValue,
} from './mobileNavigation'

export type { MobileHomeSection, MobileNavigationValue } from './mobileNavigation'

interface MobileBottomNavigationProps {
  value: MobileNavigationActionValue | null
  onHomeSectionChange?: (section: MobileHomeSection) => void
}

export default function MobileBottomNavigation({
  value,
  onHomeSectionChange,
}: MobileBottomNavigationProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const pathname = usePathname() ?? '/'
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))

  if (!isXs) return null

  const handleChange = (
    _: SyntheticEvent,
    nextValue: MobileNavigationActionValue,
  ) => {
    if (nextValue === 'formazione' && !session?.user) return

    const intent = getMobileNavigationIntent(nextValue, pathname)
    if (intent.homeSection) onHomeSectionChange?.(intent.homeSection)
    if (intent.href) router.push(intent.href)
  }

  return (
    <BottomNavigation
      showLabels
      value={value}
      onChange={handleChange}
      sx={{
        position: 'fixed',
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: (currentTheme) => currentTheme.zIndex.appBar,
        height: 'calc(64px + env(safe-area-inset-bottom))',
        boxSizing: 'border-box',
        pb: 'env(safe-area-inset-bottom)',
        borderTop: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        overflowX: 'auto',
        overflowY: 'hidden',
        justifyContent: 'flex-start',
        WebkitOverflowScrolling: 'touch',
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
        '& .MuiBottomNavigationAction-root': {
          flex: '0 0 88px',
          minWidth: 88,
          maxWidth: 'none',
          px: 0.25,
        },
        '& .MuiBottomNavigationAction-label': {
          fontSize: '0.58rem',
          lineHeight: 1.1,
          whiteSpace: 'normal',
        },
      }}
    >
      <BottomNavigationAction
        label="Home"
        icon={<Home />}
        value="calendario"
      />
      {session?.user && (
        <BottomNavigationAction
          label="Formazione"
          icon={<ViewWeek />}
          value="formazione"
        />
      )}
      <BottomNavigationAction
        label="Classifica"
        icon={<EmojiEvents />}
        value="classifica"
      />
      <BottomNavigationAction
        label="Squadre"
        icon={<Groups />}
        value="squadre"
      />
      {session?.user && (
        <BottomNavigationAction
          label="Mercato"
          icon={<Gavel />}
          value="mercato"
        />
      )}
      <BottomNavigationAction
        label="Giocatori"
        icon={<Portrait />}
        value="giocatori"
      />
      <BottomNavigationAction
        label="Economia"
        icon={<Euro />}
        value="economia"
      />
    </BottomNavigation>
  )
}
