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
import EsitoAggiudicazione from '~/components/mercato/shared/EsitoAggiudicazione'

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

  return <EsitoAggiudicazione data={data} />
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
