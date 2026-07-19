'use client'
import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  Stack,
  Typography,
} from '@mui/material'
import { useMutation } from '@tanstack/react-query'
import { orpc } from '~/utils/orpc'
import PageHeader from '~/components/PageHeader'
import LoadingSpinner from '~/components/LinearProgressBar/LoadingSpinner'
import Schedule from '@mui/icons-material/Schedule'
import Email from '@mui/icons-material/Email'
import SportsSoccer from '@mui/icons-material/SportsSoccer'

// ─── Tipi locali per i risultati ─────────────────────────────────────────────

interface ReminderResult {
  inviate: number
  destinatari: string[]
}

interface ProbabiliResult {
  status: 'ok' | 'skipped' | 'error'
  reason?: string
  giornataSerieA?: number
  matchImportati?: number
  giocatoriImportati?: number
  giocatoriAssociati?: number
  giocatoriNonAssociati?: number
  fetchedAt?: string
}

// ─── Helper di formattazione italiano ────────────────────────────────────────

function formatReminderResult(data: ReminderResult): string {
  if (data.inviate === 0) {
    return 'Nessuna email inviata: nessuna partita in programma oggi.'
  }
  const dest =
    data.destinatari.length > 0 ? ` (${data.destinatari.join(', ')})` : ''
  return `Email inviate: ${data.inviate}${dest}.`
}

function formatProbabiliResult(data: ProbabiliResult): string {
  if (data.status === 'skipped') {
    return `Importazione saltata: ${data.reason ?? 'fuori dalla finestra temporale prevista'}.`
  }
  const righe: string[] = []
  if (data.giornataSerieA !== undefined)
    righe.push(`Giornata Serie A: ${data.giornataSerieA}`)
  if (data.matchImportati !== undefined)
    righe.push(`Match importati: ${data.matchImportati}`)
  if (data.giocatoriImportati !== undefined)
    righe.push(`Giocatori importati: ${data.giocatoriImportati}`)
  if (data.giocatoriAssociati !== undefined)
    righe.push(`Associati: ${data.giocatoriAssociati}`)
  if (data.giocatoriNonAssociati !== undefined)
    righe.push(`Non associati: ${data.giocatoriNonAssociati}`)
  return righe.join(' · ')
}

// ─── Pagina ───────────────────────────────────────────────────────────────────

export default function JobsPage() {
  // ── Reminder formazioni ───────────────────────────────────────────────────
  const [reminderResult, setReminderResult] = useState<ReminderResult | null>(
    null,
  )
  const [reminderError, setReminderError] = useState<string | null>(null)

  const reminderMutation = useMutation(
    orpc.jobs.runFormazioneReminder.mutationOptions(),
  )

  const handleReminderClick = async () => {
    setReminderResult(null)
    setReminderError(null)
    try {
      const result = await reminderMutation.mutateAsync(undefined)
      setReminderResult(result)
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Errore durante l\'esecuzione.'
      setReminderError(msg)
    }
  }

  // ── Probabili formazioni ──────────────────────────────────────────────────
  const [probabiliResult, setProbabiliResult] =
    useState<ProbabiliResult | null>(null)
  const [probabiliError, setProbabiliError] = useState<string | null>(null)
  const [bypassFinestraTemporale, setBypassFinestraTemporale] = useState(false)

  const probabiliMutation = useMutation(
    orpc.jobs.runProbabiliFormazioni.mutationOptions(),
  )

  const handleProbabiliClick = async () => {
    setProbabiliResult(null)
    setProbabiliError(null)
    try {
      const result = await probabiliMutation.mutateAsync({
        bypassFinestraTemporale,
      })
      setProbabiliResult(result)
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Errore durante l\'esecuzione.'
      setProbabiliError(msg)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ width: '100%' }}>
      <PageHeader
        title="Job pianificati"
        subtitle="Esegui manualmente i job cron dell'applicazione"
        Icon={Schedule}
      />

      <Grid container spacing={3}>
        {/* ── Card 1: Promemoria formazioni ─────────────────────────────── */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Email color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Promemoria formazioni
                  </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Invia le email di promemoria alle squadre che hanno partite in
                  programma oggi secondo il calendario di Serie A. Il job
                  ricerca le giornate odierne e notifica i presidenti coinvolti.
                </Typography>

                <Box>
                  <Button
                    variant="contained"
                    startIcon={<Email />}
                    onClick={() => { void handleReminderClick() }}
                    disabled={reminderMutation.isPending}
                  >
                    Esegui promemoria
                  </Button>
                </Box>

                {reminderMutation.isPending && <LoadingSpinner />}

                {reminderResult && !reminderMutation.isPending && (
                  <Alert severity="success">
                    {formatReminderResult(reminderResult)}
                  </Alert>
                )}

                {reminderError && !reminderMutation.isPending && (
                  <Alert severity="error">{reminderError}</Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* ── Card 2: Probabili formazioni ──────────────────────────────── */}
        <Grid item xs={12} md={6}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <SportsSoccer color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Probabili formazioni
                  </Typography>
                </Stack>

                <Typography variant="body2" color="text.secondary">
                  Importa le probabili formazioni di Serie A dalla fonte
                  configurata. Il job si esegue efficacemente solo nella
                  finestra temporale prevista (48 h prima del calcio d&apos;inizio);
                  fuori finestra restituisce uno stato <em>saltato</em>.
                </Typography>

                <Stack spacing={1}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={bypassFinestraTemporale}
                        onChange={(event) =>
                          setBypassFinestraTemporale(event.target.checked)
                        }
                        disabled={probabiliMutation.isPending}
                      />
                    }
                    label="Ignora la finestra temporale"
                  />

                  <Button
                    variant="contained"
                    startIcon={<SportsSoccer />}
                    onClick={() => { void handleProbabiliClick() }}
                    disabled={probabiliMutation.isPending}
                  >
                    Importa probabili formazioni
                  </Button>
                </Stack>

                {probabiliMutation.isPending && <LoadingSpinner />}

                {probabiliResult && !probabiliMutation.isPending && (
                  <Alert
                    severity={
                      probabiliResult.status === 'skipped' ? 'info' : 'success'
                    }
                  >
                    {formatProbabiliResult(probabiliResult)}
                  </Alert>
                )}

                {probabiliError && !probabiliMutation.isPending && (
                  <Alert severity="error">{probabiliError}</Alert>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
