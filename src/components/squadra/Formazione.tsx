'use client'
import {
  HourglassTop,
  ResetTv,
  Save,
} from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import React from 'react'
import Modal from '../modal/Modal'
import Giocatore from '../giocatori/Giocatore'
import { FormazioneRosaSection } from './FormazioneRosaSection'
import { FormazioneDisabilitata } from './FormazioneDisabilitata'
import { useFormazioneState } from './useFormazioneState'
import { api } from '~/utils/api'

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
    canConfirmPrecedente,
    confirmingPrecedente,
    handleConfirmPrecedente,
    formazioneGiaRilasciata,
  } = useFormazioneState()

  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))

  const formaQuery = api.squadre.getRosa.useQuery(
    { idSquadra, includeVenduti: false, includeForma: true },
    {
      enabled: idSquadra > 0,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )

  const formaMap = React.useMemo(() => {
    const map = new Map<number, { media: number | null; giocate: number }>()
    formaQuery.data?.forEach((f) => { if (f.forma) map.set(f.idGiocatore, f.forma) })
    return map
  }, [formaQuery.data])

  const rosaProps = {
    rosa,
    campo,
    panca,
    filterIcons,
    giornate,
    handleClickPlayer,
    setIdGiocatoreStat,
    setOpenModalCalendario,
    formaMap,
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
                    <Typography
                      variant={isDesktop ? 'h4' : 'h6'}
                      fontWeight="bold"
                    >
                      {squadra}
                    </Typography>
                  )}
                  <Typography
                    variant={giornate.length > 0 ? 'h6' : 'h5'}
                    sx={{ lineHeight: 2 }}
                  >
                    <b>
                      {giornate.length > 1
                        ? `${giornate[0]?.Title} / ${giornate[1]?.Title}`
                        : giornate[0]?.Title}
                    </b>
                  </Typography>
                </Box>
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  flexWrap="wrap"
                >
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
                      defaultValue={
                        giornate.length > 1 ? 0 : giornate[0]?.idTorneo
                      }
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
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="h5">
                  Rosa ({rosa.length}) / Panchina ({panca.length})
                </Typography>
                <Typography variant="h5">{`Modulo: ${modulo}`}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Grid container spacing={0}>
                <FormazioneRosaSection {...rosaProps} roles={['P']} title="Portieri" />
                <FormazioneRosaSection {...rosaProps} roles={['D']} title="Difensori" />
                <FormazioneRosaSection {...rosaProps} roles={['C']} title="Centrocampisti" />
                <FormazioneRosaSection {...rosaProps} roles={['A']} title="Attaccanti" />
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
          <FormazioneDisabilitata
            message={message}
            formazioneGiaRilasciata={formazioneGiaRilasciata}
            canConfirmPrecedente={canConfirmPrecedente}
            confirmingPrecedente={confirmingPrecedente}
            handleConfirmPrecedente={handleConfirmPrecedente}
            openAlert={openAlert}
            setOpenAlert={setOpenAlert}
            alertMessage={alertMessage}
            alertSeverity={alertSeverity}
          />
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
