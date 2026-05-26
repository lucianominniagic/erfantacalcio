'use client'
import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '~/utils/orpc'
import { calcolaEconomia } from '~/server/services/economiaService'
import {
  Box,
  Button,
  Chip,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import { EmojiEvents } from '@mui/icons-material'
import { formatCurrency } from '~/utils/numberUtils'
import { GenericCard } from '~/components/cards'
import Link from 'next/link'

const RIGHE_PREMI = [
  { label: '1° Classificato', pos: 1, emoji: '🥇' },
  { label: '2° Classificato', pos: 2, emoji: '🥈' },
  { label: '3° Classificato', pos: 3, emoji: '🥉' },
] as const

export default function EconomiaPreviewCard() {
  const detrazioneSito = parseFloat(
    process.env.NEXT_PUBLIC_COSTI_DOMINIO ?? '0',
  )

  const squadreQuery = useQuery(
    orpc.squadre.list.queryOptions({
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
  )

  const saldoQuery = useQuery(
    orpc.economia.getRisultatiStagione.queryOptions({
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
  )

  const isLoading = squadreQuery.isLoading || saldoQuery.isLoading

  const montepremi = useMemo(() => {
    if (!squadreQuery.data) return 0
    const importoAnnuale = squadreQuery.data.reduce(
      (acc, s) => acc + (s.importoAnnuale ?? 0),
      0,
    )
    const importoMulte = squadreQuery.data.reduce(
      (acc, s) => acc + (s.importoMulte ?? 0),
      0,
    )
    const importoMercato = squadreQuery.data.reduce(
      (acc, s) => acc + (s.importoMercato ?? 0),
      0,
    )
    return importoAnnuale + importoMercato + importoMulte - detrazioneSito
  }, [squadreQuery.data, detrazioneSito])

  const economia = useMemo(() => {
    if (!squadreQuery.data || !saldoQuery.data) return null
    return calcolaEconomia({
      montepremi,
      classificaMap: saldoQuery.data.classificaMap ?? {},
      idVincitriceChampions: saldoQuery.data.idVincitriceChampions ?? null,
      squadre: squadreQuery.data.map((s) => ({
        id: s.id,
        importoAnnuale: s.importoAnnuale ?? null,
        importoMulte: s.importoMulte ?? null,
        importoMercato: s.importoMercato ?? null,
        isAdmin: s.isAdmin,
      })),
    })
  }, [squadreQuery.data, saldoQuery.data, montepremi])

  const classificaMap = saldoQuery.data?.classificaMap ?? {}
  const idVincitriceChampions = saldoQuery.data?.idVincitriceChampions ?? null
  const finaleGiocata = saldoQuery.data?.finaleGiocata ?? false
  const premi = economia?.premi

  const getSquadraNome = (id: number) =>
    squadreQuery.data?.find((s) => s.id === id)?.squadra ?? '—'

  const vincitoriCampionato = RIGHE_PREMI.map(({ label, pos, emoji }) => {
    const entry = Object.entries(classificaMap).find(
      ([, v]) => v === pos,
    )
    const nome = entry ? getSquadraNome(Number(entry[0])) : '—'
    const importo =
      pos === 1
        ? (premi?.primo ?? 0)
        : pos === 2
          ? (premi?.secondo ?? 0)
          : (premi?.terzo ?? 0)
    return { label, emoji, nome, importo }
  })

  const nomeChampions = idVincitriceChampions
    ? getSquadraNome(idVincitriceChampions)
    : finaleGiocata
      ? '—'
      : 'In attesa…'

  return (
    <GenericCard
      title="Economia & Premi"
      titleVariant="h6"
      avatar={<EmojiEvents color="warning" />}
      showHeaderDivider
      showActionsDivider
      actions={
        <Button
          component={Link}
          href="/economia"
          size="small"
          color="primary"
          sx={{ ml: 'auto' }}
        >
          Vai all&apos;economia →
        </Button>
      }
      actionsSx={{ justifyContent: 'flex-end' }}
      sx={{ height: '100%' }}
    >
      {isLoading ? (
        <Stack spacing={1}>
          <Skeleton variant="text" width={160} />
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} variant="rounded" height={36} />
          ))}
        </Stack>
      ) : (
        <Stack spacing={0}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Montepremi totale:{' '}
              <strong>{formatCurrency(montepremi)}</strong>
            </Typography>
            {!finaleGiocata && (
              <Chip
                label="Provvisorio"
                size="small"
                color="warning"
                variant="outlined"
                sx={{ fontSize: '0.65rem', height: 18 }}
              />
            )}
          </Box>

          {vincitoriCampionato.map(({ label, emoji, nome, importo }) => (
            <PremioRow
              key={label}
              emoji={emoji}
              label={label}
              nome={nome}
              importo={importo}
            />
          ))}
          <PremioRow
            emoji="🏆"
            label="Champions"
            nome={nomeChampions}
            importo={premi?.champions ?? 0}
          />
        </Stack>
      )}
    </GenericCard>
  )
}

function PremioRow({
  emoji,
  label,
  nome,
  importo,
}: {
  emoji: string
  label: string
  nome: string
  importo: number
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        py: 0.75,
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&:last-child': { borderBottom: 'none' },
      }}
    >
      <Typography sx={{ fontSize: '1.1rem', lineHeight: 1 }}>{emoji}</Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {nome}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
      </Box>
      <Typography
        variant="body2"
        sx={{ fontWeight: 700, color: 'success.main', whiteSpace: 'nowrap' }}
      >
        {formatCurrency(importo)}
      </Typography>
    </Box>
  )
}
