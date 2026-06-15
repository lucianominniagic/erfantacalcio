'use client'
import {
  Alert,
  Box,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import type { EsitoMotivo } from '~/server/api/mercato/services/aggiudicazione'

export interface EsitoAggiudicazioneData {
  acquistiEffettivi: number
  tipoValuta: 'fantamilioni' | 'euro'
  giocatori: readonly {
    idGiocatore: number
    nomeGiocatore: string
    vincitore:
      | { idSquadra: number; presidente: string; prezzo: number; priorita: number }
      | null
    offerte: readonly {
      idProposta: number
      presidente: string
      prezzoOfferto: number
      priorita: number
      esito: 'VINTA' | 'PERSA'
      motivo: EsitoMotivo
    }[]
  }[]
  dettaglio: readonly {
    idProposta: number
    presidente: string
    nomeGiocatore: string
    priorita: number
    prezzoOfferto: number
    esito: 'VINTA' | 'PERSA'
    motivo: EsitoMotivo
  }[]
}

function esitoChip(esito: 'VINTA' | 'PERSA', motivo: EsitoMotivo) {
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

interface Props {
  data: EsitoAggiudicazioneData
  bannerVariant?: 'standard' | 'outlined'
}

export default function EsitoAggiudicazione({ data, bannerVariant = 'outlined' }: Props) {
  const labelValuta = data.tipoValuta === 'euro' ? '€' : 'FM'

  return (
    <Box sx={{ mt: 2 }}>
      <Alert severity="info" variant={bannerVariant} sx={{ mb: 2 }}>
        Aggiudicazione calcolata in base a: prezzo più alto vince, parità →
        proposta più vecchia, ogni squadra ottiene al massimo{' '}
        <strong>{data.acquistiEffettivi}</strong> acquisti (cap). Nessuna
        scrittura sui trasferimenti: l&apos;esito è solo informativo.
      </Alert>

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
                        priorità {g.vincitore.priorita}
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant="caption" color="text.secondary">
                      Nessuno
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  {g.vincitore ? `${g.vincitore.prezzo} ${labelValuta}` : '—'}
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
