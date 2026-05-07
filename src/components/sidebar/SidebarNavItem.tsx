'use client'
import {
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import type { NavItem } from './sidebarConfig'

interface SidebarNavItemProps {
  item: NavItem
  isActive: boolean
}

export function SidebarNavItem({ item, isActive }: SidebarNavItemProps) {
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
                '& .MuiListItemIcon-root': {
                  color: theme.palette.primary.main,
                },
                '& .MuiListItemText-secondary': {
                  color: `${theme.palette.primary.light} !important`,
                },
              }
            : {
                '&:hover': {
                  backgroundColor: theme.palette.action.hover,
                  '& .MuiListItemIcon-root': {
                    color: theme.palette.primary.main,
                  },
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
