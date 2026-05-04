'use client'
import {
  KeyboardDoubleArrowLeftOutlined,
  KeyboardDoubleArrowRightOutlined,
  Style,
} from '@mui/icons-material'
import {
  Avatar,
  Box,
  Divider,
  Grid,
  MenuItem,
  Select,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { api } from '~/utils/api'
import Image from 'next/image'
import { getShortName } from '~/utils/helper'
import Modal from '../modal/Modal'
import { Configurazione } from '~/config'
import { usePartitaFromSearchParams, useGiocatoreModal } from './usePartitaParams'
import Giocatore from '../giocatori/Giocatore'
import { ShirtTemplate, magliaType } from '../selectColors'
import { ShirtSVG } from '../selectColors/shirtSVG'
import { GenericCard } from '~/components/cards'

interface Tabellino {
  dataOra: Date
  modulo: string
  idSquadra: number
  fattoreCasalingo: number
  bonusModulo: number
  bonusSenzaVoto: number
  fantapunti: number
  golSegnati: number
  fantapuntiTotale: number
  Voti: {
    nomeSquadraSerieA?: string
    magliaSquadraSerieA?: string
    nome: string
    idGiocatore: number
    ruolo: string
    riserva: number | null
    titolare: boolean
    voto: number
    gol: number
    assist: number
    autogol: number
    altriBonus: number
    ammonizione: number
    espulsione: number
    votoBonus: number
    isSostituito: boolean
    isVotoInfluente: boolean
  }[]
}

function ViewTabellini() {
  const [partita, setPartita] = usePartitaFromSearchParams()
  const { idGiocatore, openModalCalendario, handleStatGiocatore, handleModalClose } = useGiocatoreModal()

  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))

  const tabelliniList = api.partita.getTabellini.useQuery(
    { idPartita: partita! },
    {
      enabled: !!partita,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )

  const calendario = tabelliniList.data?.Calendario
  const infoPartita = tabelliniList.data?.Calendario.partite[0]
  const altrePartite = tabelliniList.data?.AltrePartite
  const tabellinoHome = tabelliniList.data?.TabellinoHome
  const tabellinoAway = tabelliniList.data?.TabellinoAway

  const renderTabellino = (
    tabellino?: Tabellino,
    squadra?: string | null,
    foto?: string | null,
    maglia?: magliaType | null,
    multa?: boolean,
  ) => {
    if (tabellino) {
      return (
        <GenericCard
          title={
            <Grid container spacing={0}>
              <Grid item xs={11}>
                {squadra}
              </Grid>
              <Grid item xs={1} display={'flex'} justifyContent={'flex-end'}>
                <Typography variant={'h4'} sx={{ m: '1px' }}>
                  <b>{tabellino.golSegnati}</b>
                </Typography>
              </Grid>
            </Grid>
          }
          titleVariant='h5'
          subtitle={`Modulo: ${tabellino.modulo} ${
            multa ? `multa di ${Configurazione.importoMulta} €` : ''
          }`}
          avatar={
            <Avatar
              alt={squadra ?? ''}
              src={foto ?? ''}
              sx={{ display: { xs: 'none', sm: 'block' }, mr: '5px' }}
            ></Avatar>
          }
        >
            <Grid container spacing={0}>
              {maglia && (
                  <Grid item xs={12}  justifyContent={'center'} display={'flex'}>
                    <ShirtSVG
                      template={maglia.selectedTemplate as ShirtTemplate}
                      mainColor={maglia.mainColor}
                      secondaryColor={maglia.secondaryColor}
                      thirdColor={maglia.thirdColor}
                      textColor={maglia.textColor}
                      size={100}
                      number={maglia.shirtNumber}
                    />
                  </Grid>
                )}
              <Grid item xs={12} sm={8}>
                <Typography variant={'h6'} sx={{ m: '5px' }}>
                  <b>Titolari</b>
                </Typography>
              </Grid>
              <Grid item sm={4} sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant={'h6'} sx={{ m: '5px' }}>
                  <b>Panchina</b>
                </Typography>
              </Grid>

              <Grid item xs={12} sm={7}>
                <Grid container spacing={0}>
                  {tabellino.Voti.filter((g) => g.titolare).map((g, index) => (
                    <Grid item xs={12} key={`tit_${index}`}>
                      <Grid container spacing={0}>
                        <Grid
                          item
                          sm={1.5}
                          sx={{ display: { xs: 'none', sm: 'block' } }}
                        >
                          <Tooltip title={g.nomeSquadraSerieA}>
                            <Image
                              src={`/images/maglie/${
                                g.magliaSquadraSerieA ?? 'NoSerieA.gif'
                              }`}
                              width={30}
                              height={26}
                              alt={g.nome}
                            />
                          </Tooltip>
                        </Grid>
                        <Grid
                          item
                          xs={2}
                          sx={{
                            display: {
                              xs: 'block',
                              sm: 'none',
                            },
                          }}
                        >
                          <Tooltip title={g.nomeSquadraSerieA}>
                            <Image
                              src={`/images/maglie/${
                                g.magliaSquadraSerieA ?? 'NoSerieA.gif'
                              }`}
                              width={30}
                              height={26}
                              alt={g.nome}
                            />
                          </Tooltip>
                        </Grid>
                        <Grid
                          item
                          xs={1}
                          sm={1}
                          sx={{ display: { xs: 'none', sm: 'block' } }}
                        >
                          <Typography variant="body2">{g.ruolo}</Typography>
                        </Grid>
                        <Grid
                          item
                          sm={4.5}
                          sx={{ display: { xs: 'none', sm: 'block' } }}
                        >
                          <Stack direction="row" spacing={1}>
                            <Typography
                              variant="body2"
                              sx={{ cursor: 'pointer' }}
                              onClick={() => handleStatGiocatore(g.idGiocatore)}
                            >
                              {getShortName(g.nome)}
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid
                          item
                          xs={6}
                          sx={{ display: { xs: 'block', sm: 'none' } }}
                        >
                          <Stack direction="row" spacing={1}>
                            <Typography
                              variant="body2"
                              sx={{
                                cursor: 'pointer',
                                borderBottomColor: getColorByRuolo(g.ruolo),
                                borderBottomWidth: 1,
                                borderBottomStyle: 'dotted',
                              }}
                              onClick={() => handleStatGiocatore(g.idGiocatore)}
                            >
                              {getShortName(g.nome, 11)}
                            </Typography>
                          </Stack>
                        </Grid>
                        <Grid
                          item
                          xs={2.5}
                          sm={3}
                          sx={{ display: 'flex', justifyContent: 'flex-end' }}
                        >
                          {getVotoBonus(
                            g.voto,
                            g.gol,
                            g.assist,
                            g.autogol,
                            g.altriBonus,
                          )}
                        </Grid>
                        <Grid item xs={1.5} sm={2}>
                          {g.ammonizione !== 0 ? (
                            <Style color="warning" />
                          ) : g.espulsione !== 0 ? (
                            <Style color="error" />
                          ) : (
                            ''
                          )}
                          {g.isSostituito && (
                            <KeyboardDoubleArrowRightOutlined color="error" />
                          )}
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
                  {tabellino.Voti.filter((g) => !g.titolare).map((g, index) => (
                    <Grid item xs={12} key={`ris_${index}`}>
                      <Grid container spacing={0}>
                        <Grid
                          item
                          sm={2}
                          sx={{ display: { xs: 'none', sm: 'block' } }}
                        >
                          <Tooltip title={g.nomeSquadraSerieA}>
                            <Image
                              src={`/images/maglie/${
                                g.magliaSquadraSerieA ?? 'NoSerieA.gif'
                              }`}
                              width={30}
                              height={26}
                              alt={g.nome}
                            />
                          </Tooltip>
                        </Grid>
                        <Grid
                          item
                          xs={2}
                          sx={{
                            display: {
                              xs: 'block',
                              sm: 'none',
                            },
                          }}
                        >
                          <Tooltip title={g.nomeSquadraSerieA}>
                            <Image
                              src={`/images/maglie/${
                                g.magliaSquadraSerieA ?? 'NoSerieA.gif'
                              }`}
                              width={30}
                              height={26}
                              alt={g.nome}
                            />
                          </Tooltip>
                        </Grid>
                        <Grid
                          item
                          sm={1}
                          sx={{ display: { xs: 'none', sm: 'block' } }}
                        >
                          <Typography variant="body2">
                            &nbsp;{g.ruolo}
                          </Typography>
                        </Grid>
                        <Grid
                          item
                          sm={6}
                          sx={{ display: { xs: 'none', sm: 'block' } }}
                        >
                          <Stack direction="row" spacing={1}>
                            <Typography
                              variant="body2"
                              sx={{ cursor: 'pointer' }}
                              onClick={() => handleStatGiocatore(g.idGiocatore)}
                            >
                              {getShortName(g.nome)}
                            </Typography>
                            {g.isVotoInfluente && (
                              <KeyboardDoubleArrowLeftOutlined color="success" />
                            )}
                          </Stack>
                        </Grid>
                        <Grid
                          item
                          xs={6}
                          sx={{ display: { xs: 'block', sm: 'none' } }}
                        >
                          <Stack direction="row" spacing={1}>
                            <Typography
                              variant="body2"
                              sx={{
                                cursor: 'pointer',
                                borderBottomColor: getColorByRuolo(g.ruolo),
                                borderBottomWidth: 1,
                                borderBottomStyle: 'dotted',
                              }}
                              onClick={() => handleStatGiocatore(g.idGiocatore)}
                            >
                              {getShortName(g.nome, 11)}
                            </Typography>
                            {g.isVotoInfluente && (
                              <KeyboardDoubleArrowLeftOutlined color="success" />
                            )}
                          </Stack>
                        </Grid>
                        <Grid
                          item
                          sm={2}
                          sx={{ display: { xs: 'none', sm: 'block' } }}
                        >
                          {getVotoBonus(
                            g.voto,
                            g.gol,
                            g.assist,
                            g.autogol,
                            g.altriBonus,
                          )}
                        </Grid>
                        <Grid
                          item
                          xs={2.5}
                          sx={{ display: { xs: 'block', sm: 'none' } }}
                        >
                          {getVotoBonus(
                            g.voto,
                            g.gol,
                            g.assist,
                            g.autogol,
                            g.altriBonus,
                          )}
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

              <Grid item xs={12} sm={4} display={'flex'}>
                <Typography variant={'h6'} sx={{ m: '5px' }}>
                  Fantapunti: <b>{tabellino.fantapuntiTotale}</b>
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant={'h6'} sx={{ m: '5px' }}>
                  {tabellino.fattoreCasalingo > 0 ? (
                    <>
                      Fattore casalingo: <b>+{tabellino.fattoreCasalingo}</b>
                    </>
                  ) : (
                    <>&nbsp;</>
                  )}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Typography variant={'h6'} sx={{ m: '5px' }}>
                  {tabellino.bonusSenzaVoto > 0 && (
                    <>
                      Senza voto: <b>+{tabellino.bonusSenzaVoto}</b>
                    </>
                  )}
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant={'h6'} sx={{ m: '5px' }}>
                  {tabellino.bonusModulo > 0 && (
                    <>
                      Bonus modulo: <b>+{tabellino.bonusModulo}</b>
                    </>
                  )}
                </Typography>
              </Grid>
            </Grid>
        </GenericCard>
      )
    }

    function getColorByRuolo(ruolo: string) {
      switch (ruolo) {
        case 'P':
          return theme.palette.secondary.dark
        case 'D':
          return theme.palette.info.dark
        case 'C':
          return theme.palette.action.hover
        case 'A':
          return theme.palette.error.dark
      }
    }

    function getVotoBonus(
      voto: number,
      gol: number,
      assist: number,
      autogol: number,
      altriBonus: number,
    ) {
      return (
        <Typography variant="body2">
          {voto !== 0 ? voto : ''}
          {gol > 0 ? `+${gol}` : ''}
          {gol < 0 ? `${gol}` : ''}
          {assist > 0 ? `+${assist}` : ''}
          {autogol < 0 ? `+${autogol}` : ''}
          {altriBonus !== 0 ? `+${altriBonus}` : ''}
        </Typography>
      )
    }
  }

  return (
    <>
      <Grid container spacing={0}>
        {calendario && (
          <>
            <Grid item xs={12}>
              <Typography variant={'h4'}>{calendario.Title}</Typography>
            </Grid>

            <Grid item xs={6} sx={isXs ? { pr: '1px' } : { pr: '10px' }}>
              {renderTabellino(
                tabellinoHome,
                infoPartita?.squadraHome,
                infoPartita?.fotoHome,
                JSON.parse(infoPartita?.magliaHome ?? '{}') as magliaType,
                infoPartita?.multaHome,
              )}
            </Grid>
            <Grid item xs={6} sx={isXs ? { pl: '1px' } : { pl: '10px' }}>
              {renderTabellino(
                tabellinoAway,
                infoPartita?.squadraAway,
                infoPartita?.fotoAway,
                JSON.parse(infoPartita?.magliaAway ?? '{}') as magliaType,
                infoPartita?.multaAway,
              )}
            </Grid>
            {partita && (
              <Grid item xs={12} justifyItems={'flex-end'}>
                <Typography variant={'h5'}>
                  Altre partite:
                  <Select
                    size="small"
                    variant="outlined"
                    labelId="select-label-partita"
                    margin="dense"
                    required
                    sx={{ ml: '10px' }}
                    name="giornata"
                    onChange={(e) => setPartita(e.target.value as number)}
                    defaultValue={partita}
                  >
                    {altrePartite?.map((p, index) => (
                      <MenuItem
                        value={p.idPartita}
                        key={`giornata_${p.idPartita}`}
                        selected={index === 0}
                      >{`${p.SquadraHome?.nomeSquadra} - ${p.SquadraAway?.nomeSquadra}`}</MenuItem>
                    ))}
                  </Select>
                </Typography>
              </Grid>
            )}
          </>
        )}
        <Grid item xs={12} sx={{ height: '100px' }}>
          <></>
        </Grid>
      </Grid>

      <Modal
        title={'Statistica giocatore'}
        open={openModalCalendario}
        onClose={handleModalClose}
        width={isXs ? '98%' : '1266px'}
        height={isXs ? '98%' : ''}
      >
        <Divider />
        <Box sx={{ mt: 1, gap: '0px', flexWrap: 'wrap' }}>
          {idGiocatore !== undefined && <Giocatore idGiocatore={idGiocatore} />}
        </Box>
      </Modal>
    </>
  )
}

export default ViewTabellini
