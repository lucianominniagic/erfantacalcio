'use client'

import { useId, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Box,
  Chip,
  Divider,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import {
  AccountBalanceWallet,
  ExpandMore,
  MilitaryTech,
} from '@mui/icons-material'
import PageHeader from '~/components/PageHeader'
import { orpc } from '~/utils/orpc'
import { calcolaEconomia } from '~/server/services/economiaService'
import { formatCurrency } from '~/utils/numberUtils'

function MoneyRow({
  label,
  value,
  strong = false,
}: {
  label: string
  value: number
  strong?: boolean
}) {
  return (
    <Stack
      direction="row"
      justifyContent="space-between"
      gap={2}
      sx={{ py: 1 }}
    >
      <Typography
        variant="body2"
        color={strong ? 'text.primary' : 'text.secondary'}
        fontWeight={strong ? 700 : 400}
        sx={{ minWidth: 0 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700} sx={{ flexShrink: 0 }}>
        {formatCurrency(value)}
      </Typography>
    </Stack>
  )
}

export default function Economia() {
  const id = useId()
  const detrazioneSito = parseFloat(
    process.env.NEXT_PUBLIC_COSTI_DOMINIO ?? '0',
  )
  const economiaList = useQuery(
    orpc.squadre.list.queryOptions({
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
  )
  const saldoData = useQuery(
    orpc.economia.getRisultatiStagione.queryOptions({
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
  )
  const importoAnnuale =
    economiaList.data?.reduce((sum, s) => sum + (s.importoAnnuale ?? 0), 0) ?? 0
  const importoMulte =
    economiaList.data?.reduce((sum, s) => sum + (s.importoMulte ?? 0), 0) ?? 0
  const importoMercato =
    economiaList.data?.reduce((sum, s) => sum + (s.importoMercato ?? 0), 0) ?? 0
  const montepremi =
    importoAnnuale + importoMulte + importoMercato - detrazioneSito
  const finaleGiocata = saldoData.data?.finaleGiocata ?? false
  const economiaCalcolata = useMemo(() => {
    if (!economiaList.data || !saldoData.data) return null
    return calcolaEconomia({
      montepremi,
      classificaMap: saldoData.data.classificaMap ?? {},
      idVincitriceChampions: saldoData.data.idVincitriceChampions ?? null,
      squadre: economiaList.data.map((s) => ({
        id: s.id,
        importoAnnuale: s.importoAnnuale ?? null,
        importoMulte: s.importoMulte ?? null,
        importoMercato: s.importoMercato ?? null,
        isAdmin: s.isAdmin,
      })),
    })
  }, [economiaList.data, saldoData.data, montepremi])

  const header = (
    <PageHeader title="Economia & Premi" Icon={AccountBalanceWallet} />
  )
  if (economiaList.isError || saldoData.isError) {
    return (
      <Box>
        {header}
        <Alert severity="error">
          Impossibile caricare i dati economici:{' '}
          {economiaList.error?.message ?? saldoData.error?.message}
        </Alert>
      </Box>
    )
  }
  if (!economiaList.data || !saldoData.data || !economiaCalcolata) {
    return (
      <Stack spacing={2} aria-busy="true" aria-label="Caricamento economia">
        {header}
        <Skeleton variant="rounded" height={240} />
        <Skeleton variant="rounded" height={320} />
      </Stack>
    )
  }

  const nomeSquadra = (teamId: number) =>
    economiaList.data.find((s) => s.id === teamId)?.squadra ?? '—'
  const nomeClassificata = (position: number) => {
    const entry = Object.entries(saldoData.data.classificaMap ?? {}).find(
      ([, pos]) => pos === position,
    )
    return entry ? nomeSquadra(Number(entry[0])) : 'Da assegnare'
  }
  const premi = [
    {
      label: '1° Campionato',
      percent: 52,
      value: economiaCalcolata.premi.primo,
      team: nomeClassificata(1),
    },
    {
      label: '2° Campionato',
      percent: 20,
      value: economiaCalcolata.premi.secondo,
      team: nomeClassificata(2),
    },
    {
      label: '3° Campionato',
      percent: 13,
      value: economiaCalcolata.premi.terzo,
      team: nomeClassificata(3),
    },
    {
      label: 'Champions',
      percent: 15,
      value: economiaCalcolata.premi.champions,
      team:
        saldoData.data.idVincitriceChampions != null
          ? nomeSquadra(saldoData.data.idVincitriceChampions)
          : finaleGiocata
            ? 'Da assegnare'
            : 'Finale da giocare',
    },
  ]

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        maxWidth: 1100,
        mx: 'auto',
        overflowWrap: 'anywhere',
      }}
    >
      {header}
      <Stack spacing={3}>
        <Box>
          <Chip
            size="small"
            variant="outlined"
            color={finaleGiocata ? 'success' : 'warning'}
            label={finaleGiocata ? 'Saldo definitivo' : 'Saldo provvisorio'}
          />
          {!finaleGiocata && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              I saldi possono cambiare: la finale Champions non è ancora stata
              giocata.
            </Typography>
          )}
        </Box>
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2.5, sm: 3 },
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <AccountBalanceWallet color="primary" />
            <Typography variant="overline">Montepremi della lega</Typography>
          </Stack>
          <Typography
            component="p"
            variant="h1"
            sx={{ my: 1, fontSize: { xs: '2.5rem', sm: '3.5rem' } }}
          >
            {formatCurrency(montepremi)}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {economiaList.data.length} squadre · al netto dei costi sito
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
              gap: 1,
            }}
          >
            {[
              { label: 'Quote', value: importoAnnuale },
              { label: 'Mercato', value: importoMercato },
              { label: 'Multe', value: importoMulte },
            ].map(({ label, value }) => (
              <Box key={label} sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  {label}
                </Typography>
                <Typography fontWeight={700}>
                  {formatCurrency(value)}
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: 'minmax(0, 1fr)',
              md: 'repeat(2, minmax(0, 1fr))',
            },
            alignItems: 'start',
            gap: 3,
          }}
        >
          <Paper variant="outlined" sx={{ p: 2, minWidth: 0 }}>
            <Typography variant="h6" component="h2">
              Premi in palio
            </Typography>
            <Stack divider={<Divider />}>
              {premi.map((premio) => (
                <Stack
                  key={premio.label}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  gap={1}
                  sx={{ py: 1.5 }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={700}>
                      {premio.label} · {premio.percent}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {premio.team}
                    </Typography>
                  </Box>
                  <Typography
                    fontWeight={800}
                    color="primary.main"
                    sx={{ flexShrink: 0 }}
                  >
                    {formatCurrency(premio.value)}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Paper>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" component="h2" sx={{ mb: 1 }}>
              Saldo delle squadre
            </Typography>
            {economiaCalcolata.squadreCalcolate.length === 0 && (
              <Alert severity="info">Nessuna squadra partecipante.</Alert>
            )}
            <Stack spacing={1.5}>
              {economiaCalcolata.squadreCalcolate.map((calcolata) => {
                const squadra = economiaList.data.find(
                  (s) => s.id === calcolata.id,
                )
                if (!squadra) return null
                const saldo = calcolata.saldo
                return (
                  <Accordion
                    key={squadra.id}
                    disableGutters
                    elevation={0}
                    variant="outlined"
                  >
                    <AccordionSummary
                      expandIcon={<ExpandMore />}
                      id={`${id}-squadra-${squadra.id}`}
                      aria-controls={`${id}-dettaglio-${squadra.id}`}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        gap={1}
                        sx={{ width: '100%', minWidth: 0, pr: 1 }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          gap={1}
                          sx={{ minWidth: 0 }}
                        >
                          <Avatar
                            src={squadra.foto ?? undefined}
                            alt=""
                            sx={{
                              width: 32,
                              height: 32,
                              display: { xs: 'none', sm: 'flex' },
                            }}
                          />
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={700}>
                              {squadra.squadra}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {squadra.presidente}
                            </Typography>
                          </Box>
                        </Stack>
                        <Box sx={{ textAlign: 'right', flexShrink: 0 }}>
                          <Typography variant="caption" color="text.secondary">
                            {saldo > 0
                              ? 'Da ricevere'
                              : saldo < 0
                                ? 'Da versare'
                                : 'In pareggio'}
                          </Typography>
                          <Typography
                            variant="h3"
                            component="p"
                            color={
                              saldo > 0
                                ? 'success.main'
                                : saldo < 0
                                  ? 'error.main'
                                  : 'text.secondary'
                            }
                          >
                            {formatCurrency(Math.abs(saldo))}
                          </Typography>
                        </Box>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails id={`${id}-dettaglio-${squadra.id}`}>
                      <MoneyRow
                        label="Quota annuale"
                        value={squadra.importoAnnuale ?? 0}
                      />
                      <MoneyRow
                        label="Mercato"
                        value={squadra.importoMercato ?? 0}
                      />
                      <MoneyRow
                        label="Multe"
                        value={squadra.importoMulte ?? 0}
                      />
                      <Divider />
                      <MoneyRow
                        label="Totale contributi"
                        value={calcolata.pagato}
                        strong
                      />
                      <MoneyRow
                        label="Premi maturati"
                        value={calcolata.premio}
                        strong
                      />
                      <Stack
                        direction="row"
                        flexWrap="wrap"
                        gap={0.5}
                        sx={{ my: 1 }}
                      >
                        {calcolata.premiVinti.map((premio) => (
                          <Chip
                            key={premio.label}
                            size="small"
                            icon={<MilitaryTech />}
                            label={premio.label}
                            color={premio.color}
                          />
                        ))}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Saldo = premi − contributi. Budget mercato:{' '}
                        {squadra.fantamilioni != null
                          ? `${squadra.fantamilioni} FM`
                          : '—'}
                        , separato dagli euro.
                      </Typography>
                      {squadra.isAdmin && (
                        <Alert severity="info" sx={{ mt: 1.5 }}>
                          Rimborso sito separato:{' '}
                          {formatCurrency(detrazioneSito)}, non incluso nel
                          saldo.
                        </Alert>
                      )}
                    </AccordionDetails>
                  </Accordion>
                )
              })}
            </Stack>
          </Box>
        </Box>
        <Accordion disableGutters elevation={0} variant="outlined">
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id={`${id}-contributi`}
            aria-controls={`${id}-contributi-dettaglio`}
          >
            <Typography variant="body2">
              Come si forma il montepremi?
            </Typography>
          </AccordionSummary>
          <AccordionDetails id={`${id}-contributi-dettaglio`}>
            <MoneyRow label="Quote annuali" value={importoAnnuale} />
            <MoneyRow label="Mercato di riparazione" value={importoMercato} />
            <MoneyRow label="Multe" value={importoMulte} />
            <MoneyRow label="Costi sito" value={-detrazioneSito} />
            <Divider />
            <MoneyRow label="Montepremi netto" value={montepremi} strong />
          </AccordionDetails>
        </Accordion>
      </Stack>
    </Box>
  )
}
