'use client'
import React, { useEffect, useState, useMemo } from 'react'
import { api } from '~/utils/api'
import { Alert, Box, Skeleton, Stack, Typography, Tabs, Tab } from '@mui/material'
import CardPartite from '../cardPartite/CardPartite'
import CheckIcon from '@mui/icons-material/CheckCircle'
import { z } from 'zod'
import { giornataSchema } from '~/schemas/calendario'


interface CalendarioProps {
  prefixTitle: string
  tipo: 'risultati' | 'prossima'
  enableTabs?: boolean
}

export default function Calendario({ prefixTitle, tipo, enableTabs = false }: CalendarioProps) {
  const calendarioList =
    tipo === 'prossima'
      ? api.calendario.getProssimeGiornate.useQuery(undefined, {
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
        })
      : api.calendario.getUltimiRisultati.useQuery(undefined, {
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
        })
  const [errorMessage, setErrorMessage] = useState('')
  const [giornata, setGiornata] = useState<z.infer<typeof giornataSchema>[]>()
  // selectedTorneo now stores the tournament name (key) so that entries with the same name are grouped together
  const [selectedTorneo, setSelectedTorneo] = useState<string | null>(null)

  useEffect(() => {
    if (
      !calendarioList.isFetching &&
      calendarioList.isSuccess &&
      calendarioList.data
    ) {
      setGiornata(calendarioList.data)
    }
  }, [calendarioList.data, calendarioList.isSuccess, calendarioList.isFetching])

  useEffect(() => {
    if (calendarioList.isError) {
      setErrorMessage('Si è verificato un errore in fase di caricamento')
    }
  }, [calendarioList.isError])

  const groups = useMemo(() => {
    if (!giornata) return [] as { key: string; name: string; items: z.infer<typeof giornataSchema>[] }[]
    const map = new Map<string, { name: string; items: z.infer<typeof giornataSchema>[] }>()
    for (const g of giornata) {
      const id = g.idTorneo ?? -1
      const name = g.Torneo ?? `Torneo ${id}`
      const key = name // group by tournament name
      const existing = map.get(key)
      if (existing) {
        existing.items.push(g)
      } else {
        map.set(key, { name, items: [g] })
      }
    }
    return Array.from(map.entries()).map(([key, v]) => ({ key, name: v.name, items: v.items }))
  }, [giornata])

  useEffect(() => {
    if (groups.length > 0) {
      const exists = groups.find((g) => g.key === selectedTorneo)
      if (!exists) {
        setSelectedTorneo(groups[0].key)
      }
    } else {
      setSelectedTorneo(null)
    }
  }, [groups])

  const renderGiornata = () => {
    if (enableTabs && groups.length > 1) {
      const group = groups.find((g) => g.key === selectedTorneo) || groups[0]
      return (
        <CardPartite
          giornata={group.items}
          prefixTitle={prefixTitle}
          maxWidth={600}
          withAvatar={true}
        ></CardPartite>
      )
    }

    return (
      <CardPartite
        giornata={giornata ?? []}
        prefixTitle={prefixTitle}
        maxWidth={600}
        withAvatar={true}
      ></CardPartite>
    )
  }

  return (
    <>
      {!calendarioList.isLoading && giornata && (
        <>
          {enableTabs && groups.length > 1 && (
            <Tabs
              value={selectedTorneo ?? groups[0].key}
              onChange={(e, val) => setSelectedTorneo(String(val))}
              variant={groups.length > 4 ? 'scrollable' : 'standard'}
              scrollButtons={'auto'}
              textColor="primary"
              indicatorColor="primary"
              aria-label="Calendari Tabs"
              sx={{ mb: 1 }}
            >
              {groups.map((g) => (
                <Tab key={g.key} label={g.name} value={g.key} />
              ))}
            </Tabs>
          )}

          {renderGiornata()}
        </>
      )}
      {calendarioList.isLoading && (
        <Box>
          <Skeleton width="100%" height={70} animation="pulse">
            <Typography>.</Typography>
          </Skeleton>
          <Skeleton width="100%" height={70} animation="pulse">
            <Typography>.</Typography>
          </Skeleton>
          <Skeleton width="100%" height={70} animation="pulse">
            <Typography>.</Typography>
          </Skeleton>
          <Skeleton width="100%" height={70} animation="pulse">
            <Typography>.</Typography>
          </Skeleton>
        </Box>
      )}
      {errorMessage && (
        <Stack sx={{ width: '100%' }} spacing={0}>
          <Alert icon={<CheckIcon fontSize="inherit" />} severity="error">
            {errorMessage}
          </Alert>
        </Stack>
      )}
    </>
  )
}
