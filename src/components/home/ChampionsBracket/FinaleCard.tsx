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
import { EmojiEvents } from '@mui/icons-material'
import { alpha } from '@mui/material/styles'
import { GiornataType } from './types'
import { formatDateFromIso } from '~/utils/dateUtils'

interface FinaleCardProps {
  finaleGiornata: GiornataType | null
  championsColor: string
}

export default function FinaleCard({
  finaleGiornata,
  championsColor,
}: FinaleCardProps) {
  const partita = finaleGiornata?.partite[0]
  const assegnata = partita?.idHome != null && partita?.idAway != null
  const isGiocata = finaleGiornata?.isGiocata ?? false
  const golHome = partita?.golHome ?? null
  const golAway = partita?.golAway ?? null
  const conclusa = isGiocata && golHome !== null && golAway !== null
  const href =
    assegnata && finaleGiornata
      ? `/${isGiocata ? 'tabellini' : 'formazioni'}?idPartita=${partita.idPartita}&idCalendario=${finaleGiornata.idCalendario}`
      : undefined
  const dateLabel = formatDateFromIso(finaleGiornata?.data, 'DD/MM, HH:mm')
  const homeWins = conclusa && golHome > golAway
  const awayWins = conclusa && golAway > golHome

  function teamRow(
    nome: string,
    foto: string | null | undefined,
    gol: number | null | undefined,
    winner: boolean,
  ) {
    return (
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ minHeight: 44 }}
      >
        <Avatar
          src={foto ?? ''}
          alt=""
          variant="rounded"
          sx={{ width: 24, height: 24 }}
        />
        <Typography
          variant="body2"
          sx={{
            flex: 1,
            minWidth: 0,
            overflowWrap: 'anywhere',
            fontWeight: 700,
            color: winner ? 'success.main' : 'text.primary',
          }}
        >
          {nome}
        </Typography>
        {isGiocata && (
          <Typography
            variant="body2"
            fontWeight={800}
            color={winner ? 'success.main' : 'text.primary'}
          >
            {gol ?? '—'}
          </Typography>
        )}
      </Stack>
    )
  }

  return (
    <Box
      component={href ? 'a' : 'div'}
      href={href}
      aria-label={
        href ? `Finale: ${isGiocata ? 'tabellino' : 'formazioni'}` : undefined
      }
      sx={{
        textDecoration: 'none',
        minWidth: 0,
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'champions.main',
        },
      }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderColor: championsColor,
          '&:hover': href
            ? { bgcolor: alpha(championsColor, 0.07) }
            : undefined,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <EmojiEvents sx={{ color: championsColor }} />
          <Typography variant="subtitle2" component="h3">
            Finale · gara unica
          </Typography>
        </Stack>
        <Chip
          size="small"
          variant="outlined"
          color={conclusa ? 'success' : 'default'}
          label={
            conclusa
              ? 'Conclusa'
              : !assegnata
                ? 'Finaliste da determinare'
                : isGiocata
                  ? 'Risultato in aggiornamento'
                  : 'Da giocare'
          }
          sx={{ mb: 2 }}
        />
        <Stack spacing={1.5} divider={<Divider />}>
          {teamRow(
            partita?.squadraHome ?? 'Vincente semifinale 1',
            partita?.fotoHome,
            partita?.golHome,
            homeWins,
          )}
          {teamRow(
            partita?.squadraAway ?? 'Vincente semifinale 2',
            partita?.fotoAway,
            partita?.golAway,
            awayWins,
          )}
        </Stack>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 2, display: 'block' }}
        >
          {dateLabel || 'Data da definire'}
          {!isGiocata ? ' · nessun risultato disponibile' : ''}
        </Typography>
      </Paper>
    </Box>
  )
}
