'use client'
import { Box, Card, CardContent, Skeleton, Typography, useTheme } from '@mui/material'
import { EmojiEvents } from '@mui/icons-material'
import { alpha, darken } from '@mui/material/styles'
import { api } from '~/utils/api'

// ── Sub-components ────────────────────────────────────────────────────────────

interface PodioRowProps {
  icon: string
  name: string
  highlight?: boolean
}

function PodioRow({ icon, name, highlight = false }: PodioRowProps) {
  const theme = useTheme()
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.4 }}>
      <Typography sx={{ fontSize: '1rem', lineHeight: 1, flexShrink: 0 }}>{icon}</Typography>
      <Typography
        sx={{
          fontSize: '0.875rem',
          fontWeight: highlight ? 700 : 500,
          color: highlight ? theme.palette.warning.main : 'text.primary',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {name}
      </Typography>
    </Box>
  )
}

interface TrofeoSectionProps {
  title: string
  accentColor: string
  children: React.ReactNode
}

function TrofeoSection({ title, accentColor, children }: TrofeoSectionProps) {
  return (
    <Box
      sx={{
        flex: 1,
        borderRadius: 1.5,
        border: `1px solid ${alpha(accentColor, 0.3)}`,
        backgroundColor: alpha(accentColor, 0.06),
        px: 1.5,
        py: 1,
        minWidth: 0,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.75 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: accentColor, flexShrink: 0 }} />
        <Typography
          sx={{
            fontSize: '0.65rem',
            fontWeight: 700,
            color: accentColor,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
          }}
        >
          {title}
        </Typography>
      </Box>
      {children}
    </Box>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Albo() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const alboList = api.albo.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const campionatoColor = theme.palette.info.light
  const championsColor = theme.palette.champions.main

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Albo d&apos;oro
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {alboList.isLoading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rectangular" height={110} sx={{ borderRadius: 2 }} />
            ))
          : (alboList.data ?? []).map((row) => (
              <Card key={row.id} elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
                {/* Season header */}
                <Box
                  sx={{
                    background: isDark
                      ? `linear-gradient(135deg, ${darken(theme.palette.primary.main, 0.65)} 0%, ${darken(theme.palette.primary.main, 0.4)} 100%)`
                      : `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.dark} 100%)`,
                    px: 2,
                    py: 0.75,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <EmojiEvents sx={{ color: isDark ? theme.palette.primary.light : theme.palette.common.white, fontSize: '1.1rem' }} />
                  <Typography
                    sx={{
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: isDark ? theme.palette.primary.light : theme.palette.common.white,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {row.stagione}
                  </Typography>
                </Box>

                {/* Trofei body */}
                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', gap: 1.5, flexDirection: { xs: 'column', sm: 'row' } }}>
                    <TrofeoSection title="Campionato" accentColor={campionatoColor}>
                      <PodioRow icon="🥇" name={row.campionato} highlight />
                      <PodioRow icon="🥈" name={row.secondo} />
                      <PodioRow icon="🥉" name={row.terzo} />
                    </TrofeoSection>

                    <TrofeoSection title="Champions" accentColor={championsColor}>
                      <PodioRow icon="🏆" name={row.champions} highlight />
                    </TrofeoSection>
                  </Box>
                </CardContent>
              </Card>
            ))}
      </Box>
    </Box>
  )
}
