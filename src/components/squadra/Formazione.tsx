'use client'
import {
  Analytics,
  HourglassTop,
  Looks3Outlined,
  Looks4Outlined,
  Looks5Outlined,
  Looks6Outlined,
  LooksOneOutlined,
  LooksTwoOutlined,
  ResetTv,
  Save,
  SportsSoccer,
} from '@mui/icons-material'
import {
  Box,
  CircularProgress,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Tooltip,
  Typography,
  Stack,
  Button,
  Snackbar,
  Alert,
  Divider,
  Zoom,
  Slide,
} from '@mui/material'
import { useSession } from 'next-auth/react'
import { api } from '~/utils/api'
import React, { useEffect, useState } from 'react'
import { type Moduli } from '~/types/common'
import { getShortName, moduloDefault } from '~/utils/helper'
import {
  type GiocatoreFormazioneType,
  type GiocatoreType,
} from '~/types/squadre'
import Image from 'next/image'
import Modal from '../modal/Modal'
import Giocatore from '../giocatori/Giocatore'
import {
  allowedFormations,
  calcolaCodiceFormazione,
  checkDataFormazione,
  formatModulo,
  getMatch,
  getPlayerStylePosition,
  sortPlayersByRoleDescThenCostoDesc,
  sortPlayersByRoleDescThenRiserva,
} from './utils'
import { z } from 'zod'
import Statistica from './Statistica'
import { giornataSchema } from '~/schemas/calendario'

function Formazione() {
  const session = useSession()
  const idSquadra = parseInt(session.data?.user?.id ?? '0')
  const squadra = session.data?.user?.squadra ?? ''
  const [idGiocatoreStat, setIdGiocatoreStat] = useState<number>()
  const [openModalCalendario, setOpenModalCalendario] = useState(false)
  const [openModalStatistica, setOpenModalStatistica] = useState(false)
  const [enableRosa, setEnableRosa] = useState(false)
  const [message, setMessage] = useState('')
  const [giornate, setGiornate] = useState<z.infer<typeof giornataSchema>[]>([])
  const [idTorneo, setIdTorneo] = useState<number>()
  const [rosa, setRosa] = useState<GiocatoreFormazioneType[]>([])
  const [campo, setCampo] = useState<GiocatoreFormazioneType[]>([])
  const [panca, setPanca] = useState<GiocatoreFormazioneType[]>([])
  const [idPartita, setIdPartita] = useState<number>(0)
  const [modulo, setModulo] = useState<Moduli>(moduloDefault)
  const [openAlert, setOpenAlert] = useState(false)
  const [saving, setSaving] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>(
    'success',
  )
  const styleCampo = {
    borderStyle: 'none',
    borderWidth: '0px',
    borderColor: '#E4221F',
    position: 'relative',
    width: '95%', //410px
    aspectRatio: '360 / 509',
    //height: '509px',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover', //100%
    backgroundImage: "url('images/campo.jpg')",
  }
  const styleRosa = {
    borderStyle: 'none',
    borderWidth: '0px',
    borderColor: '#E4221F',
  }

  const calendarioProssima = api.formazione.getGiornateDaGiocare.useQuery(
    undefined,
    { refetchOnWindowFocus: false, refetchOnReconnect: false },
  )
  const saveFormazione = api.formazione.create.useMutation({
    onSuccess: async () => {
      setAlertSeverity('success')
    },
  })
  const formazioneList = api.formazione.get.useQuery(
    { idTorneo: idTorneo! },
    {
      enabled: !!idTorneo,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const rosaList = api.squadre.getRosa.useQuery(
    { idSquadra: idSquadra, includeVenduti: false },
    {
      enabled: enableRosa,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )

  useEffect(() => {
    if (calendarioProssima.data) {
      if (
        calendarioProssima.data.length > 0 &&
        checkDataFormazione(calendarioProssima.data[0]?.data)
      ) {
        setEnableRosa(true)
        setIdTorneo(calendarioProssima.data[0]?.idTorneo)
      } else setMessage('Formazione non rilasciabile')
      setGiornate(calendarioProssima.data)
    }
  }, [calendarioProssima.data])

  useEffect(() => {
    if (rosaList.data) {
      const rosaConRuolo = rosaList.data.map((giocatore: GiocatoreType) => ({
        ...giocatore,
        titolare: false,
        riserva: null,
      }))

      setRosa(rosaConRuolo)
    }
  }, [rosaList.data, idTorneo])

  useEffect(() => {
    if (formazioneList.data) {
      setIdPartita(formazioneList.data.idPartita)
      setModulo(formazioneList.data.modulo as Moduli)
      setCampo(formazioneList.data.giocatori.filter((c) => c.titolare))
      setRosa(
        sortPlayersByRoleDescThenCostoDesc(
          formazioneList.data.giocatori.filter(
            (c) => !c.titolare && c.riserva === null,
          ),
        ),
      )
      setPanca(
        sortPlayersByRoleDescThenRiserva(
          formazioneList.data.giocatori.filter((c) => !c.titolare && c.riserva),
        ),
      )
    }
  }, [formazioneList.isFetching, formazioneList.isSuccess, formazioneList.data])

  const handleClickPlayer = async (playerClicked: GiocatoreFormazioneType) => {
    playerClicked.riserva = null
    playerClicked.titolare = false

    const canAdd = canAddPlayer(playerClicked.ruolo)

    if (
      rosa.some((c) => c.idGiocatore === playerClicked.idGiocatore) &&
      canAdd
    ) {
      // Va da rosa a campo
      playerClicked.titolare = true
      await updateLists(playerClicked, campo, setCampo, rosa, setRosa, false)
    } else if (rosa.some((c) => c.idGiocatore === playerClicked.idGiocatore)) {
      // Va da rosa a panca
      playerClicked.riserva = 100
      await updateLists(playerClicked, panca, setPanca, rosa, setRosa, true)
    } else if (campo.some((c) => c.idGiocatore === playerClicked.idGiocatore)) {
      // Va da campo a rosa
      await updateLists(playerClicked, rosa, setRosa, campo, setCampo, true)
    } else if (panca.some((c) => c.idGiocatore === playerClicked.idGiocatore)) {
      // Va da panca a rosa
      await updateLists(
        playerClicked,
        rosa,
        setRosa,
        panca,
        setPanca,
        false,
        true,
      )
    }
  }

  function canAddPlayer(ruoloGiocatore: string): boolean {
    const newState = calcolaCodiceFormazione(campo, ruoloGiocatore)
    const newStateStr = newState.toString().padStart(4, '0')

    const isValid = allowedFormations.some((formation) => {
      const formationStr = formation.toString().padStart(4, '0')

      for (let i = 0; i < 4; i++) {
        const currentRoleCount = parseInt(newStateStr.charAt(i), 10)
        const maxRoleCount = parseInt(formationStr.charAt(i), 10)

        if (currentRoleCount > maxRoleCount) {
          return false
        }
      }
      return true
    })

    if (isValid) {
      const moduloFormatted = formatModulo(newStateStr)
      setModulo(moduloFormatted as Moduli)
    }

    return isValid
  }

  const updateLists = async (
    playerSelected: GiocatoreFormazioneType,
    targetArray: GiocatoreFormazioneType[],
    setTargetArray: (value: GiocatoreFormazioneType[]) => void,
    sourceArray: GiocatoreFormazioneType[],
    setSourceArray: (value: GiocatoreFormazioneType[]) => void,
    orderTargetList = true,
    orderSourceList = false,
  ) => {
    if (
      playerSelected &&
      !targetArray.find((c) => c.idGiocatore === playerSelected.idGiocatore)
    ) {
      const updatedSourceArray = sourceArray.filter(
        (player) => player.idGiocatore !== playerSelected.idGiocatore,
      )
      setSourceArray(updatedSourceArray)
      const updatedTargetArray = [...targetArray, playerSelected]
      orderSourceList
        ? sortPlayersByRoleDescThenRiserva(updatedSourceArray)
        : setSourceArray(updatedSourceArray)
      orderTargetList
        ? setTargetArray(sortPlayersByRoleDescThenRiserva(updatedTargetArray))
        : setTargetArray(updatedTargetArray)
    }
  }

  const renderRosa = (roles: string[], columns: number, title: string) => {
    const filteredRosa = rosa.filter((player) => roles.includes(player.ruolo))
    const filteredPanca = panca.filter((player) => roles.includes(player.ruolo))

    const handleStatGiocatore = (idGiocatore: number) => {
      setIdGiocatoreStat(idGiocatore)
      setOpenModalCalendario(true)
    }

    return (
      <Grid item sm={columns} xs={12}>
        <Box>
          <Typography variant="h6">{title}</Typography>
          <List sx={{ bgcolor: 'background.paper' }}>
            {filteredRosa.map((player) => (
              <Grid container spacing={0} key={player.idGiocatore}>
                <Grid item xs={10}>
                  <div onClick={() => handleClickPlayer(player)}>
                    <ListItem
                      sx={{
                        cursor: 'pointer',
                        zIndex: 2,
                        paddingTop: '0px',
                        paddingBottom: '0px',
                      }}
                    >
                      <img
                        src={player.urlCampioncinoSmall}
                        width={42}
                        height={42}
                        alt={player.nomeSquadraSerieA ?? ''}
                        title={player.nomeSquadraSerieA ?? ''}
                      />
                      <ListItemText
                        primary={getShortName(player.nome)}
                        secondary={getMatch(giornate[0], player, true)}
                      ></ListItemText>
                    </ListItem>
                  </div>
                </Grid>
                <Grid item xs={2} display={'flex'} justifyContent={'flex-end'}>
                  <Slide
                    direction="right"
                    in={true}
                    style={{ transitionDelay: '300ms' }}
                    mountOnEnter
                    unmountOnExit
                  >
                    <Tooltip title={'Statistiche giocatore'}>
                      <IconButton
                        onClick={() => handleStatGiocatore(player.idGiocatore)}
                      >
                        <Analytics color="info" />
                      </IconButton>
                    </Tooltip>
                  </Slide>
                </Grid>
              </Grid>
            ))}
            {filteredPanca.map((player) => (
              <Grid container spacing={0} key={player.idGiocatore}>
                <Grid item xs={10}>
                  <div onClick={() => handleClickPlayer(player)}>
                    <ListItem
                      sx={{
                        cursor: 'pointer',
                        zIndex: 2,
                        paddingTop: '0px',
                        paddingBottom: '0px',
                      }}
                    >
                      <img
                        src={player.urlCampioncinoSmall}
                        width={42}
                        height={42}
                        alt={player.nomeSquadraSerieA ?? ''}
                        title={player.nomeSquadraSerieA ?? ''}
                      />
                      <ListItemText
                        primary={getShortName(player.nome)}
                        secondary={getMatch(giornate[0], player, true)}
                      ></ListItemText>
                    </ListItem>
                  </div>
                </Grid>
                <Grid item xs={2} display={'flex'} justifyContent={'flex-end'}>
                  <Slide
                    direction="right"
                    in={true}
                    style={{ transitionDelay: '300ms' }}
                    mountOnEnter
                    unmountOnExit
                  >
                    <Tooltip title={`Riserva ${player.riserva}`}>
                      <IconButton>
                        {filterIcons[(player.riserva ?? 0) - 1]}
                      </IconButton>
                    </Tooltip>
                  </Slide>
                </Grid>
              </Grid>
            ))}
          </List>
        </Box>
      </Grid>
    )
  }

  const filterIcons = [
    <LooksOneOutlined key={0} color="error" />,
    <LooksTwoOutlined key={1} color="error" />,
    <Looks3Outlined key={2} color="error" />,
    <Looks4Outlined key={3} color="error" />,
    <Looks5Outlined key={4} color="error" />,
    <Looks6Outlined key={5} color="error" />,
  ]

  const renderCampo = (roles: string[]) => {
    const filtered = campo.filter((player) => roles.includes(player.ruolo))
    return (
      <>
        {filtered.map((player, index) => {
          const style = getPlayerStylePosition(player.ruolo, index, modulo)
          return (
            <div
              onClick={() => handleClickPlayer(player)}
              key={player.idGiocatore}
              style={{
                cursor: 'pointer',
                zIndex: 2,
                minWidth: '120px',
                position: 'absolute',
                ...style,
              }}
            >
              <Stack
                direction={'column'}
                justifyContent="space-between"
                alignItems="center"
              >
                <img
                  src={player.urlCampioncinoSmall}
                  key={player.idGiocatore}
                  width={48}
                  height={48}
                  alt={player.nomeSquadraSerieA ?? ''}
                  title={player.nomeSquadraSerieA ?? ''}
                />
                <Typography
                  variant="body2"
                  sx={{
                    color: 'white',
                    backgroundColor: '#2e865f',
                    opacity: 0.8,
                    padding: '2px',
                  }}
                >
                  {player.nome}
                </Typography>
              </Stack>
            </div>
          )
        })}
      </>
    )
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    if (rosa.length > 0 || campo.length !== 11) {
      setAlertMessage('Completa la formazione')
      setAlertSeverity('error')
    } else if (!idPartita && idPartita !== 0) {
      setAlertMessage('Nessuna partita in programma, impossibile procedere')
      setAlertSeverity('error')
    } else {
      setSaving(true)
      if (idPartita !== 0) {
        await saveFormazione.mutateAsync({
          idPartita: idPartita,
          modulo: modulo,
          giocatori: [...campo, ...panca].map((giocatore) => ({
            idGiocatore: giocatore.idGiocatore,
            titolare: giocatore.titolare,
            riserva: giocatore.riserva,
          })),
        })
        setAlertMessage(`Salvataggio completato: ${giornate.filter(g => g.partite.some(p => p.idPartita === idPartita))[0]?.Title}`)
        setSaving(false)
      } else {
        await Promise.all(
          giornate.map(async (g) => {
            await saveFormazione.mutateAsync({
              idPartita: g.partite
                .filter((c) => c.idHome === idSquadra || c.idAway === idSquadra)
                .map((p) => p.idPartita)[0]!,
              modulo: modulo,
              giocatori: [...campo, ...panca].map((giocatore) => ({
                idGiocatore: giocatore.idGiocatore,
                titolare: giocatore.titolare,
                riserva: giocatore.riserva,
              })),
            })
          }),
        )
        setAlertMessage(
          'Salvataggio completato per entrambe le giornate di campionato e champions',
        )
        setSaving(false)
      }
    }
    setOpenAlert(true)
  }

  const handleModalClose = () => {
    setOpenModalCalendario(false)
  }

  const handleModalStatisticaClose = () => {
    setOpenModalStatistica(false)
  }

  function StatisticaSquadra(): void {
    setOpenModalStatistica(true)
  }

  return (
    <>
      <Grid container spacing={0}>
        {((rosaList.isLoading && enableRosa) ||
          calendarioProssima.isLoading) && (
          <Grid item xs={12}>
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <CircularProgress color="warning" />
            </Box>
          </Grid>
        )}
        {enableRosa ? (
          <>
            <Grid item xs={6}>
              <Typography variant={'h4'}>
                Formazione {squadra}{' '}
                {giornate.length === 1 && ` - ${giornate[0]?.Title}`}
              </Typography>
            </Grid>
            <Grid item xs={6} justifyItems={'end'}>
              <Stack
                direction={'row'}
                justifyContent="flex-end"
                alignItems={'center'}
                sx={{ pb: '5px' }}
              >
                {giornate.length > 1 && (
                  <Select
                    size="small"
                    variant="outlined"
                    labelId="select-label-giornata"
                    margin="dense"
                    required
                    sx={{ ml: '10px' }}
                    name="giornata"
                    onChange={(e) =>
                      e.target.value !== 0
                        ? setIdTorneo(e.target.value as number)
                        : setIdPartita(0)
                    }
                    defaultValue={giornate[0]?.idTorneo}
                  >
                    <MenuItem value={0} key={`giornata_0`}>
                      Salva entrambe le formazioni
                    </MenuItem>
                    {giornate.map((g, index) => (
                      <MenuItem
                        value={g.idTorneo}
                        key={`giornata_${g.idTorneo}`}
                        selected={index === 0}
                      >{`${g.Title}`}</MenuItem>
                    ))}
                  </Select>
                )}

                <Box component="form" onSubmit={handleSave} noValidate>
                  <Button
                    type="button"
                    endIcon={<ResetTv />}
                    variant="contained"
                    onClick={() => {
                      setModulo(moduloDefault)
                      setCampo([])
                      setPanca([])
                      setRosa(
                        sortPlayersByRoleDescThenCostoDesc(
                          rosa.concat(campo, panca),
                        ),
                      )
                    }}
                    color="info"
                    size="medium"
                    sx={{ mr: 1 }}
                  >
                    Reset
                  </Button>
                  <Button
                    type="button"
                    variant="contained"
                    color="primary"
                    size="medium"
                    onClick={() => StatisticaSquadra()}
                    endIcon={<SportsSoccer />}
                    sx={{ mr: 1, ml: 1 }}
                  >
                    Andamento
                  </Button>
                  <Button
                    type="submit"
                    disabled={saving}
                    endIcon={!saving ? <Save /> : <HourglassTop />}
                    variant="contained"
                    color="success"
                    size="medium"
                    sx={{ ml: 1 }}
                  >
                    {saving ? 'Attendere...' : 'Salva'}
                  </Button>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} minHeight={5}></Grid>
            <Grid item sm={4}>
              <>
                <Grid container spacing={0} sx={styleRosa} padding={1}>
                  {renderRosa(['P'], 6, 'Portieri')}
                  {renderRosa(['D'], 6, 'Difensori')}
                </Grid>
              </>
            </Grid>
            <Grid
              item
              sm={4}
              sx={{ display: 'flex', justifyContent: 'flex-end' }}
            >
              <Box sx={styleCampo}>
                {renderCampo(['P'])}
                {renderCampo(['D'])}
                {renderCampo(['C'])}
                {renderCampo(['A'])}
              </Box>
              <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{ height: '60%' }}
                open={openAlert}
                autoHideDuration={3000}
                onClose={() => setOpenAlert(false)}
              >
                <Alert
                  onClose={() => setOpenAlert(false)}
                  severity={alertSeverity}
                  variant="filled"
                  sx={{ width: '100%' }}
                >
                  {alertMessage}
                </Alert>
              </Snackbar>
            </Grid>
            <Grid item sm={4}>
              <>
                <Grid container spacing={0} sx={styleRosa} padding={1}>
                  {renderRosa(['C'], 6, 'Centrocampisti')}
                  {renderRosa(['A'], 6, 'Attaccanti')}
                </Grid>
              </>
            </Grid>
          </>
        ) : (
          <Grid
            item
            xs={12}
            display={'flex'}
            justifyContent={'center'}
            sx={{ mt: '30px' }}
          >
            <Typography variant="h3" color="error">
              {message}
            </Typography>
          </Grid>
        )}
      </Grid>

      <Modal
        title={'Statistica giocatore'}
        open={openModalCalendario}
        onClose={handleModalClose}
        width={'1266px'}
      >
        <Divider />
        <Box sx={{ mt: 1, gap: '0px', flexWrap: 'wrap' }}>
          {idGiocatoreStat !== undefined && (
            <Giocatore idGiocatore={idGiocatoreStat} />
          )}
        </Box>
      </Modal>

      <Modal
        title={'Statistica squadra'}
        open={openModalStatistica}
        onClose={handleModalStatisticaClose}
        width={'1266px'}
        height={'80%'}
      >
        <Divider />
        <Box sx={{ mt: 1, gap: '0px', flexWrap: 'wrap' }}>
          <Statistica idSquadra={parseInt(session.data?.user?.id ?? '0')} />
        </Box>
      </Modal>
    </>
  )
}

export default Formazione
