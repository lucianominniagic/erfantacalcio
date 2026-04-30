'use client'
import { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Grid,
  Tab,
  Tabs,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { api } from '~/utils/api'
import RiepilogoSquadre from './RiepilogoSquadre'
import HeadToHeadMatrix from './HeadToHeadMatrix'
import TopGiocatoriSquadre from './TopGiocatoriSquadre'

const ALLOWED_NAMES = ['campionato', 'champions']

type Torneo = {
  idTorneo: number
  nome: string
  gruppoFase: string | null
  hasClassifica: boolean
}

export default function StatisticheSquadre() {
  const torneiList = api.tornei.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  const [selectedNome, setSelectedNome] = useState<string | undefined>(undefined)
  const [tab, setTab] = useState(0)

  const tornei = useMemo<Torneo[]>(
    () => (torneiList.data as Torneo[] | undefined) ?? [],
    [torneiList.data],
  )

  // Group filtered tornei by nome: "Campionato" → [id1, id2, ...]
  const torneiGroups = useMemo(() => {
    const map = new Map<string, number[]>()
    for (const t of tornei) {
      const lower = t.nome.toLowerCase()
      if (!ALLOWED_NAMES.some((n) => lower.includes(n))) continue
      const existing = map.get(t.nome) ?? []
      existing.push(t.idTorneo)
      map.set(t.nome, existing)
    }
    return map
  }, [tornei])

  const groupNames = useMemo(() => Array.from(torneiGroups.keys()), [torneiGroups])

  useEffect(() => {
    if (selectedNome === undefined && groupNames.length > 0) {
      // Prefer "campionato"-named group, else first
      const def =
        groupNames.find((n) => n.toLowerCase().includes('campionato')) ?? groupNames[0]
      if (def) setSelectedNome(def)
    }
  }, [groupNames, selectedNome])

  const idTornei = useMemo(
    () => (selectedNome ? (torneiGroups.get(selectedNome) ?? []) : []),
    [selectedNome, torneiGroups],
  )

  return (
    <Grid container spacing={1} paddingTop={2} paddingBottom={2}>
      <Grid item xs={12}>
        <Typography variant="h4">Statistiche Squadre</Typography>
      </Grid>

      <Grid item xs={12}>
        <ToggleButtonGroup
          value={selectedNome ?? null}
          exclusive
          onChange={(_, val: string | null) => { if (val !== null) setSelectedNome(val) }}
          size="small"
          disabled={groupNames.length === 0}
        >
          {groupNames.map((nome) => (
            <ToggleButton key={nome} value={nome}>
              {nome}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={tab}
            onChange={(_, v: number) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Riepilogo" />
            <Tab label="Scontri diretti" />
            <Tab label="Top giocatori" />
          </Tabs>
        </Box>
      </Grid>

      <Grid item xs={12} sx={{ minHeight: 500 }}>
        {tab === 0 && <RiepilogoSquadre idTornei={idTornei} />}
        {tab === 1 && <HeadToHeadMatrix idTornei={idTornei} />}
        {tab === 2 && <TopGiocatoriSquadre idTornei={idTornei} />}
      </Grid>
    </Grid>
  )
}
