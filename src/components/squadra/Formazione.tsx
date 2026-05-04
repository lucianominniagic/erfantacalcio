'use client'
import {
  Analytics,
  HourglassTop,
  ResetTv,
  Save,
  SportsSoccer,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import React from 'react'
import { getShortName } from '~/utils/helper'
import { type GiocatoreFormazioneType } from '~/types/squadre'
import Modal from '../modal/Modal'
import Giocatore from '../giocatori/Giocatore'
import { getMatch } from './utils'
import { useFormazioneState } from './useFormazioneState'

function Formazione() {
  const {
    idSquadra,
    squadra,
    idGiocatoreStat,
    setIdGiocatoreStat,
    openModalCalendario,
    setOpenModalCalendario,
    openAlert,
    setOpenAlert,
    saving,
    alertMessage,
    alertSeverity,
    enableRosa,
    message,
    giornate,
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
    resetFormazione,
  } = useFormazioneState()

  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))

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
      <Grid item xs={12} md={6}>
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

  const modalWidth = isDesktop ? '1266px' : '98%'

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
            <Grid item xs={12}>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', md: 'center' }}
                spacing={1}
              >
                <Box>
                  {squadra && (
                    <Typography variant={isDesktop ? 'h4' : 'h6'} fontWeight="bold">
                      {squadra}
                    </Typography>
                  )}
                  <Typography variant={giornate.length > 0 ? 'h6' : 'h5'} sx={{ lineHeight: 2 }}>
                    <b>{giornate.length > 1 ? `${giornate[0]?.Title} / ${giornate[1]?.Title}` : giornate[0]?.Title}</b>
                  </Typography>
                </Box>
                <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
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
                  <Box component="form" onSubmit={handleSave} noValidate>
                    <Stack direction="row" spacing={1}>
                      <Button
                        type="submit"
                        disabled={saving}
                        endIcon={!saving ? <Save /> : <HourglassTop />}
                        variant="contained"
                        color="success"
                        size="medium"
                        sx={{ fontSize: { xs: '11px', md: '14px' } }}
                      >
                        {saving ? 'Attendere...' : 'Salva'}
                      </Button>
                    </Stack>
                  </Box>
                </Stack>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="h5">
                  Rosa ({rosa.length}) / Panchina ({panca.length})
                </Typography>
                <Typography variant="h5">{`Modulo: ${modulo}`}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
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
            <Grid item xs={12} minHeight={100}>
              <Button
                type="button"
                endIcon={<ResetTv />}
                variant="contained"
                onClick={() => resetFormazione()}
                color="info"
                size="medium"
                sx={{ fontSize: { xs: '10px', md: '14px' } }}
              >
                Reset
              </Button>
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
            <Typography variant={isDesktop ? 'h3' : 'h4'} color="error">
              {message}
            </Typography>
          </Grid>
        )}
      </Grid>

      <Modal
        title="Statistica giocatore"
        open={openModalCalendario}
        onClose={handleModalCalendarioClose}
        width={modalWidth}
        height="98%"
      >
        <Divider />
        <Box sx={{ mt: 1, gap: '0px', flexWrap: 'wrap' }}>
          {idGiocatoreStat !== undefined && (
            <Giocatore idGiocatore={idGiocatoreStat} />
          )}
        </Box>
      </Modal>
    </>
  )
}

export default Formazione
