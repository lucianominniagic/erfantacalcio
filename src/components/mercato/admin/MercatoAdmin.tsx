'use client'
import { useState } from 'react'
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Collapse,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Alert,
  Paper,
  type SelectChangeEvent,
} from '@mui/material'
import { Storefront } from '@mui/icons-material'
import { useQuery, useMutation } from '@tanstack/react-query'
import { orpc } from '~/utils/orpc'
import LoadingSpinner from '~/components/LinearProgressBar/LoadingSpinner'
import PageHeader from '~/components/PageHeader'

// ── Sub-component: aggiudicazione di una sessione chiusa ────────────────────
function AggiudicazioneSessione({ idSessione }: { idSessione: number }) {
  const { data, isLoading, isError } = useQuery(
    orpc.mercato.aggiudicaSessione.queryOptions({
      input: { idSessione },
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
  )

  if (isLoading) return <LoadingSpinner />
  if (isError)
    return (
      <Alert severity="error" sx={{ mt: 1 }}>
        Errore nel calcolo dell&apos;aggiudicazione
      </Alert>
    )
  if (!data) return null

  const labelValuta = data.tipoValuta === 'euro' ? '€' : 'FM'

  const esitoChip = (esito: 'VINTA' | 'PERSA', motivo: string) => {
    if (esito === 'VINTA')
      return <Chip size="small" color="success" label="VINTA" />
    if (motivo === 'rilasciata_per_cap')
      return (
        <Chip
          size="small"
          color="warning"
          label="PERSA · cap raggiunto"
          title="Vinta in un primo round ma rilasciata per il limite di acquisti effettivi"
        />
      )
    return <Chip size="small" color="default" label="PERSA · superata" />
  }

  return (
    <Box sx={{ mt: 2 }}>
      <Alert severity="info" variant="outlined" sx={{ mb: 2 }}>
        Aggiudicazione calcolata in base a: prezzo più alto vince, parità →
        proposta più vecchia, ogni squadra ottiene al massimo{' '}
        <strong>{data.acquistiEffettivi}</strong> acquisti (cap). Nessuna
        scrittura sui trasferimenti: l&apos;esito è solo informativo.
      </Alert>

      {/* ── Tabella per giocatore ── */}
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Esiti per giocatore
      </Typography>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Giocatore</TableCell>
              <TableCell>Vincitore</TableCell>
              <TableCell align="right">Prezzo</TableCell>
              <TableCell>Offerte ricevute</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.giocatori.map((g) => (
              <TableRow key={g.idGiocatore}>
                <TableCell>{g.nomeGiocatore}</TableCell>
                <TableCell>
                  {g.vincitore ? (
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Chip
                        size="small"
                        color="success"
                        label={g.vincitore.presidente}
                      />
                      <Typography variant="caption" color="text.secondary">
                        prio {g.vincitore.priorita}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Nessuno
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  {g.vincitore
                    ? `${g.vincitore.prezzo} ${labelValuta}`
                    : '—'}
                </TableCell>
                <TableCell>
                  <Stack direction="row" flexWrap="wrap" gap={0.5}>
                    {g.offerte.map((o) => (
                      <Chip
                        key={o.idProposta}
                        size="small"
                        variant="outlined"
                        label={`${o.presidente} ${o.prezzoOfferto}${labelValuta} (p${o.priorita})`}
                        color={
                          o.esito === 'VINTA'
                            ? 'success'
                            : o.motivo === 'rilasciata_per_cap'
                              ? 'warning'
                              : 'default'
                        }
                      />
                    ))}
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* ── Tabella dettaglio per proposta ── */}
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Dettaglio per proposta
      </Typography>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Presidente</TableCell>
              <TableCell>Giocatore</TableCell>
              <TableCell align="right">Priorità</TableCell>
              <TableCell align="right">Prezzo</TableCell>
              <TableCell>Esito</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...data.dettaglio]
              .sort(
                (a, b) =>
                  a.presidente.localeCompare(b.presidente) ||
                  a.priorita - b.priorita,
              )
              .map((d) => (
                <TableRow key={d.idProposta}>
                  <TableCell>{d.presidente}</TableCell>
                  <TableCell>{d.nomeGiocatore}</TableCell>
                  <TableCell align="right">{d.priorita}</TableCell>
                  <TableCell align="right">
                    {d.prezzoOfferto} {labelValuta}
                  </TableCell>
                  <TableCell>{esitoChip(d.esito, d.motivo)}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

// ── Sub-component: proposte per una sessione chiusa ──────────────────────────
// (Deprecato: sostituito da AggiudicazioneSessione, che mostra le proposte
//  insieme all'esito calcolato. Mantenuto per riferimento — non più referenziato.)

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

function StatoBadge({ stato }: { stato: 'futura' | 'attiva' | 'chiusa' }) {
  const map = {
    futura: { color: 'info' as const, label: 'Futura' },
    attiva: { color: 'success' as const, label: 'Attiva' },
    chiusa: { color: 'default' as const, label: 'Chiusa' },
  }
  const { color, label } = map[stato]
  return <Chip size="small" color={color} label={label} />
}

// ── Main component ────────────────────────────────────────────────────────────
export default function MercatoAdmin() {
  // ── State form ──
  const [dataApertura, setDataApertura] = useState('')
  const [dataChiusura, setDataChiusura] = useState('')
  const [maxProposte, setMaxProposte] = useState(3)
  const [acquistiEffettivi, setAcquistiEffettivi] = useState(3)
  const [tipoValuta, setTipoValuta] = useState<'fantamilioni' | 'euro'>(
    'fantamilioni',
  )
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  // ── State espansione proposte ──
  const [espansi, setEspansi] = useState<Set<number>>(new Set())

  // ── Queries & Mutations ──
  const { data: sessioni, isLoading, refetch } = useQuery(
    orpc.mercato.listSessioni.queryOptions({
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
  )

  const createSessione = useMutation({
    ...orpc.mercato.createSessione.mutationOptions(),
    onSuccess: () => {
      setFormSuccess('Sessione creata con successo')
      setFormError('')
      setDataApertura('')
      setDataChiusura('')
      void refetch()
    },
    onError: (err) => {
      setFormError(err.message)
      setFormSuccess('')
    },
  })

  // ── Handlers ──
  const handleCrea = () => {
    setFormError('')
    setFormSuccess('')
    if (!dataApertura || !dataChiusura) {
      setFormError('Compila tutte le date')
      return
    }
    if (acquistiEffettivi > maxProposte) {
      setFormError('Acquisti effettivi deve essere ≤ max proposte')
      return
    }
    createSessione.mutate({
      dataApertura: new Date(dataApertura),
      dataChiusura: new Date(dataChiusura),
      maxProposte,
      acquistiEffettivi,
      tipoValuta,
    })
  }

  const toggleEspandi = (id: number) => {
    setEspansi((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Stack spacing={3}>
      <PageHeader title="Mercato Svincolati" Icon={Storefront} />

      {/* ── Form crea sessione ── */}
      <Card variant="outlined">
        <CardHeader title="Crea nuova sessione" />
        <CardContent>
          <Stack spacing={2}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Data apertura"
                type="datetime-local"
                value={dataApertura}
                onChange={(e) => setDataApertura(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <TextField
                label="Data chiusura"
                type="datetime-local"
                value={dataChiusura}
                onChange={(e) => setDataChiusura(e.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Max proposte"
                type="number"
                value={maxProposte}
                onChange={(e) =>
                  setMaxProposte(Math.max(1, parseInt(e.target.value) || 1))
                }
                inputProps={{ min: 1 }}
                fullWidth
              />
              <TextField
                label="Acquisti effettivi"
                type="number"
                value={acquistiEffettivi}
                onChange={(e) =>
                  setAcquistiEffettivi(
                    Math.max(1, parseInt(e.target.value) || 1),
                  )
                }
                inputProps={{ min: 1, max: maxProposte }}
                helperText={`≤ ${maxProposte}`}
                error={acquistiEffettivi > maxProposte}
                fullWidth
              />
              <Select
                value={tipoValuta}
                onChange={(e: SelectChangeEvent) =>
                  setTipoValuta(e.target.value as 'fantamilioni' | 'euro')
                }
                fullWidth
                displayEmpty
              >
                <MenuItem value="fantamilioni">Fantamilioni</MenuItem>
                <MenuItem value="euro">Euro reali</MenuItem>
              </Select>
            </Stack>

            <Box>
              <Button
                variant="contained"
                onClick={handleCrea}
                disabled={
                  createSessione.isPending ||
                  acquistiEffettivi > maxProposte
                }
              >
                {createSessione.isPending ? 'Creazione…' : 'Crea sessione'}
              </Button>
            </Box>

            {formError && <Alert severity="error">{formError}</Alert>}
            {formSuccess && <Alert severity="success">{formSuccess}</Alert>}
          </Stack>
        </CardContent>
      </Card>

      {/* ── Lista sessioni ── */}
      <Card variant="outlined">
        <CardHeader title="Sessioni di mercato" />
        <CardContent>
          {isLoading ? (
            <LoadingSpinner />
          ) : !sessioni?.length ? (
            <Typography color="text.secondary">
              Nessuna sessione creata
            </Typography>
          ) : (
            <Stack spacing={2}>
              {sessioni.map((s) => (
                <Paper key={s.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={1}
                    alignItems={{ sm: 'center' }}
                    justifyContent="space-between"
                  >
                    <Box>
                      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                        {fmtDate(s.dataApertura)} → {fmtDate(s.dataChiusura)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Max proposte: {s.maxProposte} &nbsp;·&nbsp; Acquisti:{' '}
                        {s.acquistiEffettivi} &nbsp;·&nbsp;{' '}
                        {s.tipoValuta === 'fantamilioni'
                          ? 'Fantamilioni'
                          : 'Euro reali'}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <StatoBadge stato={s.stato} />
                      {s.stato === 'chiusa' && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => toggleEspandi(s.id)}
                        >
                          {espansi.has(s.id) ? 'Nascondi' : 'Aggiudica'}
                        </Button>
                      )}
                    </Stack>
                  </Stack>

                  {s.stato === 'chiusa' && (
                    <Collapse in={espansi.has(s.id)}>
                      <AggiudicazioneSessione idSessione={s.id} />
                    </Collapse>
                  )}
                </Paper>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  )
}
