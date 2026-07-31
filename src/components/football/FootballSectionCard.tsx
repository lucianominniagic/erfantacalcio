'use client'
/**
 * FootballSectionCard — card wrapper riutilizzata in tutti i componenti football.
 *
 * Client component: serve useTheme() per il gradiente header via alpha().
 * I children (tabelle / liste server-rendered) vengono passati come RSC payload.
 */
import { Box, Card, Typography } from '@mui/material'
import { alpha, useTheme } from '@mui/material/styles'
import type { ReactNode } from 'react'

export interface FootballSectionCardProps {
  /** Titolo della sezione visualizzato nell'header */
  title: string
  /** Icona MUI opzionale (già dimensionata dal chiamante) */
  icon?: ReactNode
  /** Testo secondario allineato a destra nell'header */
  subtitle?: string
  children: ReactNode
}

export default function FootballSectionCard({
  title,
  icon,
  subtitle,
  children,
}: FootballSectionCardProps) {
  const theme = useTheme()

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* ── Header ───────────────────────────────────────────────────── */}
      <Box
        sx={{
          px: 2,
          py: 1.25,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.12)} 0%, ${alpha(theme.palette.primary.dark, 0.06)} 100%)`,
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'center',
          gap: 1,
        }}
      >
        {icon}
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: '0.9rem',
            color: 'primary.main',
            letterSpacing: '0.02em',
          }}
        >
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', ml: 'auto', fontWeight: 500 }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* ── Content ──────────────────────────────────────────────────── */}
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Card>
  )
}
