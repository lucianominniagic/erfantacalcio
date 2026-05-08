'use client'

import React from 'react'
import { Avatar, Box, Divider, Paper, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { SCORE_COL_W, PartitaType } from './types'
import ScoreCell from './ScoreCell'
import LegLabel from './LegLabel'

export interface SFCardProps {
  andataPartita: PartitaType
  ritornoPartita: PartitaType | undefined
  andataIsGiocata: boolean
  ritornoIsGiocata: boolean
  andataIdCalendario: number
  ritornoIdCalendario: number | undefined
  /** Aggregate goals for Team A (home in andata) */
  golA: number
  /** Aggregate goals for Team B (away in andata) */
  golB: number
  /** Team A's goals in the 2nd leg (resolved by ID, not by home/away assumption) */
  aGol2P: number | null
  /** Team B's goals in the 2nd leg (resolved by ID, not by home/away assumption) */
  bGol2P: number | null
  aWins: boolean
  bWins: boolean
  /** Show the ► winner arrow column (desktop only) */
  showArrow: boolean
  championsColor: string
}

function SFCard({
  andataPartita,
  ritornoPartita,
  andataIsGiocata,
  ritornoIsGiocata,
  andataIdCalendario,
  ritornoIdCalendario,
  golA,
  golB,
  aGol2P,
  bGol2P,
  aWins,
  bWins,
  showArrow,
  championsColor,
}: SFCardProps) {
  const andataHref = andataIsGiocata
    ? `/tabellini?idPartita=${andataPartita.idPartita}&idCalendario=${andataIdCalendario}`
    : `/formazioni?idPartita=${andataPartita.idPartita}&idCalendario=${andataIdCalendario}`

  const ritornoHref =
    ritornoPartita && ritornoIdCalendario
      ? ritornoIsGiocata
        ? `/tabellini?idPartita=${ritornoPartita.idPartita}&idCalendario=${ritornoIdCalendario}`
        : `/formazioni?idPartita=${ritornoPartita.idPartita}&idCalendario=${ritornoIdCalendario}`
      : null

  // 1P goals: straightforward from andata
  // 2P goals: passed as props, resolved by team ID in the parent component
  const aGol1P = andataPartita.golHome
  const bGol1P = andataPartita.golAway

  const AVATAR_SZ = 22
  const ARROW_W = 20

  const teamRow = (
    nome: string | null | undefined,
    foto: string | null | undefined,
    gol1P: number | null | undefined,
    gol2P: number | null | undefined,
    isWinner: boolean,
  ) => (
    <Box sx={{ display: 'flex', alignItems: 'center', py: 0.35 }}>
      <Avatar
        src={foto ?? ''}
        alt={nome ?? ''}
        variant="rounded"
        sx={{ width: AVATAR_SZ, height: AVATAR_SZ, flexShrink: 0, mr: 0.5 }}
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

      {/* 1P score */}
      <ScoreCell
        gol={gol1P}
        href={andataHref}
        isWinner={isWinner}
        championsColor={championsColor}
      />

      {/* 2P score */}
      {ritornoHref ? (
        <ScoreCell
          gol={gol2P}
          href={ritornoHref}
          isWinner={isWinner}
          championsColor={championsColor}
        />
      ) : (
        <Box
          sx={{
            width: SCORE_COL_W,
            height: 28,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <Typography sx={{ fontSize: '0.8rem', color: 'text.disabled' }}>–</Typography>
        </Box>
      )}

      {/* Winner arrow (desktop only) */}
      {showArrow && (
        <Box
          sx={{
            width: ARROW_W,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {isWinner && (
            <Typography
              sx={{
                fontSize: '0.65rem',
                color: alpha(championsColor, 0.75),
                lineHeight: 1,
              }}
            >
              ►
            </Typography>
          )}
        </Box>
      )}
    </Box>
  )

  return (
    <Paper
      elevation={2}
      sx={{
        p: 1,
        borderRadius: 1.5,
        border: `1px solid ${alpha(championsColor, 0.2)}`,
      }}
    >
      {/* Header: 1P / 2P labels */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.25 }}>
        {/* Spacer for avatar + name */}
        <Box sx={{ width: AVATAR_SZ + 4, flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0 }} />
        <LegLabel label="1 P" championsColor={championsColor} />
        <LegLabel
          label="2 P"
          championsColor={championsColor}
          disabled={!ritornoPartita}
        />
        {showArrow && <Box sx={{ width: ARROW_W, flexShrink: 0 }} />}
      </Box>

      {/* Team A */}
      {teamRow(
        andataPartita.squadraHome,
        andataPartita.fotoHome,
        aGol1P,
        aGol2P,
        aWins,
      )}

      <Divider sx={{ my: 0.2 }} />

      {/* Team B */}
      {teamRow(
        andataPartita.squadraAway,
        andataPartita.fotoAway,
        bGol1P,
        bGol2P,
        bWins,
      )}

      {/* Complessivo footer — shown only after ritorno is played */}
      {ritornoIsGiocata && (
        <>
          <Divider sx={{ mt: 0.6, mb: 0.3 }} />
          <Typography
            sx={{
              fontSize: '0.62rem',
              color: 'text.secondary',
              textAlign: 'center',
              letterSpacing: '0.02em',
            }}
          >
            {'Complessivo: '}
            <Box
              component="span"
              sx={{ fontWeight: 700, color: aWins ? 'success.main' : 'text.primary' }}
            >
              {golA}
            </Box>
            {' – '}
            <Box
              component="span"
              sx={{ fontWeight: 700, color: bWins ? 'success.main' : 'text.primary' }}
            >
              {golB}
            </Box>
          </Typography>
        </>
      )}
    </Paper>
  )
}

export default SFCard
