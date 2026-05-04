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
import { alpha, useTheme } from '@mui/material/styles'
import { useMediaQuery } from '@mui/material'
import { api } from '~/utils/api'

interface HeadToHeadMatrixProps {
  idTornei: number[]
}

export default function HeadToHeadMatrix({ idTornei }: HeadToHeadMatrixProps) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
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

  const isDark = theme.palette.mode === 'dark'
  const headerBg = isDark ? '#393027' : theme.palette.primary.dark
  const headerColor = isDark ? theme.palette.secondary.main : '#fff'

  const cellColor = (v: number, n: number, p: number): string => {
    if (v > p) return alpha(theme.palette.success.main, 0.25)
    if (p > v) return alpha(theme.palette.error.main, 0.25)
    if (v + n + p === 0) return 'transparent'
    return alpha(theme.palette.warning.main, 0.25)
  }

  return (
    <Box sx={{ pt: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Bilancio scontri diretti (riga = squadra di casa). Verde =
        bilancio favorevole, giallo = pareggio, rosso = sfavorevole.
      </Typography>
      {/* Wrapper handles the scroll shadow trick without interfering with sticky stacking context */}
      <Box
        sx={{
          position: 'relative',
          // right shadow: appears when there is content to scroll right
          '&::after': {
            content: '""',
            pointerEvents: 'none',
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: 24,
            background: `linear-gradient(to right, transparent, ${alpha(theme.palette.common.black, 0.08)})`,
            zIndex: 3,
          },
        }}
      >
        <TableContainer
          component={Paper}
          sx={{
            overflowX: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <Table size="small" sx={{ minWidth: 'max-content', borderCollapse: 'separate', borderSpacing: 0 }}>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  position: 'sticky',
                  left: 0,
                  zIndex: 2,
                  fontWeight: 700,
                  backgroundColor: headerBg,
                  color: headerColor,
                  whiteSpace: 'nowrap',
                }}
              >
                Squadra
              </TableCell>
              {squadre.map((s) => (
                <TableCell
                  key={s.idSquadra}
                  align="center"
                  sx={{ minWidth: 90 }}
                >
                  <Tooltip title={s.squadra}>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      {s.foto ? (
                        <Avatar src={s.foto} sx={{ width: 24, height: 24 }} />
                      ) : null}
                      <Typography
                        component="span"
                        sx={{
                          maxWidth: 80,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: '#0d0d14',
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
                    borderRight: `2px solid ${alpha(theme.palette.divider, 0.4)}`,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {rowSquadra.foto ? (
                      <Avatar src={rowSquadra.foto} sx={{ width: 22, height: 22 }} />
                    ) : null}
                    <Typography sx={{ whiteSpace: 'nowrap' }}>
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
                          backgroundColor: alpha(theme.palette.action.active, 0.06),
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
      {isMobile && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', textAlign: 'center', mt: 1 }}
        >
          ← scorri per vedere tutto →
        </Typography>
      )}
    </Box>
  )
}
