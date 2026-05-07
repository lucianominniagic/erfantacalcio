'use client'
import * as React from 'react'
import {
  Box,
  Collapse,
  List,
  ListItemButton,
  Typography,
} from '@mui/material'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import type { NavItem } from './sidebarConfig'
import { SidebarNavItem } from './SidebarNavItem'

interface SidebarSectionProps {
  title: string
  items: NavItem[]
  pathname: string
  defaultOpen?: boolean
}

export function SidebarSection({
  title,
  items,
  pathname,
  defaultOpen = true,
}: SidebarSectionProps) {
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
            <SidebarNavItem
              key={item.key}
              item={item}
              isActive={pathname === item.href}
            />
          ))}
        </List>
      </Collapse>
    </Box>
  )
}
