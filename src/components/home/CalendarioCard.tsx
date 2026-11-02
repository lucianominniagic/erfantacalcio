import {
  Avatar,
  Box,
  Chip,
  Divider,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material'
import { alpha } from '@mui/material/styles'
import { CalendarMonth, CheckCircleOutline, Gavel } from '@mui/icons-material'
import type { z } from 'zod'
import type { giornataSchema } from '~/schemas/calendario'
import { formatDateFromIso } from '~/utils/dateUtils'

interface CalendarioCardProps {
  giornata: z.infer<typeof giornataSchema>
  tipo: 'risultati' | 'prossima'
}

export default function CalendarioCard({
  giornata: g,
  tipo,
}: CalendarioCardProps) {
  const title = tipo === 'risultati' ? 'Risultati' : 'Prossime partite'

  return (
    <Paper
      component="section"
      aria-label={`${title}: ${g.Title}`}
      variant="outlined"
      sx={{ overflow: 'hidden', borderRadius: 2.5, mb: 2 }}
    >
      <Box
        sx={{
          px: 1.5,
          py: 1.25,
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.75}>
          {tipo === 'risultati' ? (
            <CheckCircleOutline sx={{ color: 'success.main', fontSize: 17 }} />
          ) : (
            <CalendarMonth sx={{ color: 'primary.main', fontSize: 17 }} />
          )}
          <Typography
            component="h2"
            variant="subtitle2"
            sx={{ color: 'text.primary', fontWeight: 700 }}
          >
            {title}
          </Typography>
          <Chip
            size="small"
            label={`Giornata ${g.giornata}`}
            sx={{ ml: 'auto !important', height: 22, flexShrink: 0 }}
          />
        </Stack>
        <Typography
          variant="caption"
          sx={{ display: 'block', mt: 0.5, color: 'text.secondary' }}
        >
          {g.Title}
        </Typography>
        <Typography
          variant="caption"
          sx={{ display: 'block', color: 'text.secondary' }}
        >
          {g.SubTitle}
          {g.data && ` · ${formatDateFromIso(g.data, 'DD/MM HH:mm')}`}
        </Typography>
      </Box>
      <Divider />
      {g.partite.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ p: 1.5 }}>
          Nessuna partita in programma
        </Typography>
      ) : (
        g.partite.map((partita, index) => (
          <Box key={partita.idPartita}>
            {index > 0 && <Divider sx={{ mx: 1.5 }} />}
            <Box
              component="a"
              href={
                g.isGiocata
                  ? `/tabellini?idPartita=${partita.idPartita}&idCalendario=${g.idCalendario}`
                  : `/formazioni?idPartita=${partita.idPartita}&idCalendario=${g.idCalendario}`
              }
              sx={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) 46px minmax(0, 1fr)',
                alignItems: 'center',
                gap: 0.75,
                px: 1.5,
                py: 1.25,
                minHeight: 60,
                textDecoration: 'none',
                color: 'text.primary',
                transition: 'background-color 0.15s ease',
                '&:hover, &:active': {
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                },
                '&:focus-visible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                  outlineOffset: -2,
                },
              }}
            >
              {[
                {
                  name: partita.squadraHome,
                  photo: partita.fotoHome,
                  fine: partita.multaHome,
                },
                {
                  name: partita.squadraAway,
                  photo: partita.fotoAway,
                  fine: partita.multaAway,
                },
              ].map((team, side) => (
                <Stack
                  key={side}
                  alignItems="center"
                  spacing={0.5}
                  sx={{
                    minWidth: 0,
                    gridColumn: side === 0 ? 1 : 3,
                    gridRow: 1,
                  }}
                >
                  <Avatar
                    alt={team.name ?? ''}
                    src={team.photo ?? ''}
                    variant="rounded"
                    sx={{
                      width: { xs: 30, md: 38 },
                      height: { xs: 30, md: 38 },
                    }}
                  />
                  <Typography
                    variant="body2"
                    sx={{
                      textAlign: 'center',
                      color: 'text.primary',
                      fontWeight: 600,
                      lineHeight: 1.35,
                      overflowWrap: 'anywhere',
                    }}
                  >
                    {team.name}
                    {team.fine && (
                      <Tooltip title="Multa">
                        <Gavel
                          color="error"
                          sx={{
                            fontSize: 14,
                            ml: 0.5,
                            verticalAlign: 'middle',
                          }}
                        />
                      </Tooltip>
                    )}
                  </Typography>
                </Stack>
              ))}
              <Typography
                aria-label={g.isGiocata ? 'Risultato finale' : 'Contro'}
                sx={{
                  gridColumn: 2,
                  gridRow: 1,
                  textAlign: 'center',
                  color: g.isGiocata ? 'text.primary' : 'text.disabled',
                  fontSize: g.isGiocata ? 18 : 11,
                  fontWeight: 800,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {g.isGiocata
                  ? `${partita.golHome ?? '-'} : ${partita.golAway ?? '-'}`
                  : 'VS'}
              </Typography>
            </Box>
          </Box>
        ))
      )}
    </Paper>
  )
}
