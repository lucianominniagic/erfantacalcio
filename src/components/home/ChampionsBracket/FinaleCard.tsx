'use client'

import React from 'react'
import { Avatar, Box, Divider, Paper, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { GiornataType } from './types'
import { formatDateFromIso } from '~/utils/dateUtils'

interface FinaleCardProps {
  finaleGiornata: GiornataType
  championsColor: string
}

function FinaleCard({ finaleGiornata, championsColor }: FinaleCardProps) {
  const partita = finaleGiornata.partite[0]
  const isGiocata = finaleGiornata.isGiocata
  const dateLabel = formatDateFromIso(finaleGiornata.data, 'DD/MM, HH:mm')

  if (!partita) return null

  const href = isGiocata
    ? `/tabellini?idPartita=${partita.idPartita}&idCalendario=${finaleGiornata.idCalendario}`
    : `/formazioni?idPartita=${partita.idPartita}&idCalendario=${finaleGiornata.idCalendario}`

  const homeWins =
    isGiocata &&
    partita.golHome !== null &&
    partita.golAway !== null &&
    partita.golHome > partita.golAway

  const awayWins =
    isGiocata &&
    partita.golHome !== null &&
    partita.golAway !== null &&
    partita.golAway > partita.golHome

  const teamRow = (
    nome: string | null | undefined,
    foto: string | null | undefined,
    gol: number | null | undefined,
    isWinner: boolean,
  ) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, py: 0.3 }}>
      <Avatar
        src={foto ?? ''}
        alt={nome ?? ''}
        variant="rounded"
        sx={{ width: 22, height: 22, flexShrink: 0 }}
      />
      <Typography
        sx={{
          flex: 1,
          fontSize: '0.72rem',
          fontWeight: isWinner ? 700 : 400,
          color: isWinner ? 'success.main' : 'text.primary',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
        }}
      >
        {nome ?? '—'}
      </Typography>
      {isGiocata && (
        <Typography
          sx={{
            fontSize: '0.8rem',
            fontWeight: 700,
            flexShrink: 0,
            minWidth: '1rem',
            textAlign: 'right',
            color: isWinner ? 'success.main' : 'text.primary',
          }}
        >
          {gol ?? '–'}
        </Typography>
      )}
    </Box>
  )

  return (
    <Box component="a" href={href} sx={{ textDecoration: 'none', display: 'block' }}>
      <Paper
        elevation={3}
        sx={{
          p: 1,
          borderRadius: 1.5,
          border: `1px solid ${alpha(championsColor, 0.35)}`,
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          '&:hover': {
            bgcolor: alpha(championsColor, 0.07),
            borderColor: alpha(championsColor, 0.55),
          },
        }}
      >
        {/* Date header */}
        {dateLabel && (
          <Typography
            sx={{
              fontSize: '0.62rem',
              fontWeight: 600,
              color: championsColor,
              textAlign: 'center',
              mb: 0.5,
              letterSpacing: '0.04em',
            }}
          >
            {dateLabel}
          </Typography>
        )}

        {teamRow(partita.squadraHome, partita.fotoHome, partita.golHome, homeWins)}
        <Divider sx={{ my: 0.2 }} />
        {teamRow(partita.squadraAway, partita.fotoAway, partita.golAway, awayWins)}
      </Paper>
    </Box>
  )
}

export default FinaleCard
