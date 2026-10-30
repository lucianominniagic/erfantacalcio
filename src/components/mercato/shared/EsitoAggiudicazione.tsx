'use client'
import { useId, useState } from 'react'
import { ExpandMore, Search } from '@mui/icons-material'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  Divider,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import type { EsitoMotivo } from '~/server/api/mercato/services/aggiudicazione'

export interface EsitoAggiudicazioneData {
  acquistiEffettivi: number
  tipoValuta: 'fantamilioni' | 'euro'
  giocatori: readonly {
    idGiocatore: number
    nomeGiocatore: string
    vincitore: {
      idSquadra: number
      presidente: string
      prezzo: number
      priorita: number
    } | null
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

export default function EsitoAggiudicazione({
  data,
  bannerVariant = 'outlined',
}: Props) {
  const id = useId()
  const [search, setSearch] = useState('')
  const labelValuta = data.tipoValuta === 'euro' ? '€' : 'FM'
  const query = search.trim().toLocaleLowerCase('it-IT')
  const giocatori = data.giocatori.filter((g) =>
    [
      g.nomeGiocatore,
      g.vincitore?.presidente ?? '',
      ...g.offerte.map((o) => o.presidente),
    ].some((value) => value.toLocaleLowerCase('it-IT').includes(query)),
  )
  const dettaglio = [...data.dettaglio]
    .filter((d) =>
      [d.nomeGiocatore, d.presidente].some((value) =>
        value.toLocaleLowerCase('it-IT').includes(query),
      ),
    )
    .sort(
      (a, b) =>
        a.presidente.localeCompare(b.presidente) || a.priorita - b.priorita,
    )
  const assegnati = data.giocatori.filter((g) => g.vincitore !== null).length
  const totale = data.giocatori.reduce(
    (sum, g) => sum + (g.vincitore?.prezzo ?? 0),
    0,
  )

  return (
    <Box sx={{ mt: 2, minWidth: 0, overflowWrap: 'anywhere' }}>
      <Paper
        variant="outlined"
        sx={{ display: { xs: 'block', sm: 'none' }, p: 2, mb: 2 }}
      >
        <Stack
          direction="row"
          justifyContent="space-around"
          divider={<Divider orientation="vertical" flexItem />}
        >
          {[
            [data.giocatori.length, 'Giocatori'],
            [assegnati, 'Assegnati'],
            [
              `${totale.toLocaleString('it-IT')} ${labelValuta}`,
              'Spesa totale',
            ],
          ].map(([value, label]) => (
            <Box
              key={label}
              sx={{ textAlign: 'center', px: 0.5, minWidth: 0, flex: 1 }}
            >
              <Typography variant="h3" color="primary.main">
                {value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {label}
              </Typography>
            </Box>
          ))}
        </Stack>
      </Paper>
      <Box sx={{ display: { xs: 'block', sm: 'none' }, mb: 2 }}>
        <Accordion disableGutters elevation={0}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id={`${id}-regole`}
            aria-controls={`${id}-regole-contenuto`}
          >
            <Typography variant="body2">
              Come vengono assegnati i giocatori?
            </Typography>
          </AccordionSummary>
          <AccordionDetails id={`${id}-regole-contenuto`}>
            <Typography variant="body2">
              Vince il prezzo più alto. A parità, vince la proposta più vecchia.
              Ogni squadra può ottenere al massimo {data.acquistiEffettivi}{' '}
              {data.acquistiEffettivi === 1 ? 'acquisto' : 'acquisti'}. Le
              offerte rilasciate per questo limite sono indicate con &quot;cap
              raggiunto&quot;.
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Box>
      <Alert
        severity="info"
        variant={bannerVariant}
        sx={{ display: { xs: 'none', sm: 'flex' }, mb: 2 }}
      >
        Aggiudicazione calcolata in base a: prezzo più alto vince, parità →
        proposta più vecchia, ogni squadra ottiene al massimo{' '}
        <strong>{data.acquistiEffettivi}</strong> acquisti (cap).
      </Alert>

      <TextField
        fullWidth
        size="small"
        label="Cerca giocatore o presidente"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        sx={{ mb: 2 }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <Search />
            </InputAdornment>
          ),
        }}
      />
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Esiti per giocatore
      </Typography>
      {giocatori.length === 0 && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {query
            ? 'Nessun risultato per questa ricerca.'
            : 'Nessuna offerta ricevuta.'}
        </Alert>
      )}
      <Stack spacing={2} sx={{ display: { xs: 'flex', sm: 'none' }, mb: 3 }}>
        {giocatori.map((g) => (
          <Paper key={g.idGiocatore} component="article" variant="outlined">
            <Box sx={{ p: 2 }}>
              <Typography component="h3" variant="subtitle1" fontWeight={800}>
                {g.nomeGiocatore}
              </Typography>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                gap={1}
                sx={{ mt: 1.5 }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="caption" color="text.secondary">
                    {g.vincitore ? 'Aggiudicato a' : 'Nessuna aggiudicazione'}
                  </Typography>
                  <Typography
                    fontWeight={700}
                    color={g.vincitore ? 'success.main' : 'text.secondary'}
                  >
                    {g.vincitore?.presidente ?? 'Resta svincolato'}
                  </Typography>
                  {g.vincitore && (
                    <Typography variant="caption" color="text.secondary">
                      Priorità {g.vincitore.priorita}
                    </Typography>
                  )}
                </Box>
                {g.vincitore && (
                  <Typography
                    variant="h3"
                    component="p"
                    color="primary.main"
                    sx={{ flexShrink: 0 }}
                  >
                    {g.vincitore.prezzo.toLocaleString('it-IT')} {labelValuta}
                  </Typography>
                )}
              </Stack>
            </Box>
            <Accordion disableGutters elevation={0}>
              <AccordionSummary
                expandIcon={<ExpandMore />}
                id={`${id}-offerte-${g.idGiocatore}`}
                aria-controls={`${id}-offerte-contenuto-${g.idGiocatore}`}
              >
                <Typography variant="body2">
                  Mostra {g.offerte.length}{' '}
                  {g.offerte.length === 1 ? 'offerta' : 'offerte'}
                  <Box
                    component="span"
                    sx={{
                      position: 'absolute',
                      width: '1px',
                      height: '1px',
                      overflow: 'hidden',
                      clipPath: 'inset(50%)',
                    }}
                  >
                    {' '}
                    per {g.nomeGiocatore}
                  </Box>
                </Typography>
              </AccordionSummary>
              <AccordionDetails id={`${id}-offerte-contenuto-${g.idGiocatore}`}>
                <Stack spacing={1.5} divider={<Divider />}>
                  {g.offerte.map((o) => (
                    <Box key={o.idProposta}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        gap={1}
                      >
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          sx={{ minWidth: 0 }}
                        >
                          {o.presidente}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={700}
                          sx={{ flexShrink: 0 }}
                        >
                          {o.prezzoOfferto.toLocaleString('it-IT')}{' '}
                          {labelValuta}
                        </Typography>
                      </Stack>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        flexWrap="wrap"
                        gap={1}
                        sx={{ mt: 0.5 }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          Priorità {o.priorita}
                        </Typography>
                        {esitoChip(o.esito, o.motivo)}
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          </Paper>
        ))}
      </Stack>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ display: { xs: 'none', sm: 'block' }, mb: 3 }}
      >
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
            {giocatori.map((g) => (
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

      <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
        <Accordion disableGutters elevation={0}>
          <AccordionSummary
            expandIcon={<ExpandMore />}
            id={`${id}-dettaglio`}
            aria-controls={`${id}-dettaglio-contenuto`}
          >
            <Typography variant="subtitle2">
              Dettaglio per proposta ({dettaglio.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails id={`${id}-dettaglio-contenuto`}>
            {dettaglio.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                Nessuna proposta da mostrare.
              </Typography>
            ) : (
              <Stack spacing={2} divider={<Divider />}>
                {dettaglio.map((d) => (
                  <Box key={d.idProposta}>
                    <Typography variant="body2" fontWeight={700}>
                      {d.presidente}
                    </Typography>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      gap={1}
                      sx={{ my: 0.5 }}
                    >
                      <Typography variant="body2" sx={{ minWidth: 0 }}>
                        {d.nomeGiocatore}
                      </Typography>
                      <Typography variant="body2" sx={{ flexShrink: 0 }}>
                        {d.prezzoOfferto.toLocaleString('it-IT')} {labelValuta}
                      </Typography>
                    </Stack>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      flexWrap="wrap"
                      gap={1}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Priorità {d.priorita}
                      </Typography>
                      {esitoChip(d.esito, d.motivo)}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            )}
          </AccordionDetails>
        </Accordion>
      </Box>
      <Typography
        variant="subtitle2"
        sx={{ display: { xs: 'none', sm: 'block' }, mb: 1 }}
      >
        Dettaglio per proposta
      </Typography>
      <TableContainer
        component={Paper}
        variant="outlined"
        sx={{ display: { xs: 'none', sm: 'block' } }}
      >
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
            {dettaglio.map((d) => (
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
