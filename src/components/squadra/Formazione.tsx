'use client'
import {
  Analytics,
  HourglassTop,
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
  Slide,
} from '@mui/material'
import React from 'react'
import { getShortName } from '~/utils/helper'
import { type GiocatoreFormazioneType } from '~/types/squadre'
import Image from 'next/image'
import Modal from '../modal/Modal'
import Giocatore from '../giocatori/Giocatore'
import { getMatch, getPlayerStylePosition } from './utils'
import Statistica from './Statistica'
import { useFormazioneState } from './useFormazioneState'

function Formazione() {
  const {
    idSquadra,
    squadra,
    idGiocatoreStat,
    setIdGiocatoreStat,
    openModalCalendario,
    setOpenModalCalendario,
    openModalStatistica,
    openAlert,
    setOpenAlert,
    saving,
    alertMessage,
    alertSeverity,
    enableRosa,
    message,
    giornate,
    idTorneo,
    setIdTorneo,
    setIdPartita,
    rosa,
    campo,
    panca,
    modulo,
    isLoading,
    filterIcons,
    handleClickPlayer,
    handleSave,
    handleModalCalendarioClose,
    handleModalStatisticaClose,
    openStatisticaSquadra,
    resetFormazione,
  } = useFormazioneState()

  const styleCampo = {
    borderStyle: 'none',
    borderWidth: '0px',
    borderColor: '#E4221F',
    position: 'relative',
    width: '95%',
    aspectRatio: '360 / 509',
    backgroundRepeat: 'no-repeat',
    backgroundSize: 'cover',
    backgroundImage: "url('images/campo.jpg')",
  }
  const styleRosa = {
    borderStyle: 'none',
    borderWidth: '0px',
    borderColor: '#E4221F',
  }

  // kept inline — only used in Formazione (desktop view)
  const renderRosa = (roles: string[], columns: number, title: string) => {
    const filteredRosa = rosa.filter((player) => roles.includes(player.ruolo))
    const filteredPanca = panca.filter((player) => roles.includes(player.ruolo))

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
                      />
                    </ListItem>
                  </div>
                </Grid>
                <Grid item xs={2} display="flex" justifyContent="flex-end">
                  <Slide
                    direction="right"
                    in={true}
                    style={{ transitionDelay: '300ms' }}
                    mountOnEnter
                    unmountOnExit
                  >
                    <Tooltip title="Statistiche giocatore">
                      <IconButton
                        onClick={() => {
                          setIdGiocatoreStat(player.idGiocatore)
                          setOpenModalCalendario(true)
                        }}
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
                      />
                    </ListItem>
                  </div>
                </Grid>
                <Grid item xs={2} display="flex" justifyContent="flex-end">
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
              <Stack direction="column" justifyContent="space-between" alignItems="center">
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

  return (
    <>
      <Grid container spacing={0}>
        {isLoading && (
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
              <Typography variant="h4">
                Formazione {squadra}{' '}
                {giornate.length === 1 && ` - ${giornate[0]?.Title}`}
              </Typography>
            </Grid>
            <Grid item xs={6} justifyItems="end">
              <Stack
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
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
                    <MenuItem value={0} key="giornata_0">
                      Salva entrambe le formazioni
                    </MenuItem>
                    {giornate.map((g, index) => (
                      <MenuItem
                        value={g.idTorneo}
                        key={`giornata_${g.idTorneo}`}
                        selected={index === 0}
                      >
                        {g.Title}
                      </MenuItem>
                    ))}
                  </Select>
                )}

                <Box component="form" onSubmit={handleSave} noValidate>
                  <Button
                    type="button"
                    endIcon={<ResetTv />}
                    variant="contained"
                    onClick={() => resetFormazione()}
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
                    onClick={() => openStatisticaSquadra()}
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
            <Grid item xs={12} minHeight={5} />
            <Grid item sm={4}>
              <Grid container spacing={0} sx={styleRosa} padding={1}>
                {renderRosa(['P'], 6, 'Portieri')}
                {renderRosa(['D'], 6, 'Difensori')}
              </Grid>
            </Grid>
            <Grid item sm={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
              <Grid container spacing={0} sx={styleRosa} padding={1}>
                {renderRosa(['C'], 6, 'Centrocampisti')}
                {renderRosa(['A'], 6, 'Attaccanti')}
              </Grid>
            </Grid>
          </>
        ) : (
          <Grid
            item
            xs={12}
            display="flex"
            justifyContent="center"
            sx={{ mt: '30px' }}
          >
            <Typography variant="h3" color="error">
              {message}
            </Typography>
          </Grid>
        )}
      </Grid>

      <Modal
        title="Statistica giocatore"
        open={openModalCalendario}
        onClose={handleModalCalendarioClose}
        width="1266px"
      >
        <Divider />
        <Box sx={{ mt: 1, gap: '0px', flexWrap: 'wrap' }}>
          {idGiocatoreStat !== undefined && (
            <Giocatore idGiocatore={idGiocatoreStat} />
          )}
        </Box>
      </Modal>

      <Modal
        title="Statistica squadra"
        open={openModalStatistica}
        onClose={handleModalStatisticaClose}
        width="1266px"
        height="80%"
      >
        <Divider />
        <Box sx={{ mt: 1, gap: '0px', flexWrap: 'wrap' }}>
          <Statistica idSquadra={idSquadra} />
        </Box>
      </Modal>
    </>
  )
}

export default Formazione
