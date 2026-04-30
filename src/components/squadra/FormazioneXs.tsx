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
  Typography,
  Button,
  Snackbar,
  Alert,
  Divider,
  Tooltip,
} from '@mui/material'
import React from 'react'
import { getShortName } from '~/utils/helper'
import { type GiocatoreFormazioneType } from '~/types/squadre'
import Modal from '../modal/Modal'
import Giocatore from '../giocatori/Giocatore'
import { getMatch } from './utils'
import Statistica from './Statistica'
import { useFormazioneState } from './useFormazioneState'

function FormazioneXs() {
  const {
    idSquadra,
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

  const renderRosa = (roles: string[], title: string) => {
    const mergedPlayers = [
      ...rosa.filter((p) => roles.includes(p.ruolo)).map((p) => ({ ...p, status: 'rosa' as const })),
      ...campo.filter((p) => roles.includes(p.ruolo)).map((p) => ({ ...p, status: 'campo' as const })),
      ...panca.filter((p) => roles.includes(p.ruolo)).map((p) => ({ ...p, status: 'panca' as const })),
    ]

    const renderStatusIcon = (player: GiocatoreFormazioneType & { status: 'rosa' | 'campo' | 'panca' }) => {
      if (player.status === 'campo') {
        return (
          <Tooltip title="Titolare">
            <IconButton>
              <SportsSoccer color="success" />
            </IconButton>
          </Tooltip>
        )
      }
      if (player.status === 'panca') {
        return (
          <Tooltip title={`Riserva ${player.riserva}`}>
            <IconButton>{filterIcons[(player.riserva ?? 7) - 1]}</IconButton>
          </Tooltip>
        )
      }
      return null
    }

    return (
      <Grid item xs={12}>
        <Box>
          <Typography variant="h5">{title}</Typography>
          <List sx={{ bgcolor: 'background.paper' }}>
            {mergedPlayers.map((player) => (
              <Grid container spacing={0} key={player.idGiocatore}>
                <Grid item xs={9}>
                  <div onClick={() => handleClickPlayer(player)}>
                    <ListItem
                      sx={{
                        cursor: 'pointer',
                        zIndex: 2,
                        paddingTop: '0px',
                        paddingBottom: '0px',
                        paddingLeft: '0px',
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
                        secondary={`(${player.nomeSquadraSerieA
                          ?.toUpperCase()
                          .substring(0, 3)}) - ${getMatch(giornate[0], player, false)}`}
                      />
                    </ListItem>
                  </div>
                </Grid>
                <Grid item xs={3} display="flex" justifyContent="flex-end">
                  {renderStatusIcon(player)}
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
                </Grid>
              </Grid>
            ))}
          </List>
        </Box>
      </Grid>
    )
  }

  return (
    <>
      <Grid container spacing={1}>
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
            <Grid item xs={12} textAlign="center">
              <Typography variant={giornate.length > 0 ? 'h6' : 'h5'} sx={{ lineHeight: 2 }}>
                <b>{giornate.length > 1 ? `${giornate[0]?.Title} / ${giornate[1]?.Title}` : giornate[0]?.Title}</b>
              </Typography>
            </Grid>
            <Grid item xs={12}>
              {giornate.length > 1 && (
                <Select
                  size="small"
                  variant="outlined"
                  labelId="select-label-giornata"
                  margin="dense"
                  required
                  name="giornata"
                  onChange={(e) =>
                    e.target.value !== 0
                      ? resetFormazione(e.target.value as number)
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
                      {`Salva solo ${g.Title}`}
                    </MenuItem>
                  ))}
                </Select>
              )}
            </Grid>
            <Grid item xs={12} justifyItems="end">
              <Box component="form" onSubmit={handleSave} noValidate>
                <Button
                  type="button"
                  variant="contained"
                  color="primary"
                  size="medium"
                  onClick={() => openStatisticaSquadra()}
                  endIcon={<SportsSoccer />}
                  sx={{ mr: 1, fontSize: '11px' }}
                >
                  Andamento
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  endIcon={!saving ? <Save /> : <HourglassTop />}
                  variant="contained"
                  color="error"
                  size="medium"
                  sx={{ fontSize: '11px' }}
                >
                  {saving ? 'Attendere...' : 'Salva'}
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={0}>
                <Grid item sm={6} xs={6}>
                  <Typography variant="h5">
                    Rosa ({rosa.length}) / Panchina ({panca.length})
                  </Typography>
                </Grid>
                <Grid item sm={6} xs={6} textAlign="right">
                  <Typography variant="h5">{`Modulo: ${modulo}`}</Typography>
                </Grid>
              </Grid>
              <Grid container spacing={0}>
                {renderRosa(['P'], 'Portieri')}
                {renderRosa(['D'], 'Difensori')}
                {renderRosa(['C'], 'Centrocampisti')}
                {renderRosa(['A'], 'Attaccanti')}
              </Grid>
              <Snackbar
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                sx={{ height: '30%' }}
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
            <Grid item xs={12} minHeight={100} justifyItems="end">
              <Button
                type="button"
                endIcon={<ResetTv />}
                variant="contained"
                onClick={() => resetFormazione()}
                color="info"
                size="medium"
                sx={{ fontSize: '10px' }}
              >
                Reset
              </Button>
            </Grid>
          </>
        ) : (
          <Typography variant="h4" color="error">
            {message}
          </Typography>
        )}
      </Grid>

      <Modal
        title="Statistica giocatore"
        open={openModalCalendario}
        onClose={handleModalCalendarioClose}
        width="98%"
        height="98%"
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
        width="98%"
        height="98%"
      >
        <Divider />
        <Box sx={{ mt: 1, gap: '0px', flexWrap: 'wrap' }}>
          <Statistica idSquadra={idSquadra} />
        </Box>
      </Modal>
    </>
  )
}

export default FormazioneXs
