'use client'
import { Fragment, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControlLabel,
  InputAdornment,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { CheckCircle, EmojiEvents, Gavel, HourglassEmpty } from '@mui/icons-material'
import { alpha, useTheme } from '@mui/material/styles'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '~/utils/orpc'
import { type Ruoli } from '~/types/common'
import { getRuoloEsteso } from '~/utils/formazione'
import { Configurazione } from '~/config'

// ── Helper: formatta la scadenza ────────────────────────────────────────────
function fmtScadenza(d: Date | string) {
  return new Date(d).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Restituisce stringa "X ore Y min" oppure "scaduta"
function labelTimer(d: Date | string): { label: string; scaduta: boolean } {
  const ms = new Date(d).getTime() - Date.now()
  if (ms <= 0) return { label: 'Scaduta', scaduta: true }
  const totalMin = Math.floor(ms / 60_000)
  const ore = Math.floor(totalMin / 60)
  const min = totalMin % 60
  if (ore > 0) return { label: `${ore}h ${min}min`, scaduta: false }
  return { label: `${min}min`, scaduta: false }
}

// ── Componente principale ────────────────────────────────────────────────────
export default function AstaInChiaroUtente() {
  const queryClient = useQueryClient()
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))
  const [ruolo, setRuolo] = useState<Ruoli>('C')

  // ── Prezzi offerta per giocatore (form state) ──
  const [prezzi, setPrezzi] = useState<Record<number, string>>({})
  const [erroriProposta, setErroriProposta] = useState<Record<number, string>>(
    {},
  )

  // ── Snackbar ──
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'error'
  }>({ open: false, message: '', severity: 'success' })

  // ── Query: aste in chiaro (polling 60s) ──
  const {
    data: propostaInChiaro,
    isLoading: loadingAste,
    isError: errorAste,
  } = useQuery({
    ...orpc.mercato.getProposteAstaInChiaro.queryOptions(),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 60_000,
  })

  // ── Query: giocatori svincolati (per il ruolo selezionato) ──
  const {
    data: giocatori,
    isLoading: loadingGiocatori,
    isError: errorGiocatori,
  } = useQuery({
    ...orpc.mercato.getGiocatoriSvincolati.queryOptions({
      input: { ruolo, stagione: Configurazione.stagione },
    }),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: 60_000,
  })

  // ── Mutation: crea/aggiorna offerta ──
  const createProposta = useMutation({
    ...orpc.mercato.createProposta.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: orpc.mercato.getProposteAstaInChiaro.queryKey(),
      })
      void queryClient.invalidateQueries({
        queryKey: orpc.mercato.getSessioneAttiva.queryKey(),
      })
      void queryClient.invalidateQueries({
        queryKey: orpc.mercato.getGiocatoriSvincolati.queryKey({
          input: { ruolo, stagione: Configurazione.stagione },
        }),
      })
      setSnackbar({
        open: true,
        message: 'Offerta inviata con successo',
        severity: 'success',
      })
    },
  })

  // ── Derived type — inferred from query, no manual interface needed ──
  type AstaInChiaroItem = NonNullable<typeof propostaInChiaro>[number]

  // ── Map aste in corso per idGiocatore ──
  const asteMap = new Map<number, AstaInChiaroItem>(
    (propostaInChiaro ?? []).map((a) => [a.idGiocatore, a]),
  )

  // ── Aste attive (ordinate per scadenza crescente) ──
  const asteAttive = (propostaInChiaro ?? [])
    .filter((a) => !a.aggiudicato)
    .sort(
      (a, b) => new Date(a.scadenza).getTime() - new Date(b.scadenza).getTime(),
    )

  // ── Aste scadute/aggiudicate (ordinate per scadenza decrescente — più recenti prima) ──
  const asteScadute = (propostaInChiaro ?? [])
    .filter((a) => a.aggiudicato)
    .sort(
      (a, b) => new Date(b.scadenza).getTime() - new Date(a.scadenza).getTime(),
    )

  // ── Tutte le aste nell'ordine visualizzato: attive prima, scadute dopo ──
  const tutteLeAste = [...asteAttive, ...asteScadute]

  // ── Set su TUTTE le aste (attive + scadute) per evitare duplicati in polling/cache race ──
  const allAsteIds = new Set((propostaInChiaro ?? []).map((a) => a.idGiocatore))
  const giocatoriSenzaAsta = (giocatori ?? []).filter(
    (g) => !allAsteIds.has(g.idGiocatore),
  )

  // ── Label valuta ──
  const lv = '€'

  // ── Handler: offri / rilancia ──
  const handleOfferta = (idGiocatore: number) => {
    const asta = asteMap.get(idGiocatore)
    const prezzoMaxCorrente = asta?.offertaMassima.prezzo ?? 0
    const prezzo = parseFloat(prezzi[idGiocatore] ?? '0')

    // Guard client-side: non permettere di rilanciare se sei già il leader
    const sonoIlLeaderGuard =
      asta !== undefined &&
      asta.miaOfferta !== null &&
      asta.miaOfferta >= asta.offertaMassima.prezzo
    if (sonoIlLeaderGuard) {
      const msg =
        `Sei già il miglior offerente. Attendi che un'altra squadra rilanci prima di poter fare una nuova offerta.`
      // setErroriProposta((prev) => ({ ...prev, [idGiocatore]: msg }))
      setSnackbar({ open: true, message: msg, severity: 'error' })
      return
    }

    if (!prezzo || prezzo <= 0) {
      setErroriProposta((prev) => ({
        ...prev,
        [idGiocatore]: 'Inserisci un prezzo valido',
      }))
      return
    }

    if (prezzo <= prezzoMaxCorrente) {
      setErroriProposta((prev) => ({
        ...prev,
        [idGiocatore]: `L'offerta deve essere superiore all'attuale massimo (${prezzoMaxCorrente} ${lv})`,
      }))
      return
    }

    setErroriProposta((prev) => {
      const next = { ...prev }
      delete next[idGiocatore]
      return next
    })

    createProposta.mutate(
      { idGiocatore, prezzoOfferto: prezzo },
      {
        onError: (err) => {
          setErroriProposta((prev) => ({
            ...prev,
            [idGiocatore]: err.message,
          }))
          setSnackbar({ open: true, message: err.message, severity: 'error' })
        },
      },
    )
  }

  // ── Placeholder offerta suggerita per un giocatore ──
  function placeholderMin(idGiocatore: number) {
    const asta = asteMap.get(idGiocatore)
    if (!asta) return '1'
    return String(asta.offertaMassima.prezzo + 1)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Stack spacing={3}>
      {/* ── Aste in corso ─────────────────────────────────────────── */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Aste avviate
        </Typography>

        {loadingAste ? (
          <Stack spacing={1}>
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={56} />
            ))}
          </Stack>
        ) : errorAste ? (
          <Alert severity="error">
            Errore nel caricamento delle aste. Riprova tra qualche secondo.
          </Alert>
        ) : tutteLeAste.length === 0 ? (
          <Alert severity="info" icon={<Gavel />}>
            Nessuna asta avviata. Effettua la prima offerta su un giocatore.
          </Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table
              size="small"
              sx={{
                tableLayout: { xs: 'fixed', md: 'auto' },
                '& td, & th': { px: { xs: 0.75, md: 1.5 } },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: { xs: '38%', md: 'auto' } }}>
                    Giocatore
                  </TableCell>
                  <TableCell sx={{ width: { xs: '32%', md: 'auto' } }}>
                    Offerta max.
                  </TableCell>
                  <TableCell sx={{ width: { xs: '30%', md: 'auto' } }}>
                    Mia offerta
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                    Stato / Scadenza
                  </TableCell>
                  <TableCell
                    sx={{ display: { xs: 'none', md: 'table-cell' }, width: 200 }}
                  >
                    Nuova offerta ({lv})
                  </TableCell>
                  <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {tutteLeAste.map((asta) => {
                  const timer = labelTimer(asta.scadenza)
                  const sonoIlLeader =
                    asta.miaOfferta !== null &&
                    asta.miaOfferta >= asta.offertaMassima.prezzo
                  const haOfferta = asta.miaOfferta !== null
                  const isScaduta = asta.aggiudicato

                  // ── asta aggiudicata ──
                  if (isScaduta) {
                    return (
                      <Fragment key={asta.idGiocatore}>
                        <TableRow sx={{ opacity: 0.85 }}>
                          <TableCell
                            sx={{
                              borderBottom: { xs: 0, md: undefined },
                              pb: { xs: 0.5, md: undefined },
                            }}
                          >
                            <Typography
                              variant="body2"
                              fontWeight={700}
                              noWrap
                              color="text.secondary"
                            >
                              {asta.nomeGiocatore}
                            </Typography>
                          </TableCell>
                          <TableCell
                            sx={{
                              borderBottom: { xs: 0, md: undefined },
                              pb: { xs: 0.5, md: undefined },
                            }}
                          >
                            <Stack
                              direction="row"
                              spacing={0.5}
                              alignItems="center"
                            >
                              <EmojiEvents
                                fontSize="small"
                                sx={{ color: 'warning.main' }}
                              />
                              <Typography variant="body2" fontWeight={600}>
                                {asta.offertaMassima.prezzo} {lv}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'inline' }}
                              >
                                ({asta.offertaMassima.presidente})
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell
                            sx={{
                              borderBottom: { xs: 0, md: undefined },
                              pb: { xs: 0.5, md: undefined },
                            }}
                          >
                            {haOfferta ? (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {asta.miaOfferta} {lv}
                              </Typography>
                            ) : (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                —
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell
                            sx={{ display: { xs: 'none', md: 'table-cell' } }}
                          >
                            <Stack
                              direction="row"
                              spacing={0.75}
                              alignItems="center"
                            >
                              <Chip
                                icon={<CheckCircle />}
                                label="Aggiudicata"
                                size="small"
                                color="default"
                                variant="outlined"
                                sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                              />
                              <Tooltip
                                title={`Scaduta il: ${fmtScadenza(asta.scadenza)}`}
                              >
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ cursor: 'default' }}
                                >
                                  {fmtScadenza(asta.scadenza)}
                                </Typography>
                              </Tooltip>
                            </Stack>
                          </TableCell>
                          <TableCell
                            sx={{ display: { xs: 'none', md: 'table-cell' } }}
                          />
                          <TableCell
                            sx={{ display: { xs: 'none', md: 'table-cell' } }}
                          />
                        </TableRow>

                        <TableRow
                          sx={{
                            display: { xs: 'table-row', md: 'none' },
                            opacity: 0.85,
                          }}
                        >
                          <TableCell colSpan={3} sx={{ pt: 0, pb: 1 }}>
                            <Stack
                              direction="row"
                              spacing={0.75}
                              alignItems="center"
                            >
                              <Chip
                                icon={<CheckCircle />}
                                label="Aggiudicata"
                                size="small"
                                color="default"
                                variant="outlined"
                                sx={{ fontWeight: 600, fontSize: '0.7rem' }}
                              />
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {fmtScadenza(asta.scadenza)}
                              </Typography>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      </Fragment>
                    )
                  }

                  const rowBg = sonoIlLeader
                    ? { bgcolor: alpha(theme.palette.success.main, 0.12) }
                    : {}

                  return (
                    <Fragment key={asta.idGiocatore}>
                      <TableRow sx={rowBg}>
                        <TableCell
                          sx={{
                            borderBottom: { xs: 0, md: undefined },
                            pb: { xs: 0.5, md: undefined },
                          }}
                        >
                          <Typography variant="body2" fontWeight={700} noWrap>
                            {asta.nomeGiocatore}
                          </Typography>
                        </TableCell>
                        <TableCell
                          sx={{
                            borderBottom: { xs: 0, md: undefined },
                            pb: { xs: 0.5, md: undefined },
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                          >
                            {sonoIlLeader && (
                              <Tooltip title="Sei il miglior offerente">
                                <EmojiEvents
                                  fontSize="small"
                                  sx={{ color: 'warning.main' }}
                                />
                              </Tooltip>
                            )}
                            <Typography variant="body2" fontWeight={600}>
                              {asta.offertaMassima.prezzo} {lv}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ display: 'inline' }}
                            >
                              ({asta.offertaMassima.presidente})
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell
                          sx={{
                            borderBottom: { xs: 0, md: undefined },
                            pb: { xs: 0.5, md: undefined },
                          }}
                        >
                          {haOfferta ? (
                            <Typography
                              variant="body2"
                              color={
                                sonoIlLeader ? 'success.main' : 'text.secondary'
                              }
                            >
                              {asta.miaOfferta} {lv}
                            </Typography>
                          ) : (
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              —
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell
                          sx={{ display: { xs: 'none', md: 'table-cell' } }}
                        >
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                          >
                            <HourglassEmpty
                              fontSize="small"
                              sx={{
                                color: timer.scaduta
                                  ? 'error.main'
                                  : 'text.secondary',
                              }}
                            />
                            <Tooltip
                              title={`Scade: ${fmtScadenza(asta.scadenza)}`}
                            >
                              <Typography
                                variant="body2"
                                color={
                                  timer.scaduta ? 'error.main' : 'text.primary'
                                }
                              >
                                {timer.label}
                              </Typography>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                        <TableCell
                          sx={{
                            display: { xs: 'none', md: 'table-cell' },
                            width: 200,
                          }}
                        >
                          <Tooltip
                            title={
                              sonoIlLeader
                                ? `Sei già il miglior offerente. Non puoi rilanciare finché un'altra squadra non supera la tua offerta.`
                                : ''
                            }
                            disableHoverListener={!sonoIlLeader}
                            disableFocusListener={!sonoIlLeader}
                            disableTouchListener={!sonoIlLeader}
                          >
                            <span>
                              <TextField
                                sx={{ width: 90 }}
                                size="small"
                                type="number"
                                placeholder={placeholderMin(asta.idGiocatore)}
                                value={prezzi[asta.idGiocatore] ?? ''}
                                onChange={(e) =>
                                  setPrezzi((prev) => ({
                                    ...prev,
                                    [asta.idGiocatore]: e.target.value,
                                  }))
                                }
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      {lv}
                                    </InputAdornment>
                                  ),
                                }}
                                error={!!erroriProposta[asta.idGiocatore]}
                                helperText={erroriProposta[asta.idGiocatore]}
                                inputProps={{
                                  min: asta.offertaMassima.prezzo + 1,
                                  step: 1,
                                }}
                                disabled={sonoIlLeader}
                              />
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell
                          sx={{ display: { xs: 'none', md: 'table-cell' } }}
                        >
                          <Tooltip
                            title={
                              sonoIlLeader
                                ? `Non puoi rilanciare finché un'altra squadra non supera la tua offerta`
                                : ''
                            }
                            disableHoverListener={!sonoIlLeader}
                            disableFocusListener={!sonoIlLeader}
                            disableTouchListener={!sonoIlLeader}
                          >
                            <span>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleOfferta(asta.idGiocatore)}
                                disabled={
                                  createProposta.isPending || sonoIlLeader
                                }
                                aria-label={
                                  sonoIlLeader
                                    ? 'Sei già il miglior offerente — attendi un rilancio avversario'
                                    : haOfferta
                                      ? 'Rilancia'
                                      : 'Offri'
                                }
                              >
                                {sonoIlLeader
                                  ? 'Sei in testa'
                                  : haOfferta
                                    ? 'Rilancia'
                                    : 'Offri'}
                              </Button>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>

                      <TableRow
                        sx={{
                          display: { xs: 'table-row', md: 'none' },
                          ...rowBg,
                        }}
                      >
                        <TableCell sx={{ pt: 0, pb: 1 }}>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            alignItems="center"
                          >
                            <HourglassEmpty
                              fontSize="small"
                              sx={{
                                color: timer.scaduta
                                  ? 'error.main'
                                  : 'text.secondary',
                              }}
                            />
                            <Typography
                              variant="caption"
                              color={
                                timer.scaduta ? 'error.main' : 'text.primary'
                              }
                            >
                              {timer.label}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ pt: 0, pb: 1, overflow: 'hidden' }}>
                          <Tooltip
                            title={
                              sonoIlLeader
                                ? `Sei già il miglior offerente. Non puoi rilanciare finché un'altra squadra non supera la tua offerta.`
                                : ''
                            }
                            disableHoverListener={!sonoIlLeader}
                            disableFocusListener={!sonoIlLeader}
                            disableTouchListener={!sonoIlLeader}
                          >
                            <span style={{ display: 'block', width: '100%' }}>
                              <TextField
                                sx={{ width: 90 }}
                                size="small"
                                type="number"
                                placeholder={placeholderMin(asta.idGiocatore)}
                                value={prezzi[asta.idGiocatore] ?? ''}
                                onChange={(e) =>
                                  setPrezzi((prev) => ({
                                    ...prev,
                                    [asta.idGiocatore]: e.target.value,
                                  }))
                                }
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      {lv}
                                    </InputAdornment>
                                  ),
                                }}
                                error={!!erroriProposta[asta.idGiocatore]}
                                helperText={erroriProposta[asta.idGiocatore]}
                                inputProps={{
                                  min: asta.offertaMassima.prezzo + 1,
                                  step: 1,
                                }}
                                disabled={sonoIlLeader}
                                sx={{
                                  width: '100%',
                                  '& .MuiInputBase-root': { minWidth: 0 },
                                }}
                              />
                            </span>
                          </Tooltip>
                        </TableCell>
                        <TableCell sx={{ pt: 0, pb: 1, px: { xs: 0.5 } }}>
                          <Tooltip
                            title={
                              sonoIlLeader
                                ? `Non puoi rilanciare finché un'altra squadra non supera la tua offerta`
                                : ''
                            }
                            disableHoverListener={!sonoIlLeader}
                            disableFocusListener={!sonoIlLeader}
                            disableTouchListener={!sonoIlLeader}
                          >
                            <span>
                              <Button
                                size="small"
                                variant="outlined"
                                onClick={() => handleOfferta(asta.idGiocatore)}
                                disabled={
                                  createProposta.isPending || sonoIlLeader
                                }
                                aria-label={
                                  sonoIlLeader
                                    ? 'Sei già il miglior offerente — attendi un rilancio avversario'
                                    : haOfferta
                                      ? 'Rilancia'
                                      : 'Offri'
                                }
                                sx={{ minWidth: 0, whiteSpace: 'nowrap' }}
                              >
                                {sonoIlLeader
                                  ? 'In testa'
                                  : haOfferta
                                    ? 'Rilancia'
                                    : 'Offri'}
                              </Button>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    </Fragment>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      {/* ── Giocatori disponibili (prima offerta) ──────────────────── */}
      <Box>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Giocatori disponibili — {getRuoloEsteso(ruolo, true)}
        </Typography>

        <Box sx={{ mb: 1 }}>
          <FormControlLabel
            control={
              <Switch
                color="warning"
                onChange={() => setRuolo('P')}
                checked={ruolo === 'P'}
              />
            }
            label={isXs ? 'P' : getRuoloEsteso('P', true)}
          />
          <FormControlLabel
            control={
              <Switch
                color="warning"
                onChange={() => setRuolo('D')}
                checked={ruolo === 'D'}
              />
            }
            label={isXs ? 'D' : getRuoloEsteso('D', true)}
          />
          <FormControlLabel
            control={
              <Switch
                color="warning"
                onChange={() => setRuolo('C')}
                checked={ruolo === 'C'}
              />
            }
            label={isXs ? 'C' : getRuoloEsteso('C', true)}
          />
          <FormControlLabel
            control={
              <Switch
                color="warning"
                onChange={() => setRuolo('A')}
                checked={ruolo === 'A'}
              />
            }
            label={isXs ? 'A' : getRuoloEsteso('A', true)}
          />
        </Box>

        {loadingGiocatori ? (
          <Stack spacing={1}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={56} />
            ))}
          </Stack>
        ) : errorGiocatori ? (
          <Alert severity="error">
            Errore nel caricamento dei giocatori. Riprova tra qualche secondo.
          </Alert>
        ) : !giocatoriSenzaAsta.length ? (
          <Alert severity="info">
            Nessun giocatore disponibile in questo ruolo
          </Alert>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table
              size="small"
              sx={{ tableLayout: { xs: 'fixed', md: 'auto' } }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: { xs: '35%', md: 'auto' } }}>
                    Nome
                  </TableCell>
                  <TableCell sx={{ width: { xs: '55%', md: 200 } }}>
                    Offerta max. ({lv})
                  </TableCell>
                  <TableCell
                    sx={{ display: { xs: 'none', md: 'table-cell' }, p: 0 }}
                  />
                </TableRow>
              </TableHead>
              <TableBody>
                {giocatoriSenzaAsta.map((g) => (
                  <TableRow key={g.idGiocatore}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        {g.maglia ? (
                          <img
                            src={g.maglia}
                            width={24}
                            height={21}
                            alt={g.nomeSquadraSerieA ?? ''}
                            title={g.nomeSquadraSerieA ?? ''}
                            style={{ objectFit: 'contain' }}
                          />
                        ) : (
                          <Box sx={{ width: 24, height: 21 }} />
                        )}
                        <Stack spacing={0} overflow="hidden">
                          <Typography variant="body2" fontWeight={700} noWrap>
                            {g.nome ?? `#${g.idGiocatore}`}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                          >
                            {g.nomeSquadraSerieA ?? '—'}
                          </Typography>
                        </Stack>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ width: { xs: '55%', md: 200 } }}>
                      <Stack
                        direction="row"
                        alignItems="flex-start"
                        spacing={0.5}
                      >
                        <TextField
                          sx={{ width: 90 }}
                          size="small"
                          type="number"
                          placeholder="1"
                          fullWidth
                          value={prezzi[g.idGiocatore] ?? ''}
                          onChange={(e) =>
                            setPrezzi((prev) => ({
                              ...prev,
                              [g.idGiocatore]: e.target.value,
                            }))
                          }
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                {lv}
                              </InputAdornment>
                            ),
                          }}
                          error={!!erroriProposta[g.idGiocatore]}
                          helperText={erroriProposta[g.idGiocatore]}
                          inputProps={{ min: 1, step: 1 }}
                        />
                        <Box
                          sx={{
                            display: { xs: 'flex', md: 'none' },
                            flexShrink: 0,
                            alignItems: 'center',
                            pt: '2px',
                          }}
                        >
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleOfferta(g.idGiocatore)}
                            disabled={createProposta.isPending}
                            aria-label={`Offri per ${g.nome ?? `#${g.idGiocatore}`}`}
                          >
                            Offri
                          </Button>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell
                      sx={{ display: { xs: 'none', md: 'table-cell' } }}
                    >
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => handleOfferta(g.idGiocatore)}
                        disabled={createProposta.isPending}
                      >
                        Offri
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Stack>
  )
}
