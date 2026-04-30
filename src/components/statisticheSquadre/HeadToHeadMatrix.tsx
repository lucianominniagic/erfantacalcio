'use client'
import {
  Avatar,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material'
import { useTheme } from '@mui/material/styles'
import { api } from '~/utils/api'

interface HeadToHeadMatrixProps {
  idTornei: number[]
}

export default function HeadToHeadMatrix({ idTornei }: HeadToHeadMatrixProps) {
  const theme = useTheme()
  const h2h = api.statisticheSquadre.headToHead.useQuery(
    { idTornei },
    {
      enabled: idTornei.length > 0,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )

  if (h2h.isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  const squadre = h2h.data?.squadre ?? []
  const matrice = h2h.data?.matrice ?? {}

  if (squadre.length === 0) {
    return (
      <Typography sx={{ pt: 2 }} color="text.secondary">
        Nessun dato disponibile.
      </Typography>
    )
  }

  const cellColor = (v: number, n: number, p: number): string => {
    if (v > p) return 'rgba(45, 223, 51, 0.32)'
    if (p > v) return 'rgba(244, 67, 54, 0.4)'
    if (v + n + p === 0) return 'transparent'
    return 'rgba(255, 193, 7, 0.4)'
  }

  return (
    <Box sx={{ pt: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Bilancio scontri diretti (riga = squadra di casa). Verde =
        bilancio favorevole, giallo = pareggio, rosso = sfavorevole.
      </Typography>
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table size="small" sx={{ minWidth: 'max-content' }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  fontWeight: 700,
                  background: '#393027',
                  color: theme.palette.secondary.main,
                }}
              >
                Squadra
              </TableCell>
              {squadre.map((s) => (
                <TableCell
                  key={s.idSquadra}
                  align="center"
                  sx={{
                    minWidth: 90,
                    background: '#393027',
                  }}
                >
                  <Tooltip title={s.squadra}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5,
                        background: '#393027',
                      }}
                    >
                      {s.foto ? (
                        <Avatar src={s.foto} sx={{ width: 24, height: 24 }} />
                      ) : null}
                      <Typography
                        component="span"
                        sx={{
                          fontSize: '0.7rem',
                          maxWidth: 80,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          background: '#393027',
                          color: theme.palette.text.primary,
                        }}
                      >
                        {s.squadra}
                      </Typography>
                    </Box>
                  </Tooltip>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {squadre.map((rowSquadra) => (
              <TableRow key={rowSquadra.idSquadra} hover>
                <TableCell
                  sx={{
                    position: 'sticky',
                    left: 0,
                    backgroundColor: theme.palette.background.paper,
                    fontWeight: 600,
                    minWidth: 160,
                    zIndex: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {rowSquadra.foto ? (
                      <Avatar src={rowSquadra.foto} sx={{ width: 22, height: 22 }} />
                    ) : null}
                    <Typography sx={{ fontSize: '0.85rem' }}>
                      {rowSquadra.squadra}
                    </Typography>
                  </Box>
                </TableCell>
                {squadre.map((colSquadra) => {
                  if (rowSquadra.idSquadra === colSquadra.idSquadra) {
                    return (
                      <TableCell
                        key={colSquadra.idSquadra}
                        align="center"
                        sx={{
                          backgroundColor: 'rgba(255,255,255,0.04)',
                          color: 'text.disabled',
                        }}
                      >
                        —
                      </TableCell>
                    )
                  }
                  const cell =
                    matrice[rowSquadra.idSquadra]?.[colSquadra.idSquadra]
                  if (!cell || cell.partite === 0) {
                    return (
                      <TableCell
                        key={colSquadra.idSquadra}
                        align="center"
                        sx={{ color: 'text.disabled' }}
                      >
                        —
                      </TableCell>
                    )
                  }
                  const tooltipText = `${rowSquadra.squadra} vs ${colSquadra.squadra}: ${cell.partite} partite — ${cell.v}V ${cell.n}N ${cell.p}P (gol ${cell.golFatti}-${cell.golSubiti})`
                  return (
                    <Tooltip key={colSquadra.idSquadra} title={tooltipText}>
                      <TableCell
                        align="center"
                        sx={{
                          backgroundColor: cellColor(cell.v, cell.n, cell.p),
                          fontFamily: 'monospace',
                          fontSize: '0.85rem',
                          fontWeight: 600,
                        }}
                      >
                        {cell.v}-{cell.n}-{cell.p}
                      </TableCell>
                    </Tooltip>
                  )
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}

