'use client'
import {
  Box,
  Divider,
  Grid,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { api } from '~/utils/api'
import { formatDateFromIso } from '~/utils/dateUtils'
import { useMemo } from 'react'
import Modal from '../modal/Modal'
import {
  usePartitaFromSearchParams,
  useGiocatoreModal,
} from './usePartitaParams'
import Giocatore from '../giocatori/Giocatore'
import { parseMaglia } from '~/schemas/maglia'
import { FormazioneSquadra } from './FormazioneSquadra'

function ViewFormazioni() {
  const [partita, setPartita] = usePartitaFromSearchParams()
  const {
    idGiocatore,
    openModalCalendario,
    handleStatGiocatore,
    handleModalClose,
  } = useGiocatoreModal()

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
    () => parseMaglia(infoPartita?.magliaHome) ?? undefined,
    [infoPartita?.magliaHome],
  )
  const magliaAway = useMemo(
    () => parseMaglia(infoPartita?.magliaAway) ?? undefined,
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
                ${formatDateFromIso(calendario.data, 'DD/MM/YYYY')} alle 
                ${formatDateFromIso(calendario.data, 'HH:mm')}`}
              </Typography>
            </Grid>
            <Grid item xs={6} sx={{ pr: '10px' }}>
              {calendario && (
                <FormazioneSquadra
                  squadra={infoPartita?.squadraHome}
                  foto={infoPartita?.fotoHome}
                  maglia={magliaHome}
                  formazione={formazioneHome}
                  onStatGiocatore={handleStatGiocatore}
                />
              )}
            </Grid>
            <Grid item xs={6} sx={{ pl: '10px' }}>
              {calendario && (
                <FormazioneSquadra
                  squadra={infoPartita?.squadraAway}
                  foto={infoPartita?.fotoAway}
                  maglia={magliaAway}
                  formazione={formazioneAway}
                  onStatGiocatore={handleStatGiocatore}
                />
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
