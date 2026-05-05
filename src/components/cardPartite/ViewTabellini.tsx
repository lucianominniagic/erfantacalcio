'use client'
import {
  Divider,
  Grid,
  MenuItem,
  Select,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { api } from '~/utils/api'
import Modal from '../modal/Modal'
import {
  usePartitaFromSearchParams,
  useGiocatoreModal,
} from './usePartitaParams'
import Giocatore from '../giocatori/Giocatore'
import { parseMaglia } from '~/schemas/maglia'
import { TabellinoCard } from './TabellinoCard'

function ViewTabellini() {
  const [partita, setPartita] = usePartitaFromSearchParams()
  const {
    idGiocatore,
    openModalCalendario,
    handleStatGiocatore,
    handleModalClose,
  } = useGiocatoreModal()

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

  return (
    <>
      <Grid container spacing={0}>
        {calendario && (
          <>
            <Grid item xs={12}>
              <Typography variant={'h4'}>{calendario.Title}</Typography>
            </Grid>

            <Grid item xs={6} sx={isXs ? { pr: '1px' } : { pr: '10px' }}>
              <TabellinoCard
                tabellino={tabellinoHome}
                squadra={infoPartita?.squadraHome}
                foto={infoPartita?.fotoHome}
                maglia={parseMaglia(infoPartita?.magliaHome)}
                multa={infoPartita?.multaHome}
                onStatGiocatore={handleStatGiocatore}
              />
            </Grid>
            <Grid item xs={6} sx={isXs ? { pl: '1px' } : { pl: '10px' }}>
              <TabellinoCard
                tabellino={tabellinoAway}
                squadra={infoPartita?.squadraAway}
                foto={infoPartita?.fotoAway}
                maglia={parseMaglia(infoPartita?.magliaAway)}
                multa={infoPartita?.multaAway}
                onStatGiocatore={handleStatGiocatore}
              />
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
        {idGiocatore && <Giocatore idGiocatore={idGiocatore} />}
      </Modal>
    </>
  )
}

export default ViewTabellini
