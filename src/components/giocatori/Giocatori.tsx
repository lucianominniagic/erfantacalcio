'use client'

import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  InputAdornment,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useMediaQuery,
} from '@mui/material'
import { Close, ExpandMore, PersonSearch, Search } from '@mui/icons-material'
import { useId, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTheme } from '@mui/material/styles'
import { orpc } from '~/utils/orpc'
import GenericAutocomplete from '~/components/autocomplete/GenericAutocomplete'
import { type Ruoli } from '~/types/common'
import { getRuoloEsteso } from '~/utils/formazione'
import Giocatore from '~/components/giocatori/Giocatore'
import GiocatoriRankingList from '~/components/giocatori/GiocatoriRankingList'
import PageHeader from '~/components/PageHeader'
import {
  filtraOrdinaGiocatori,
  type OrdinamentoGiocatori,
} from '~/components/giocatori/giocatoriRanking'

const ruoli: Ruoli[] = ['P', 'D', 'C', 'A']

export default function Giocatori() {
  const id = useId()
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))
  const [selectedGiocatoreId, setSelectedGiocatoreId] = useState<number>()
  const [openModal, setOpenModal] = useState(false)
  const [soloSvincolati, setSoloSvincolati] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [ricerca, setRicerca] = useState('')
  const [ruolo, setRuolo] = useState<Ruoli>('C')
  const [ordinamento, setOrdinamento] = useState<OrdinamentoGiocatori>('media')
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
      input: { ruolo, soloSvincolati },
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
  )
  const giocatori = filtraOrdinaGiocatori(
    giocatoriStats.data ?? [],
    ricerca,
    ordinamento,
    ruolo,
  )
  function apriGiocatore(giocatoreId: number) {
    setSelectedGiocatoreId(giocatoreId)
    setOpenModal(true)
  }

  return (
    <Box
      sx={{
        width: '100%',
        minWidth: 0,
        maxWidth: 1100,
        mx: 'auto',
        overflowWrap: 'anywhere',
      }}
    >
      <PageHeader title="Statistiche Giocatori" Icon={PersonSearch} />
      <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
        <ToggleButtonGroup
          exclusive
          fullWidth
          value={ruolo}
          onChange={(_, value: Ruoli | null) => {
            if (value) setRuolo(value)
          }}
          aria-label="Ruolo giocatore"
        >
          {ruoli.map((r) => (
            <ToggleButton
              key={r}
              value={r}
              aria-label={getRuoloEsteso(r, true)}
              sx={{ minHeight: 44, fontWeight: 800, flex: 1, minWidth: 0 }}
            >
              {r}
              <Box
                component="span"
                sx={{ display: { xs: 'none', md: 'inline' }, ml: 1 }}
              >
                {getRuoloEsteso(r, true)}
              </Box>
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
        <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            size="small"
            label="Filtra nome, club o squadra fantasy"
            value={ricerca}
            onChange={(e) => setRicerca(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
          />
          <TextField
            select
            size="small"
            label="Ordina per"
            value={ordinamento}
            onChange={(e) => {
              const value = e.target.value
              if (value === 'media' || value === 'presenze' || value === 'gol')
                setOrdinamento(value)
            }}
            sx={{ minWidth: 170 }}
          >
            <MenuItem value="media">Media voto</MenuItem>
            <MenuItem value="presenze">Presenze</MenuItem>
            <MenuItem value="gol">
              {ruolo === 'P' ? 'Meno gol subiti' : 'Gol segnati'}
            </MenuItem>
          </TextField>
        </Stack>
        <FormControlLabel
          control={
            <Switch
              checked={soloSvincolati}
              onChange={(e) => setSoloSvincolati(e.target.checked)}
            />
          }
          label="Solo svincolati"
          sx={{ mt: 1 }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block' }}
        >
          Filtri e ordinamento si applicano ai giocatori caricati per il ruolo,
          con la soglia presenze prevista dalla lega.
        </Typography>
      </Paper>
      <Accordion disableGutters elevation={0} variant="outlined" sx={{ mb: 3 }}>
        <AccordionSummary
          expandIcon={<ExpandMore />}
          id={`${id}-ricerca`}
          aria-controls={`${id}-ricerca-contenuto`}
        >
          <Typography variant="body2">
            Cerchi un giocatore fuori da questa lista?
          </Typography>
        </AccordionSummary>
        <AccordionDetails id={`${id}-ricerca-contenuto`}>
          <GenericAutocomplete
            label="Cerca in tutti i giocatori"
            placeholder="Digita almeno 2 caratteri"
            width="100%"
            onItemSelected={(selectedId) => {
              if (typeof selectedId === 'number') apriGiocatore(selectedId)
            }}
            items={giocatoriSearch.data ?? []}
            loading={giocatoriSearch.isFetching}
            onInputChange={setSearchInput}
            filterOptions={(options) => options}
            allowCustomInput={false}
            freeSolo={false}
          />
          {giocatoriSearch.isError && (
            <Alert severity="error" sx={{ mt: 1 }}>
              Impossibile cercare i giocatori: {giocatoriSearch.error.message}
            </Alert>
          )}
        </AccordionDetails>
      </Accordion>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="baseline"
        gap={1}
        sx={{ mb: 1.5 }}
      >
        <Typography variant="h6" component="h2">
          {getRuoloEsteso(ruolo, true)}
        </Typography>
        {!giocatoriStats.isLoading && !giocatoriStats.isError && (
          <Typography variant="caption" color="text.secondary" role="status">
            {giocatori.length} risultati ·{' '}
            {ordinamento === 'media'
              ? 'media'
              : ordinamento === 'presenze'
                ? 'presenze'
                : 'gol'}
          </Typography>
        )}
      </Stack>
      {giocatoriStats.isError ? (
        <Alert severity="error">
          Impossibile caricare le statistiche: {giocatoriStats.error.message}
        </Alert>
      ) : (
        <Paper variant="outlined">
          <GiocatoriRankingList
            giocatori={giocatori}
            isLoading={giocatoriStats.isLoading}
            onNomeClick={apriGiocatore}
            ruolo={ruolo}
          />
        </Paper>
      )}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mt: 2 }}
      >
        Tocca un giocatore per aprire le statistiche dettagliate. Media voto su
        scala 0–10.
      </Typography>
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        fullScreen={isXs}
        maxWidth={false}
        aria-labelledby={`${id}-scheda-titolo`}
        PaperProps={{ sx: { width: 1266, maxWidth: '100%' } }}
      >
        <DialogTitle id={`${id}-scheda-titolo`} sx={{ pr: 7 }}>
          Statistica giocatore
          <IconButton
            aria-label="Chiudi scheda giocatore"
            onClick={() => setOpenModal(false)}
            sx={{ position: 'absolute', top: 8, right: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedGiocatoreId !== undefined && (
            <Giocatore idGiocatore={selectedGiocatoreId} />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  )
}
