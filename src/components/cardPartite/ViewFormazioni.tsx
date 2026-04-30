'use client'
import {
  Avatar,
  Box,
  Divider,
  Grid,
  MenuItem,
  Select,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { api } from '~/utils/api'
import { formatDateFromIso } from '~/utils/dateUtils'
import { Configurazione } from '~/config'
import Image from 'next/image'
import { Fragment, useMemo } from 'react'
import Modal from '../modal/Modal'
import { usePartitaFromSearchParams, useGiocatoreModal } from './usePartitaParams'
import Giocatore from '../giocatori/Giocatore'
import { magliaType, ShirtTemplate } from '../selectColors'
import { ShirtSVG } from '../selectColors/shirtSVG'
import { GenericCard } from '~/components/cards'

function ViewFormazioni() {
  const [partita, setPartita] = usePartitaFromSearchParams()
  const { idGiocatore, openModalCalendario, handleStatGiocatore, handleModalClose } = useGiocatoreModal()

  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))
  
  const formazioniList = api.partita.getFormazioni.useQuery(
    { idPartita: partita! },
    {
      enabled: !!partita,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )

  const calendario = formazioniList.data?.Calendario
  const infoPartita = formazioniList.data?.Calendario.partite[0]
  const altrePartite = formazioniList.data?.AltrePartite
  const formazioneHome = formazioniList.data?.FormazioneHome
  const formazioneAway = formazioniList.data?.FormazioneAway

  const magliaHome = useMemo(
    () => infoPartita?.magliaHome ? JSON.parse(infoPartita.magliaHome) as magliaType : undefined,
    [infoPartita?.magliaHome],
  )
  const magliaAway = useMemo(
    () => infoPartita?.magliaAway ? JSON.parse(infoPartita.magliaAway) as magliaType : undefined,
    [infoPartita?.magliaAway],
  )

  return (
    <>
      <Grid container spacing={0}>
        {calendario && (
          <>
            <Grid item xs={12}>
              <Typography variant={'h4'}>{calendario.Title}</Typography>
            </Grid>

            <Grid item xs={12}>
              <Typography variant={'body2'}>
                {`Calcio d'inizio ${calendario.SubTitle} il 
                                ${formatDateFromIso(
                                  calendario.data,
                                  'DD/MM/YYYY',
                                )} alle 
                                ${formatDateFromIso(calendario.data, 'HH:mm')}`}
              </Typography>
            </Grid>
            <Grid item xs={6} sx={{ pr: '10px' }}>
              {calendario && (
                <GenericCard
                  title={infoPartita?.squadraHome}
                  titleVariant='h4'
                  subtitle={
                    formazioneHome
                      ? formatDateFromIso(formazioneHome?.dataOra.toString(), 'DD-MM-YYYY HH:mm')
                      : `Formazione non rilasciata, multa di ${Configurazione.importoMulta} €`
                  }
                  avatar={
                    <Avatar
                      alt={infoPartita?.squadraHome ?? ''}
                      src={infoPartita?.fotoHome ?? ''}
                      sx={{ display: { xs: 'none', sm: 'block' }, mr: '5px' }}
                    ></Avatar>
                  }
                >
                    {formazioneHome && (
                      <>
                        <Grid container spacing={0}>
                          {magliaHome && (
                            <Grid
                              item
                              xs={12}
                              justifyContent={'center'}
                              display={'flex'}
                            >
                              <ShirtSVG
                                template={
                                  magliaHome.selectedTemplate as ShirtTemplate
                                }
                                mainColor={magliaHome.mainColor}
                                secondaryColor={magliaHome.secondaryColor}
                                thirdColor={magliaHome.thirdColor}
                                textColor={magliaHome.textColor}
                                size={100}
                                number={magliaHome.shirtNumber}
                              />
                            </Grid>
                          )}
                          <Grid item xs={12} sm={7}>
                            <Typography variant={'h6'} sx={{ m: '3px' }}>
                              <b>Modulo: {formazioneHome.modulo}</b>
                            </Typography>
                          </Grid>
                          <Grid
                            item
                            sm={5}
                            sx={{ display: { xs: 'none', sm: 'block' } }}
                          >
                            <Typography variant={'h6'}>
                              <b>Panchina</b>
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={7}>
                            <Grid container spacing={0}>
                              {formazioneHome.Voti.filter(
                                (g) => g.titolare,
                              ).map((g) => (
                                <Fragment key={g.Giocatore.idGiocatore}>
                                  <Grid item xs={2} sm={1}>
                                    <Tooltip
                                      title={
                                        g.Giocatore.Trasferimenti[0]
                                          ?.SquadraSerieA?.nome
                                      }
                                    >
                                      <Image
                                        src={`/images/maglie/${
                                          g.Giocatore.Trasferimenti[0]
                                            ?.SquadraSerieA?.maglia ??
                                          'NoSerieA.gif'
                                        }`}
                                        width={26}
                                        height={22}
                                        alt={g.Giocatore.nome}
                                      />
                                    </Tooltip>
                                  </Grid>
                                  <Grid item xs={2} sm={1}>
                                    <Typography variant="body2">
                                      {g.Giocatore.ruolo}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={8} sm={10}>
                                    <Typography
                                      variant="body2"
                                      sx={{ cursor: 'pointer' }}
                                      onClick={() =>
                                        handleStatGiocatore(
                                          g.Giocatore.idGiocatore,
                                        )
                                      }
                                    >
                                      {g.Giocatore.nome}
                                    </Typography>
                                  </Grid>
                                </Fragment>
                              ))}
                            </Grid>
                          </Grid>
                          <Grid
                            item
                            xs={12}
                            sx={{ display: { xs: 'block', sm: 'none' } }}
                          >
                            <Typography variant={'h6'}>
                              <b>Panchina</b>
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={5}>
                            <Grid container spacing={0}>
                              {formazioneHome.Voti.filter(
                                (g) => !g.titolare,
                              ).map((g) => (
                                <Fragment key={g.Giocatore.idGiocatore}>
                                  <Grid item xs={2} sm={2}>
                                    <Tooltip
                                      title={
                                        g.Giocatore.Trasferimenti[0]
                                          ?.SquadraSerieA?.nome
                                      }
                                    >
                                      <Image
                                        src={`/images/maglie/${
                                          g.Giocatore.Trasferimenti[0]
                                            ?.SquadraSerieA?.maglia ??
                                          'NoSerieA.gif'
                                        }`}
                                        width={26}
                                        height={22}
                                        alt={g.Giocatore.nome}
                                      />
                                    </Tooltip>
                                  </Grid>
                                  <Grid item xs={2} sm={2}>
                                    <Typography variant="body2">
                                      {g.Giocatore.ruolo} ({g.riserva})
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={8} sm={8}>
                                    <Typography
                                      variant="body2"
                                      sx={{ cursor: 'pointer' }}
                                      onClick={() =>
                                        handleStatGiocatore(
                                          g.Giocatore.idGiocatore,
                                        )
                                      }
                                    >
                                      {g.Giocatore.nome}
                                    </Typography>
                                  </Grid>
                                </Fragment>
                              ))}
                            </Grid>
                          </Grid>
                        </Grid>
                      </>
                    )}
                </GenericCard>
              )}
            </Grid>
            <Grid item xs={6} sx={{ pl: '10px' }}>
              {calendario && (
                <GenericCard
                  title={infoPartita?.squadraAway}
                  titleVariant='h4'
                  subtitle={
                    formazioneAway
                      ? formatDateFromIso(formazioneAway?.dataOra.toString(), 'DD-MM-YYYY HH:mm')
                      : `Formazione non rilasciata, prevista multa di ${Configurazione.importoMulta} €`
                  }
                  avatar={
                    <Avatar
                      alt={infoPartita?.squadraAway ?? ''}
                      src={infoPartita?.fotoAway ?? ''}
                      sx={{ display: { xs: 'none', sm: 'block' }, mr: '5px' }}
                    ></Avatar>
                  }
                >
                    {formazioneAway && (
                      <>
                        <Grid container spacing={0}>
                          {magliaAway && (
                            <Grid
                              item
                              xs={12}
                              justifyContent={'center'}
                              display={'flex'}
                            >
                              <ShirtSVG
                                template={
                                  magliaAway.selectedTemplate as ShirtTemplate
                                }
                                mainColor={magliaAway.mainColor}
                                secondaryColor={magliaAway.secondaryColor}
                                thirdColor={magliaAway.thirdColor}
                                textColor={magliaAway.textColor}
                                size={100}
                                number={magliaAway.shirtNumber}
                              />
                            </Grid>
                          )}
                          <Grid item xs={12} sm={7}>
                            <Typography variant={'h6'} sx={{ m: '3px' }}>
                              <b>Modulo: {formazioneAway.modulo}</b>
                            </Typography>
                          </Grid>
                          <Grid
                            item
                            sm={5}
                            sx={{ display: { xs: 'none', sm: 'block' } }}
                          >
                            <Typography variant={'h6'}>
                              <b>Panchina</b>
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={7}>
                            <Grid container spacing={0}>
                              {formazioneAway.Voti.filter(
                                (g) => g.titolare,
                              ).map((g) => (
                                <Fragment key={g.Giocatore.idGiocatore}>
                                  <Grid item xs={2} sm={1}>
                                    <Tooltip
                                      title={
                                        g.Giocatore.Trasferimenti[0]
                                          ?.SquadraSerieA?.nome
                                      }
                                    >
                                      <Image
                                        src={`/images/maglie/${
                                          g.Giocatore.Trasferimenti[0]
                                            ?.SquadraSerieA?.maglia ??
                                          'NoSerieA.gif'
                                        }`}
                                        width={26}
                                        height={22}
                                        alt={g.Giocatore.nome}
                                      />
                                    </Tooltip>
                                  </Grid>
                                  <Grid item xs={2} sm={1}>
                                    <Typography variant="body2">
                                      {g.Giocatore.ruolo}
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={8} sm={10}>
                                    <Typography
                                      variant="body2"
                                      sx={{ cursor: 'pointer' }}
                                      onClick={() =>
                                        handleStatGiocatore(
                                          g.Giocatore.idGiocatore,
                                        )
                                      }
                                    >
                                      {g.Giocatore.nome}
                                    </Typography>
                                  </Grid>
                                </Fragment>
                              ))}
                            </Grid>
                          </Grid>
                          <Grid
                            item
                            xs={12}
                            sx={{ display: { xs: 'block', sm: 'none' } }}
                          >
                            <Typography variant={'h6'}>
                              <b>Panchina</b>
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={5}>
                            <Grid container spacing={0}>
                              {formazioneAway.Voti.filter(
                                (g) => !g.titolare,
                              ).map((g) => (
                                <Fragment key={g.Giocatore.idGiocatore}>
                                  <Grid item xs={2} sm={2}>
                                    <Tooltip
                                      title={
                                        g.Giocatore.Trasferimenti[0]
                                          ?.SquadraSerieA?.nome
                                      }
                                    >
                                      <Image
                                        src={`/images/maglie/${
                                          g.Giocatore.Trasferimenti[0]
                                            ?.SquadraSerieA?.maglia ??
                                          'NoSerieA.gif'
                                        }`}
                                        width={26}
                                        height={22}
                                        alt={g.Giocatore.nome}
                                      />
                                    </Tooltip>
                                  </Grid>
                                  <Grid item xs={2} sm={2}>
                                    <Typography variant="body2">
                                      {g.Giocatore.ruolo} ({g.riserva})
                                    </Typography>
                                  </Grid>
                                  <Grid item xs={8} sm={8}>
                                    <Typography
                                      variant="body2"
                                      sx={{ cursor: 'pointer' }}
                                      onClick={() =>
                                        handleStatGiocatore(
                                          g.Giocatore.idGiocatore,
                                        )
                                      }
                                    >
                                      {g.Giocatore.nome}
                                    </Typography>
                                  </Grid>
                                </Fragment>
                              ))}
                            </Grid>
                          </Grid>
                        </Grid>
                      </>
                    )}
                </GenericCard>
              )}
            </Grid>
          </>
        )}
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

export default ViewFormazioni
