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
import { api } from '~/utils/api'
import LoadingSpinner from '~/components/LinearProgressBar/LoadingSpinner'
import PageHeader from '~/components/PageHeader'

// ── Sub-component: proposte per una sessione chiusa ──────────────────────────
function ProposteSessione({ idSessione }: { idSessione: number }) {
  const { data, isLoading, isError } = api.mercato.getProposteSessione.useQuery(
    { idSessione },
    { refetchOnWindowFocus: false, refetchOnReconnect: false },
  )

  if (isLoading) return <LoadingSpinner />
  if (isError)
    return (
      <Alert severity="error" sx={{ mt: 1 }}>
        Errore nel caricamento delle proposte
      </Alert>
    )
  if (!data?.length)
    return (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
        Nessuna proposta ricevuta
      </Typography>
    )

  return (
    <TableContainer component={Paper} variant="outlined" sx={{ mt: 1 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Giocatore</TableCell>
            <TableCell>ID Squadra</TableCell>
            <TableCell align="right">Prezzo offerto</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((p) => (
            <TableRow key={p.id}>
              <TableCell>{p.Giocatore.nome}</TableCell>
              <TableCell>{p.Utente.presidente}</TableCell>
              <TableCell align="right">{p.prezzoOfferto}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

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
  const [tipoValuta, setTipoValuta] = useState<'fantamilioni' | 'euro'>(
    'fantamilioni',
  )
  const [formError, setFormError] = useState('')
  const [formSuccess, setFormSuccess] = useState('')

  // ── State espansione proposte ──
  const [espansi, setEspansi] = useState<Set<number>>(new Set())

  // ── Queries & Mutations ──
  const { data: sessioni, isLoading, refetch } = api.mercato.listSessioni.useQuery(
    undefined,
    { refetchOnWindowFocus: false, refetchOnReconnect: false },
  )

  const createSessione = api.mercato.createSessione.useMutation({
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
    createSessione.mutate({
      dataApertura: new Date(dataApertura),
      dataChiusura: new Date(dataChiusura),
      maxProposte,
      tipoValuta,
    })
  }

  const toggleEspandi = (id: number) => {
    setEspansi((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
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
                disabled={createSessione.isPending}
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
                        Max proposte: {s.maxProposte} &nbsp;·&nbsp;{' '}
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
                          {espansi.has(s.id) ? 'Nascondi' : 'Vedi proposte'}
                        </Button>
                      )}
                    </Stack>
                  </Stack>

                  {s.stato === 'chiusa' && (
                    <Collapse in={espansi.has(s.id)}>
                      <ProposteSessione idSessione={s.id} />
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
