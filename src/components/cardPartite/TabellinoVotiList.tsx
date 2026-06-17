'use client'
import {
  Grid,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material'
import {
  KeyboardDoubleArrowLeftOutlined,
  KeyboardDoubleArrowRightOutlined,
  Style,
} from '@mui/icons-material'
import Image from 'next/image'
import { getShortName } from '~/utils/giocatori'
import { getColorByRuolo, getVotoBonus, type Tabellino } from './tabellinoHelpers'

interface TabellinoVotiListProps {
  voti: Tabellino['Voti']
  onStatGiocatore: (idGiocatore: number) => void
}

export function TabellinoVotiList({ voti, onStatGiocatore }: TabellinoVotiListProps) {
  const theme = useTheme()
  const titolari = voti.filter((g) => g.titolare)
  const riserve = voti.filter((g) => !g.titolare)

  return (
    <>
      <Grid item xs={12} sm={7}>
        <Grid container spacing={0}>
          {titolari.map((g, index) => (
            <Grid item xs={12} key={`tit_${index}`}>
              <Grid container spacing={0}>
                <Grid item sm={1.5} sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Tooltip title={g.nomeSquadraSerieA}>
                    <Image
                      src={`/images/maglie/${g.magliaSquadraSerieA ?? 'NoSerieA.gif'}`}
                      width={30}
                      height={26}
                      alt={g.nome}
                    />
                  </Tooltip>
                </Grid>
                <Grid item xs={2} sx={{ display: { xs: 'block', sm: 'none' } }}>
                  <Tooltip title={g.nomeSquadraSerieA}>
                    <Image
                      src={`/images/maglie/${g.magliaSquadraSerieA ?? 'NoSerieA.gif'}`}
                      width={30}
                      height={26}
                      alt={g.nome}
                    />
                  </Tooltip>
                </Grid>
                <Grid item xs={1} sm={1} sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2">{g.ruolo}</Typography>
                </Grid>
                <Grid item sm={4.5} sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Stack direction="row" spacing={1}>
                    <Typography
                      variant="body2"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => onStatGiocatore(g.idGiocatore)}
                    >
                      {getShortName(g.nome)}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={6} sx={{ display: { xs: 'block', sm: 'none' } }}>
                  <Stack direction="row" spacing={1}>
                    <Typography
                      variant="body2"
                      sx={{
                        cursor: 'pointer',
                        borderBottomColor: getColorByRuolo(g.ruolo, theme),
                        borderBottomWidth: 1,
                        borderBottomStyle: 'dotted',
                      }}
                      onClick={() => onStatGiocatore(g.idGiocatore)}
                    >
                      {getShortName(g.nome, 11)}
                    </Typography>
                  </Stack>
                </Grid>
                <Grid item xs={2.5} sm={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  {getVotoBonus(g.voto, g.gol, g.assist, g.autogol, g.altriBonus)}
                </Grid>
                <Grid item xs={1.5} sm={2}>
                  {g.ammonizione !== 0 ? (
                    <Style color="warning" />
                  ) : g.espulsione !== 0 ? (
                    <Style color="error" />
                  ) : (
                    ''
                  )}
                  {g.isSostituito && <KeyboardDoubleArrowRightOutlined color="error" />}
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Grid>

      <Grid item xs={12} sx={{ display: { xs: 'block', sm: 'none' } }}>
        <Typography variant={'h6'}>
          <b>Panchina</b>
        </Typography>
      </Grid>
      <Grid item xs={12} sm={5}>
        <Grid container spacing={0}>
          {riserve.map((g, index) => (
            <Grid item xs={12} key={`ris_${index}`}>
              <Grid container spacing={0}>
                <Grid item sm={2} sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Tooltip title={g.nomeSquadraSerieA}>
                    <Image
                      src={`/images/maglie/${g.magliaSquadraSerieA ?? 'NoSerieA.gif'}`}
                      width={30}
                      height={26}
                      alt={g.nome}
                    />
                  </Tooltip>
                </Grid>
                <Grid item xs={2} sx={{ display: { xs: 'block', sm: 'none' } }}>
                  <Tooltip title={g.nomeSquadraSerieA}>
                    <Image
                      src={`/images/maglie/${g.magliaSquadraSerieA ?? 'NoSerieA.gif'}`}
                      width={30}
                      height={26}
                      alt={g.nome}
                    />
                  </Tooltip>
                </Grid>
                <Grid item sm={1} sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2">&nbsp;{g.ruolo}</Typography>
                </Grid>
                <Grid item sm={6} sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Stack direction="row" spacing={1}>
                    <Typography
                      variant="body2"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => onStatGiocatore(g.idGiocatore)}
                    >
                      {getShortName(g.nome)}
                    </Typography>
                    {g.isVotoInfluente && <KeyboardDoubleArrowLeftOutlined color="success" />}
                  </Stack>
                </Grid>
                <Grid item xs={6} sx={{ display: { xs: 'block', sm: 'none' } }}>
                  <Stack direction="row" spacing={1}>
                    <Typography
                      variant="body2"
                      sx={{
                        cursor: 'pointer',
                        borderBottomColor: getColorByRuolo(g.ruolo, theme),
                        borderBottomWidth: 1,
                        borderBottomStyle: 'dotted',
                      }}
                      onClick={() => onStatGiocatore(g.idGiocatore)}
                    >
                      {getShortName(g.nome, 11)}
                    </Typography>
                    {g.isVotoInfluente && <KeyboardDoubleArrowLeftOutlined color="success" />}
                  </Stack>
                </Grid>
                <Grid item sm={2} sx={{ display: { xs: 'none', sm: 'block' } }}>
                  {getVotoBonus(g.voto, g.gol, g.assist, g.autogol, g.altriBonus)}
                </Grid>
                <Grid item xs={2.5} sx={{ display: { xs: 'block', sm: 'none' } }}>
                  {getVotoBonus(g.voto, g.gol, g.assist, g.autogol, g.altriBonus)}
                </Grid>
                <Grid item xs={1.5} sm={1}>
                  {g.ammonizione !== 0 ? (
                    <Style color="warning" />
                  ) : g.espulsione !== 0 ? (
                    <Style color="error" />
                  ) : (
                    ''
                  )}
                </Grid>
              </Grid>
            </Grid>
          ))}
        </Grid>
      </Grid>
    </>
  )
}
