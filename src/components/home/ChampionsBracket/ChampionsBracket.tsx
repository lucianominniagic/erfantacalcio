'use client'

import React from 'react'
import { Box, Paper, Typography, useTheme } from '@mui/material'
import { EmojiEvents } from '@mui/icons-material'
import { alpha } from '@mui/material/styles'
import { ChampionsBracketProps, PartitaType } from './types'
import SFCard from './SFCard'
import FinaleCard from './FinaleCard'
import BracketConnector from './BracketConnector'
import { findRitorno, resolveRitornoGoals, hasTeams } from './utils'

// ── Column header label ───────────────────────────────────────────────────────

function ColumnHeader({
  label,
  championsColor,
}: {
  label: string
  championsColor: string
}) {
  return (
    <Typography
      sx={{
        fontSize: '0.62rem',
        fontWeight: 700,
        color: championsColor,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        textAlign: 'center',
        mb: 0.75,
      }}
    >
      {label}
    </Typography>
  )
}

// ── Section title ─────────────────────────────────────────────────────────────

function SectionTitle({ championsColor }: { championsColor: string }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <EmojiEvents sx={{ color: championsColor, fontSize: '1.4rem' }} />
      <Typography variant="h5">Champions League - Fase Finale</Typography>
    </Box>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export default function ChampionsBracket({
  semifinaliAndata,
  semifinaliRitorno,
  finale,
}: ChampionsBracketProps) {
  const theme = useTheme()
  const championsColor = theme.palette.champions.main

  // Empty state — bracket not configured or no teams assigned yet
  if (!semifinaliAndata || !hasTeams(semifinaliAndata.partite)) return null

  // ── Partite references ─────────────────────────────────────────────────────
  const sf1Andata = semifinaliAndata.partite[0]
  const sf2Andata = semifinaliAndata.partite[1]
  const sf1Ritorno = findRitorno(sf1Andata, semifinaliRitorno?.partite)
  const sf2Ritorno = findRitorno(sf2Andata, semifinaliRitorno?.partite)

  const andataIsGiocata = semifinaliAndata.isGiocata
  const ritornoIsGiocata = semifinaliRitorno?.isGiocata ?? false

  // ── 2P goals resolved by ID (no home/away swap assumption) ─────────────────
  const { aGol2P: sf1AGol2P, bGol2P: sf1BGol2P } = resolveRitornoGoals(sf1Andata, sf1Ritorno)
  const { aGol2P: sf2CGol2P, bGol2P: sf2DGol2P } = resolveRitornoGoals(sf2Andata, sf2Ritorno)

  // ── Aggregates ─────────────────────────────────────────────────────────────
  const sf1GolA = (sf1Andata?.golHome ?? 0) + (sf1AGol2P ?? 0)
  const sf1GolB = (sf1Andata?.golAway ?? 0) + (sf1BGol2P ?? 0)
  const sf1AWins = ritornoIsGiocata && sf1GolA > sf1GolB
  const sf1BWins = ritornoIsGiocata && sf1GolB > sf1GolA

  const sf2GolC = (sf2Andata?.golHome ?? 0) + (sf2CGol2P ?? 0)
  const sf2GolD = (sf2Andata?.golAway ?? 0) + (sf2DGol2P ?? 0)
  const sf2CWins = ritornoIsGiocata && sf2GolC > sf2GolD
  const sf2DWins = ritornoIsGiocata && sf2GolD > sf2GolC

  // ── Shared SF card renderer ────────────────────────────────────────────────
  const renderSFCards = (showArrow: boolean) => (
    <>
      {sf1Andata && (
        <SFCard
          andataPartita={sf1Andata}
          ritornoPartita={sf1Ritorno}
          andataIsGiocata={andataIsGiocata}
          ritornoIsGiocata={ritornoIsGiocata}
          andataIdCalendario={semifinaliAndata.idCalendario}
          ritornoIdCalendario={semifinaliRitorno?.idCalendario}
          golA={sf1GolA}
          golB={sf1GolB}
          aGol2P={sf1AGol2P}
          bGol2P={sf1BGol2P}
          aWins={sf1AWins}
          bWins={sf1BWins}
          showArrow={showArrow}
          championsColor={championsColor}
        />
      )}
      {sf2Andata && (
        <SFCard
          andataPartita={sf2Andata}
          ritornoPartita={sf2Ritorno}
          andataIsGiocata={andataIsGiocata}
          ritornoIsGiocata={ritornoIsGiocata}
          andataIdCalendario={semifinaliAndata.idCalendario}
          ritornoIdCalendario={semifinaliRitorno?.idCalendario}
          golA={sf2GolC}
          golB={sf2GolD}
          aGol2P={sf2CGol2P}
          bGol2P={sf2DGol2P}
          aWins={sf2CWins}
          bWins={sf2DWins}
          showArrow={showArrow}
          championsColor={championsColor}
        />
      )}
    </>
  )

  // ── Desktop: 2-column bracket layout ──────────────────────────────────────
  return (
    <Box sx={{ mt: 2 }}>
      <SectionTitle championsColor={championsColor} />

      <Box sx={{ display: 'flex', alignItems: 'stretch' }}>
        {/* ── Semifinali column ── */}
        <Box sx={{ flex: 3, minWidth: 0 }}>
          <ColumnHeader label="Semifinali" championsColor={championsColor} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {renderSFCards(true)}
          </Box>
        </Box>

        {/* ── Bracket connector ── */}
        <BracketConnector color={championsColor} />

        {/* ── Finale column — vertically centered ── */}
        <Box
          sx={{
            flex: 2,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <ColumnHeader label="Finale" championsColor={championsColor} />
          <Box
            sx={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {finale ? (
              <Box sx={{ width: '100%' }}>
                <FinaleCard
                  finaleGiornata={finale}
                  championsColor={championsColor}
                />
              </Box>
            ) : (
              <Paper
                elevation={0}
                sx={{
                  p: 1,
                  width: '100%',
                  borderRadius: 1.5,
                  border: `1px dashed ${alpha(championsColor, 0.2)}`,
                  textAlign: 'center',
                }}
              >
                <Typography sx={{ fontSize: '0.65rem', color: 'text.disabled' }}>
                  Da determinare
                </Typography>
              </Paper>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
