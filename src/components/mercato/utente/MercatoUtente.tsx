'use client'
import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  IconButton,
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
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { ArrowDownward, ArrowUpward, Gavel } from '@mui/icons-material'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '~/utils/orpc'
import PageHeader from '~/components/PageHeader'
import { type Ruoli } from '~/types/common'
import { getRuoloEsteso } from '~/utils/formazione'
import { Configurazione } from '~/config'
import { formatDateFromIso } from '~/utils/dateUtils'
import EsitoAggiudicazione from '~/components/mercato/shared/EsitoAggiudicazione'

// ── Helper ───────────────────────────────────────────────────────────────────
function fmtDate(d: Date | string) {
  return new Date(d).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MercatoUtente() {
  const queryClient = useQueryClient()
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))
  const [ruolo, setRuolo] = useState<Ruoli>('C')

  // ── Queries ──
  const { data: sessione, isLoading: loadingSessione } =
    useQuery(orpc.mercato.getSessioneAttiva.queryOptions({
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }))

  const { data: giocatori, isLoading: loadingGiocatori } =
    useQuery(orpc.mercato.getGiocatoriSvincolati.queryOptions({
      input: { ruolo: ruolo, stagione: Configurazione.stagione },
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled: !!sessione,
    }))

  const { data: mieProposte, isLoading: loadingMieProposte } =
    useQuery(orpc.mercato.getMieProposte.queryOptions({
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      enabled: !!sessione,
    }))

  const { data: esitoUltima, isLoading: loadingEsitoUltima } =
    useQuery(orpc.mercato.getEsitoUltimaSessioneChiusa.queryOptions({
      input: {},
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }))

  // ── Prezzi per giocatore (form state) ──
  const [prezzi, setPrezzi] = useState<Record<number, string>>({})
  const [erroriProposta, setErroriProposta] = useState<Record<number, string>>(
    {},
  )

  // ── Snackbar ──
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  })

  // ── Mutations ──
  const createProposta = useMutation({
    ...orpc.mercato.createProposta.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orpc.mercato.getMieProposte.queryKey() })
      void queryClient.invalidateQueries({ queryKey: orpc.mercato.getSessioneAttiva.queryKey() })
      void queryClient.invalidateQueries({ queryKey: orpc.mercato.getGiocatoriSvincolati.queryKey({ input: { ruolo, stagione: Configurazione.stagione } }) })
      setSnackbar({ open: true, message: 'Proposta inviata con successo', severity: 'success' })
    },
  })

  const deleteProposta = useMutation({
    ...orpc.mercato.deleteProposta.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orpc.mercato.getMieProposte.queryKey() })
      void queryClient.invalidateQueries({ queryKey: orpc.mercato.getSessioneAttiva.queryKey() })
    },
  })

  const riordinaProposte = useMutation({
    ...orpc.mercato.riordinaProposte.mutationOptions(),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: orpc.mercato.getMieProposte.queryKey() })
    },
    onError: (err) => {
      setSnackbar({ open: true, message: err.message, severity: 'error' })
    },
  })

  // Sposta una proposta di una posizione in su o in giù nella lista priorità.
  const handleSposta = (idProposta: number, direzione: 'su' | 'giu') => {
    if (!mieProposte || mieProposte.length < 2) return
    const ordinate = [...mieProposte].sort((a, b) => a.priorita - b.priorita)
    const idx = ordinate.findIndex((p) => p.id === idProposta)
    if (idx === -1) return
    const target = direzione === 'su' ? idx - 1 : idx + 1
    if (target < 0 || target >= ordinate.length) return
    const swapped = [...ordinate]
    const tmp = swapped[idx]
    swapped[idx] = swapped[target]!
    swapped[target] = tmp!
    riordinaProposte.mutate({ ordineIdProposte: swapped.map((p) => p.id) })
  }

  // ── Handlers ──
  const handleProponi = (idGiocatore: number) => {
    const prezzo = parseFloat(prezzi[idGiocatore] ?? '0')
    if (!prezzo || prezzo <= 0) {
      setErroriProposta((prev) => ({
        ...prev,
        [idGiocatore]: 'Inserisci un prezzo valido',
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

  // ── Label valuta ──
  const labelValuta = sessione?.tipoValuta === 'euro' ? '€' : 'FM'

  // ── Map giocatori per id (per lookup nelle proposte) ──
  const giocatoriMap = new Map(
    (giocatori ?? []).map((g) => [g.idGiocatore, g]),
  )

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Stack spacing={3}>
      <PageHeader title="Mercato Svincolati" Icon={Gavel} />

      {/* ── Banner sessione ── */}
      {loadingSessione ? (
        <Skeleton variant="rounded" height={80} />
      ) : !sessione ? (
        <Alert severity="info">
          Nessuna sessione di mercato aperta al momento
        </Alert>
      ) : (
        <Alert severity="success" variant="outlined">
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Sessione attiva
          </Typography>
          <Typography variant="body2">
            Scadenza: <strong>{fmtDate(sessione.dataChiusura)}</strong>
          </Typography>
          <Typography variant="body2">
            Proposte rimanenti:{' '}
            <strong>
              {sessione.maxProposte - sessione.myCount} /{' '}
              {sessione.maxProposte}
            </strong>
          </Typography>
          <Typography variant="body2">
            Acquisti effettivi (cap per squadra):{' '}
            <strong>{sessione.acquistiEffettivi}</strong>
          </Typography>
          <Typography variant="body2">
            Valuta:{' '}
            <strong>
              {sessione.tipoValuta === 'fantamilioni'
                ? 'Fantamilioni'
                : 'Euro reali'}
            </strong>
          </Typography>
        </Alert>
      )}

      {/* ── Contenuto visibile solo con sessione attiva ── */}
      {sessione && (
        <>
        {/* ── Le mie proposte ── */}
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Le mie proposte
            </Typography>
            {loadingMieProposte ? (
              <Stack spacing={1}>
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={48} />
                ))}
              </Stack>
            ) : !mieProposte?.length ? (
              <Alert severity="info">
                Non hai ancora inserito proposte per questa sessione
              </Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ width: 70 }}>Priorità</TableCell>
                      <TableCell sx={{ width: 90 }}>Riordina</TableCell>
                      <TableCell>Giocatore</TableCell>
                      <TableCell align="right">Offerta</TableCell>
                      <TableCell align="right">Data/Ora</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...mieProposte]
                      .sort((a, b) => a.priorita - b.priorita)
                      .map((p, idx, arr) => {
                        const isFirst = idx === 0
                        const isLast = idx === arr.length - 1
                        return (
                          <TableRow key={p.id}>
                            <TableCell>
                              <Chip
                                size="small"
                                color="primary"
                                label={p.priorita}
                              />
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" spacing={0.5}>
                                <IconButton
                                  size="small"
                                  onClick={() => handleSposta(p.id, 'su')}
                                  disabled={isFirst || riordinaProposte.isPending}
                                  aria-label="Sposta su"
                                >
                                  <ArrowUpward fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={() => handleSposta(p.id, 'giu')}
                                  disabled={isLast || riordinaProposte.isPending}
                                  aria-label="Sposta giù"
                                >
                                  <ArrowDownward fontSize="small" />
                                </IconButton>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              {p.Giocatore?.nome ?? `#${p.idGiocatore}`}
                            </TableCell>
                            <TableCell align="right">
                              {p.prezzoOfferto} {labelValuta}
                            </TableCell>
                            <TableCell align="right">
                              {formatDateFromIso(String(p.createdAt), 'DD/MM/YYYY')} alle {formatDateFromIso(String(p.createdAt), 'HH:mm')}
                            </TableCell>
                            <TableCell>
                              <Button
                                size="small"
                                color="error"
                                variant="outlined"
                                onClick={() =>
                                  deleteProposta.mutate({ idProposta: p.id })
                                }
                                disabled={deleteProposta.isPending}
                              >
                                Elimina
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>

          <Divider />

          {/* ── Contatore proposte per squadra ── */}
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Proposte per squadra
            </Typography>
            {!sessione.countPerSquadra ||
            Object.keys(sessione.countPerSquadra).length === 0 ? (
              <Typography color="text.secondary" variant="body2">
                Nessuna proposta ancora inserita
              </Typography>
            ) : (
              <Stack direction="row" flexWrap="wrap" gap={1}>
                {Object.entries(sessione.countPerSquadra).map(
                  ([idSquadra, count]) => (
                    <Chip
                      key={idSquadra}
                      label={`Squadra ${idSquadra}: ${count} ${count === 1 ? 'proposta' : 'proposte'}`}
                      variant="outlined"
                      size="small"
                    />
                  ),
                )}
              </Stack>
            )}
          </Box>

          <Divider />

          {/* ── Lista giocatori svincolati ── */}
          <Box>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Giocatori svincolati — {getRuoloEsteso(ruolo, true)}
            </Typography>
            <Box sx={{ mb: 1 }}>
              <FormControlLabel
                control={<Switch color="warning" onChange={() => setRuolo('P')} checked={ruolo === 'P'} />}
                label={isXs ? 'P' : getRuoloEsteso('P', true)}
              />
              <FormControlLabel
                control={<Switch color="warning" onChange={() => setRuolo('D')} checked={ruolo === 'D'} />}
                label={isXs ? 'D' : getRuoloEsteso('D', true)}
              />
              <FormControlLabel
                control={<Switch color="warning" onChange={() => setRuolo('C')} checked={ruolo === 'C'} />}
                label={isXs ? 'C' : getRuoloEsteso('C', true)}
              />
              <FormControlLabel
                control={<Switch color="warning" onChange={() => setRuolo('A')} checked={ruolo === 'A'} />}
                label={isXs ? 'A' : getRuoloEsteso('A', true)}
              />
            </Box>
            {loadingGiocatori ? (
              <Stack spacing={1}>
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} variant="rounded" height={56} />
                ))}
              </Stack>
            ) : !giocatori?.length ? (
              <Alert severity="info">
                Nessun giocatore svincolato disponibile
              </Alert>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Offerta ({labelValuta})</TableCell>
                      <TableCell />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(giocatori ?? []).map((g) => (
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
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {g.nomeSquadraSerieA ?? '—'}
                              </Typography>
                            </Stack>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ width: 160 }}>
                          <TextField
                            size="small"
                            type="number"
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
                                  {labelValuta}
                                </InputAdornment>
                              ),
                            }}
                            error={!!erroriProposta[g.idGiocatore]}
                            helperText={erroriProposta[g.idGiocatore]}
                            inputProps={{ min: 0, step: 0.5 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="contained"
                            onClick={() => handleProponi(g.idGiocatore)}
                            disabled={createProposta.isPending}
                          >
                            Proponi
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        </>
      )}

      {/* ── Riepilogo esito ultima sessione chiusa (sempre visibile) ── */}
      {loadingEsitoUltima ? (
        <Skeleton variant="rounded" height={200} />
      ) : esitoUltima ? (
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Esito ultima sessione chiusa
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Chiusa il {fmtDate(esitoUltima.dataChiusura)}
          </Typography>
          <EsitoAggiudicazione data={esitoUltima} />
        </Box>
      ) : null}

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
