'use client'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  Paper,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { ExpandMore, Storefront } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '~/utils/orpc'
import PageHeader from '~/components/PageHeader'
import { formatDateFromIso } from '~/utils/dateUtils'

// ── Helper ───────────────────────────────────────────────────────────────────
function fmtDate(d: Date | string | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ── Main component ────────────────────────────────────────────────────────────
export default function SessioniMercato() {
  const { data: sessioni, isLoading, isError } =
    useQuery(orpc.mercato.getSessioniMercato.queryOptions({
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }))

  if (isLoading) {
    return (
      <Stack spacing={2}>
        <PageHeader title="Sessioni di mercato" Icon={Storefront} />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} variant="rounded" height={64} />
        ))}
      </Stack>
    )
  }

  if (isError) {
    return (
      <Stack spacing={2}>
        <PageHeader title="Sessioni di mercato" Icon={Storefront} />
        <Alert severity="error">Errore nel caricamento delle sessioni</Alert>
      </Stack>
    )
  }

  // Separa sessioni attive/future (banner) da quelle chiuse (accordion)
  const banner = sessioni?.find(
    (s) => s.stato === 'attiva' || s.stato === 'futura',
  )
  const chiuse = (sessioni ?? []).filter((s) => s.stato === 'chiusa')

  return (
    <Stack spacing={3}>
      <PageHeader title="Sessioni di mercato" Icon={Storefront} />

      {/* ── Banner sessione attiva/futura ── */}
      {banner ? (
        <Alert
          severity={banner.stato === 'attiva' ? 'success' : 'info'}
          variant="outlined"
          icon={<Storefront />}
        >
          <Stack spacing={0.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Sessione{' '}
                {banner.stato === 'attiva' ? 'in corso' : 'programmata'}
              </Typography>
              <Chip
                size="small"
                color={banner.stato === 'attiva' ? 'success' : 'info'}
                label={banner.stato === 'attiva' ? 'Attiva' : 'Futura'}
              />
            </Stack>
            {'dataApertura' in banner && (
              <Typography variant="body2">
                Apertura: <strong>{fmtDate(banner.dataApertura)}</strong>
              </Typography>
            )}
            {'dataChiusura' in banner && (
              <Typography variant="body2">
                Chiusura: <strong>{fmtDate(banner.dataChiusura)}</strong>
              </Typography>
            )}
            <Typography variant="body2">
              Valuta:{' '}
              <strong>
                {banner.tipoValuta === 'fantamilioni'
                  ? 'Fantamilioni'
                  : 'Euro reali'}
              </strong>
            </Typography>
          </Stack>
        </Alert>
      ) : (
        <Alert severity="info">
          Nessuna sessione di mercato attiva o programmata
        </Alert>
      )}

      {/* ── Sessioni chiuse ── */}
      {chiuse.length > 0 && (
        <Box>
          <Typography variant="h6" sx={{ mb: 1 }}>
            Sessioni chiuse
          </Typography>
          <Stack spacing={1}>
            {chiuse.map((s) => {
              // sessione chiusa ha "proposte", non dataApertura
              const proposte = 'proposte' in s ? s.proposte : []
              return (
                <Accordion key={s.id} variant="outlined" disableGutters>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Stack
                      direction="row"
                      spacing={2}
                      alignItems="center"
                      sx={{ width: '100%', pr: 1 }}
                    >
                      <Typography variant="subtitle2">
                        Sessione #{s.id}
                      </Typography>
                      <Chip size="small" label="Chiusa" color="default" />
                      <Chip
                        size="small"
                        variant="outlined"
                        label={
                          s.tipoValuta === 'fantamilioni'
                            ? 'Fantamilioni'
                            : 'Euro reali'
                        }
                      />
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ ml: 'auto !important' }}
                      >
                        {proposte.length} proposte
                      </Typography>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    {proposte.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        Nessuna proposta per questa sessione
                      </Typography>
                    ) : (
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>ID Giocatore</TableCell>
                              <TableCell>ID Squadra</TableCell>
                              <TableCell align="right">Data/Ora</TableCell>
                              <TableCell align="right">Prezzo</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {proposte.map((p, idx) => (
                              <TableRow key={idx}>
                                <TableCell>{p.Giocatore}</TableCell>
                                <TableCell>{p.Presidente}</TableCell>
                                <TableCell align="right">
                                  {formatDateFromIso(p.createdAt, 'DD/MM/YYYY')} alle {formatDateFromIso(p.createdAt, 'HH:mm')}
                                </TableCell>
                                <TableCell align="right">
                                  {p.prezzoOfferto}{' '}
                                  {s.tipoValuta === 'fantamilioni'
                                    ? 'FM'
                                    : '€'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                  </AccordionDetails>
                </Accordion>
              )
            })}
          </Stack>
        </Box>
      )}

      {!banner && chiuse.length === 0 && (
        <Typography color="text.secondary">
          Nessuna sessione di mercato trovata
        </Typography>
      )}
    </Stack>
  )
}
