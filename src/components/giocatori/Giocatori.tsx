'use client'
import {
  Box,
  Divider,
  FormControlLabel,
  Grid,
  Switch,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '~/utils/orpc'
import { useTheme } from '@mui/material/styles'
import GenericAutocomplete from '~/components/autocomplete/GenericAutocomplete'
import { type Ruoli } from '~/types/common'
import { getRuoloEsteso } from '~/utils/helper'
import Modal from '../modal/Modal'
import Giocatore from './Giocatore'
import GiocatoriRankingList from '~/components/giocatori/GiocatoriRankingList'

function Giocatori() {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))

  const [selectedGiocatoreId, setSelectedGiocatoreId] = useState<number>()
  const [openModalCalendario, setOpenModalCalendario] = useState(false)
  const [soloSvincolati, setSoloSvincolati] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [ruolo, setRuolo] = useState<Ruoli>('C')
  const giocatoriSearch = useQuery(
    orpc.giocatori.search.queryOptions({
      input: { query: searchInput },
      enabled: searchInput.length >= 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
  )
  const giocatoriStats = useQuery(
    orpc.giocatori.listStatistiche.queryOptions({
      input: { ruolo: ruolo, soloSvincolati: soloSvincolati },
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
  )

  const handleGiocatoreSelected = async (idGiocatore: number | undefined) => {
    if (idGiocatore === undefined) return
    setSelectedGiocatoreId(idGiocatore)
    setOpenModalCalendario(true)
  }

  const handleModalClose = () => {
    setOpenModalCalendario(false)
  }

  return (
    <>
      <Grid container spacing={1} paddingTop={2} paddingBottom={2}>
        <Grid item xs={12}>
          <Typography variant="h4">Statistiche Giocatori</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch
                color="warning"
                onChange={() => setRuolo('P')}
                checked={ruolo === 'P'}
              />
            }
            label={isXs ? 'P' : getRuoloEsteso('P', true)}
          />
          <FormControlLabel
            control={
              <Switch
                color="warning"
                onChange={() => setRuolo('D')}
                checked={ruolo === 'D'}
              />
            }
            label={isXs ? 'D' : getRuoloEsteso('D', true)}
          />
          <FormControlLabel
            control={
              <Switch
                color="warning"
                onChange={() => setRuolo('C')}
                checked={ruolo === 'C'}
              />
            }
            label={isXs ? 'C' : getRuoloEsteso('C', true)}
          />
          <FormControlLabel
            control={
              <Switch
                color="warning"
                onChange={() => setRuolo('A')}
                checked={ruolo === 'A'}
              />
            }
            label={isXs ? 'A' : getRuoloEsteso('A', true)}
          />
          <FormControlLabel
            control={
              <Switch
                onChange={(e) => setSoloSvincolati(e.target.checked)}
                checked={soloSvincolati}
              />
            }
            label="Solo svincolati"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <GenericAutocomplete
            onItemSelected={(id, text) => {
              const numericId = typeof id === 'number' ? id : undefined
              handleGiocatoreSelected(numericId)
            }}
            items={giocatoriSearch.data ?? []}
            loading={giocatoriSearch.isFetching}
            onInputChange={setSearchInput}
            filterOptions={(x) => x}
            allowCustomInput={false}
          />
        </Grid>
        <Grid item xs={12} sx={{ minHeight: 500 }}>
          <Typography variant="h5">
            Top {getRuoloEsteso(ruolo, true)}
          </Typography>
          <Box sx={{ width: '100%', mt: 1 }}>
            <GiocatoriRankingList
              giocatori={giocatoriStats.data ?? []}
              isLoading={giocatoriStats.isLoading}
              onNomeClick={(id) => {
                setSelectedGiocatoreId(id)
                setOpenModalCalendario(true)
              }}
              ruolo={ruolo}
            />
          </Box>
        </Grid>
        <Grid item xs={12} minHeight={30}></Grid>
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
          {selectedGiocatoreId !== undefined && (
            <Giocatore idGiocatore={selectedGiocatoreId} />
          )}
        </Box>
      </Modal>

    </>
  )
}

export default Giocatori
