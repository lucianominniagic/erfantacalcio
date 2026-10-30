'use client'

import {
  Avatar,
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { SCORE_COL_W, PartitaType } from './types'
import ScoreCell from './ScoreCell'
import LegLabel from './LegLabel'
import { resolveRitornoGoals } from './utils'

export interface SFCardProps {
  numero: number
  andataPartita: PartitaType
  ritornoPartita: PartitaType | undefined
  andataIsGiocata: boolean
  ritornoIsGiocata: boolean
  andataIdCalendario: number
  ritornoIdCalendario: number | undefined
  championsColor: string
}

export default function SFCard({
  numero,
  andataPartita,
  ritornoPartita,
  andataIsGiocata,
  ritornoIsGiocata,
  andataIdCalendario,
  ritornoIdCalendario,
  championsColor,
}: SFCardProps) {
  const andataHref =
    andataPartita.idHome !== null && andataPartita.idAway !== null
      ? `/${andataIsGiocata ? 'tabellini' : 'formazioni'}?idPartita=${andataPartita.idPartita}&idCalendario=${andataIdCalendario}`
      : undefined
  const ritornoHref =
    ritornoPartita &&
    ritornoIdCalendario !== undefined &&
    ritornoPartita.idHome !== null &&
    ritornoPartita.idAway !== null
      ? `/${ritornoIsGiocata ? 'tabellini' : 'formazioni'}?idPartita=${ritornoPartita.idPartita}&idCalendario=${ritornoIdCalendario}`
      : undefined
  const { aGol2P, bGol2P } = resolveRitornoGoals(andataPartita, ritornoPartita)
  const { golHome, golAway } = andataPartita
  const completa =
    andataIsGiocata &&
    ritornoIsGiocata &&
    golHome !== null &&
    golAway !== null &&
    aGol2P !== null &&
    bGol2P !== null
  const golA = completa ? golHome + aGol2P : null
  const golB = completa ? golAway + bGol2P : null
  const aWins = golA !== null && golB !== null && golA > golB
  const bWins = golA !== null && golB !== null && golB > golA
  const vincente = aWins
    ? andataPartita.squadraHome
    : bWins
      ? andataPartita.squadraAway
      : null
  const stato = completa
    ? 'Conclusa'
    : ritornoIsGiocata
      ? 'Risultati in aggiornamento'
      : !andataIsGiocata
        ? 'Da giocare'
        : 'Ritorno da giocare'

  function teamRow(
    nome: string | null | undefined,
    foto: string | null | undefined,
    gol1: number | null,
    gol2: number | null,
    totale: number | null,
    winner: boolean,
  ) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', minHeight: 44 }}>
        <Avatar
          src={foto ?? ''}
          alt=""
          variant="rounded"
          sx={{ width: 24, height: 24, mr: 1, flexShrink: 0 }}
        />
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            minWidth: 0,
            overflowWrap: 'anywhere',
            fontWeight: winner ? 800 : 500,
          }}
        >
          {nome ?? 'Da determinare'}
        </Typography>
        <ScoreCell
          gol={andataIsGiocata ? gol1 : null}
          href={andataHref}
          isWinner={winner}
          championsColor={championsColor}
          label={`${nome ?? 'Squadra da determinare'}, andata: ${andataIsGiocata ? 'tabellino' : 'formazioni'}`}
        />
        <ScoreCell
          gol={ritornoIsGiocata ? gol2 : null}
          href={ritornoHref}
          isWinner={winner}
          championsColor={championsColor}
          label={`${nome ?? 'Squadra da determinare'}, ritorno: ${ritornoIsGiocata ? 'tabellino' : 'formazioni'}`}
        />
        <Typography
          variant="body2"
          sx={{
            width: SCORE_COL_W,
            flexShrink: 0,
            textAlign: 'center',
            fontWeight: 800,
            color: winner ? 'success.main' : 'text.primary',
          }}
        >
          {totale ?? '—'}
        </Typography>
      </Box>
    )
  }

  return (
    <Paper
      component="section"
      aria-label={`Semifinale ${numero}`}
      variant="outlined"
      sx={{ p: 2, minWidth: 0 }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        gap={1}
        sx={{ mb: 2 }}
      >
        <Typography variant="subtitle2" component="h4">
          Semifinale {numero}
        </Typography>
        <Chip
          size="small"
          variant="outlined"
          color={completa ? 'success' : 'warning'}
          label={stato}
        />
      </Stack>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary" sx={{ flex: 1 }}>
          Squadra
        </Typography>
        <LegLabel label="And." fullLabel="Andata" />
        <LegLabel label="Rit." fullLabel="Ritorno" />
        <LegLabel label="Tot." fullLabel="Totale" />
      </Box>
      {teamRow(
        andataPartita.squadraHome,
        andataPartita.fotoHome,
        andataPartita.golHome,
        aGol2P,
        golA,
        aWins,
      )}
      {teamRow(
        andataPartita.squadraAway,
        andataPartita.fotoAway,
        andataPartita.golAway,
        bGol2P,
        golB,
        bWins,
      )}
      <Divider sx={{ my: 1 }} />
      <Typography
        variant="caption"
        color={vincente ? 'success.main' : 'text.secondary'}
      >
        {completa
          ? vincente
            ? `In finale: ${vincente}`
            : 'Parità nel complessivo'
          : ritornoIsGiocata
            ? 'Totale disponibile quando tutti i risultati sono confermati'
            : andataIsGiocata
              ? 'Andata disputata · totale disponibile dopo il ritorno'
              : 'Semifinale da giocare'}
      </Typography>
    </Paper>
  )
}
