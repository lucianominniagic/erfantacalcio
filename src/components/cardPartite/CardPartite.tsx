import React from 'react'
import {
  Typography,
  Divider,
  Paper,
  Tooltip,
  Avatar,
  Grid,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { Gavel } from '@mui/icons-material'
import { formatDateFromIso } from '~/utils/dateUtils'
import { z } from 'zod'
import { giornataSchema } from '~/schemas/calendario'
import { GenericCard } from '~/components/cards'


interface GiornataCardProps {
  prefixTitle: string
  giornata: z.infer<typeof giornataSchema>[]
  maxWidth: number | string
  withAvatar: boolean
}

export default function CardPartite({
  prefixTitle,
  giornata,
  maxWidth,
  withAvatar,
}: GiornataCardProps) {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <>
      {giornata.map((g) => (
        <Paper
          elevation={0}
          key={`card_${g.idCalendario}`}
          sx={{ maxWidth: maxWidth }}
        >
          <GenericCard
            title={`${prefixTitle} ${g?.Title}`}
            subtitle={`${g.SubTitle}: ${formatDateFromIso(
              g.data,
              'DD/MM HH:mm',
            )}`}
            titleVariant="h5"
            subtitleVariant="h6"
            withPaper={false}
            sx={{ maxWidth: maxWidth }}
          >
            {g.partite.length > 0 ? (
              g.partite.map((partita) => (
                <a
                  href={
                    g.isGiocata
                      ? `/tabellini?idPartita=${partita.idPartita}&idCalendario=${g.idCalendario}`
                      : `/formazioni?idPartita=${partita.idPartita}&idCalendario=${g.idCalendario}`
                  }
                  key={`grid_${partita.idPartita}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Grid
                    container
                    spacing={0}
                    padding={1}
                    sx={{
                      borderRadius: '8px',
                      transition: 'background-color 0.15s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 193, 7, 0.07)',
                      },
                    }}
                  >
                    {withAvatar && (
                      <Grid item xs={!isXs ? 1 : 1.5} alignSelf={'center'} sx={{pr:1}}>
                        <Avatar
                          alt={partita.squadraHome ?? ''}
                          src={partita.fotoHome ?? ''}
                          variant="rounded"
                        ></Avatar>
                      </Grid>
                    )}
                    <Grid
                      item
                      xs={withAvatar ? (!isXs ? 4 : 3.7) : 5}
                      alignSelf={'center'}
                    >
                      <Typography variant="h6" sx={{ fontSize: '0.75rem'}}>
                        {partita.squadraHome}
                        {partita.multaHome ?? (
                          <Tooltip title="Multa">
                            <Gavel color="error" fontSize="small" />
                          </Tooltip>
                        )}
                      </Typography>
                    </Grid>
                    <Grid item xs={!isXs ? 1 : 0.8} alignSelf={'center'}>
                      <Typography variant="h5">
                        {partita.golHome ?? ''}
                      </Typography>
                    </Grid>
                    <Grid item xs={!isXs ? 1 : 0.8} alignSelf={'center'}>
                      <Typography variant="h5">
                        {partita.golAway ?? ''}
                      </Typography>
                    </Grid>
                    <Grid
                      item
                      xs={withAvatar ? (!isXs ? 4 : 3.7) : 5}
                      textAlign={'right'}
                      paddingRight={2}
                      alignSelf={'center'}
                    >
                      <Typography variant="h6" sx={{ fontSize: '0.75rem'}}>
                        {partita.squadraAway}
                        {partita.multaAway ?? (
                          <Tooltip title="Multa">
                            <Gavel color="error" fontSize="small" />
                          </Tooltip>
                        )}
                      </Typography>
                    </Grid>
                    {withAvatar && (
                      <Grid
                        item
                        xs={!isXs ? 1 : 1.5}
                        alignSelf={'center'}
                        textAlign={'right'}
                        alignContent={'flex-end'}
                        alignItems={'flex-end'}
                      >
                        <Avatar
                          alt={partita.squadraAway ?? ''}
                          src={partita.fotoAway ?? ''}
                          variant="rounded"
                        ></Avatar>
                      </Grid>
                    )}
                  </Grid>
                </a>
              ))
            ) : (
              <Grid container spacing={0}>
                <Grid item xs={12}>
                  <Typography
                    variant="body2"
                    component="div"
                    color="text.secondary"
                  >
                    Nessuna partita in programma
                  </Typography>
                </Grid>
              </Grid>
            )}
          </GenericCard>
        </Paper>
      ))}
    </>
  )
}
