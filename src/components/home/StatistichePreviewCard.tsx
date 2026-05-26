'use client'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '~/utils/orpc'
import { Avatar, Box, Button, Skeleton, Stack, Typography } from '@mui/material'
import { Assessment } from '@mui/icons-material'
import { GenericCard } from '~/components/cards'
import Link from 'next/link'

const MEDAGLIE = ['🥇', '🥈', '🥉']

export default function StatistichePreviewCard() {
  const torneiQuery = useQuery(
    orpc.tornei.list.queryOptions({
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
  )

  const idTornei = useMemo(() => {
    if (!torneiQuery.data) return []
    return torneiQuery.data
      .filter((t) => t.nome.toLowerCase().includes('campionato'))
      .map((t) => t.idTorneo)
  }, [torneiQuery.data])

  const statsQuery = useQuery(
    orpc.statisticheSquadre.riepilogo.queryOptions({
      input: { idTornei },
      enabled: idTornei.length > 0,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
  )

  const top3 = statsQuery.data?.slice(0, 3) ?? []
  const isLoading =
    torneiQuery.isLoading || (idTornei.length > 0 && statsQuery.isLoading)

  return (
    <GenericCard
      title="Top 3 Squadre"
      titleVariant="h6"
      avatar={<Assessment color="primary" />}
      showHeaderDivider
      showActionsDivider
      actions={
        <Button
          component={Link}
          href="/statistiche_squadre"
          size="small"
          color="primary"
          sx={{ ml: 'auto' }}
        >
          Vai alle statistiche →
        </Button>
      }
      actionsSx={{ justifyContent: 'flex-end' }}
      sx={{ height: '100%' }}
    >
      {isLoading ? (
        <Stack spacing={1}>
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} variant="rounded" height={44} />
          ))}
        </Stack>
      ) : (
        <Stack spacing={0}>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
            Media fantapunti — Campionato
          </Typography>
          {top3.map((s, idx) => (
            <Box
              key={s.id}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                py: 0.75,
                borderBottom: '1px solid',
                borderColor: 'divider',
                '&:last-child': { borderBottom: 'none' },
              }}
            >
              <Typography sx={{ fontSize: '1.1rem', lineHeight: 1, minWidth: 22 }}>
                {MEDAGLIE[idx]}
              </Typography>
              <Avatar
                src={s.foto ?? undefined}
                alt={s.squadra}
                sx={{ width: 30, height: 30 }}
              />
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {s.squadra}
              </Typography>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {s.mediaFantapunti}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  media pts
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </GenericCard>
  )
}
