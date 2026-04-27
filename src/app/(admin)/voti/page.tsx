'use client'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import GenericAutocomplete, {
  type AutocompleteOption,
} from '~/components/autocomplete/GenericAutocomplete'
import { api } from '~/utils/api'
import CheckIcon from '@mui/icons-material/CheckCircle'
import { type votoType, type votoListType } from '~/types/voti'
import Modal from '~/components/modal/Modal'
import { Configurazione } from '~/config'
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
} from '@mui/x-data-grid'
import { autosizeOptions } from '~/utils/datatable'
import { Edit } from '@mui/icons-material'
import { votoSchema } from '~/schemas/giocatore'

export default function Voti() {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))
  const [openModalEdit, setOpenModalEdit] = useState(false)
  const [selectedGiocatoreId, setSelectedGiocatoreId] = useState<number>()
  const [selectedVotoId, setSelectedVotoId] = useState<number>()
  const votiList = api.voti.list.useQuery(
    { idGiocatore: selectedGiocatoreId! },
    { enabled: !!selectedGiocatoreId },
  )
  const giocatoriList = api.giocatori.listAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
  const votoOne = api.voti.get.useQuery(
    { idVoto: selectedVotoId! },
    {
      enabled: !!selectedVotoId,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const [giocatori, setGiocatori] = useState<AutocompleteOption[]>([])
  const [voti, setVoti] = useState<votoListType[]>([])
  const votoUpdate = api.voti.update.useMutation({
    onSuccess: async () => {
      await votiList.refetch()
    },
  })
  const [errorMessageVoto, setErrorMessageVoto] = useState('')
  const [messageVoto, setMessageVoto] = useState('')
  const [voto, setVoto] = useState<votoType>({
    idVoto: 0,
    voto: 0,
    nome: '',
    ruolo: '',
    ammonizione: 0,
    espulsione: 0,
    gol: 0,
    assist: 0,
    autogol: 0,
    altriBonus: 0,
  })
  const pageSize = 10

  const columns: GridColDef[] = [
    { field: 'id', type: 'number', hideable: true },
    {
      field: 'giornataSerieA',
      type: 'number',
      renderHeader: () => <strong>Giornata Serie A</strong>,
      flex: isXs ? 0 : 1,
    },
    {
      field: 'torneo',
      type: 'string',
      renderHeader: () => <strong>Torneo</strong>,
      flex: isXs ? 0 : 1,
    },
    {
      field: 'voto',
      type: 'number',
      renderHeader: () => <strong>Voto</strong>,
      flex: isXs ? 0 : 1,
    },
    {
      field: 'gol',
      type: 'number',
      renderHeader: () => <strong>Gol</strong>,
      flex: isXs ? 0 : 1,
    },
    {
      field: 'assist',
      type: 'number',
      renderHeader: () => <strong>Assist</strong>,
      flex: isXs ? 0 : 1,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            key={1}
            icon={<Edit color="action" />}
            label="Edit"
            className="textPrimary"
            onClick={() => handleEditVoto(parseInt(id.toString(), 10))}
            color="inherit"
          />,
        ]
      },
    },
  ]

  const skeletonRows = Array.from({ length: pageSize }, (_, index) => ({
    id: `skeleton-${index}`,
  }))

  useEffect(() => {
    if (votiList.data) {
      setVoti(votiList.data)
    }
  }, [votiList.data])

  useEffect(() => {
    if (giocatoriList.data) {
      setGiocatori(giocatoriList.data)
    }
  }, [giocatoriList.data])

  useEffect(() => {
    if (!votoOne.isFetching && votoOne.isSuccess && votoOne.data) {
      setVoto(votoOne.data)
      setErrorMessageVoto('')
      setMessageVoto('')
      setOpenModalEdit(true)
      document?.getElementById('voto')?.focus()
    }
  }, [votoOne.data, votoOne.isSuccess, votoOne.isFetching])

  const handleGiocatoreSelected = async (idGiocatore: number | undefined) => {
    setSelectedGiocatoreId(idGiocatore)
    setSelectedVotoId(undefined)
    await handleCancelVoto()
  }

  //#region voto

  const handleCancelVoto = async () => {
    setSelectedVotoId(undefined)
    document?.getElementById('search_items')?.focus()
  }

  const handleEditVoto = async (_idVoto: number) => {
    setSelectedVotoId(_idVoto)
  }

  const handleUpdateVoto = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    console.log('selectedGiocatoreId:', selectedGiocatoreId)
    setErrorMessageVoto('')
    setMessageVoto('')
    const responseVal = votoSchema.safeParse(voto)

    if (!responseVal.success) {
      setErrorMessageVoto(
        responseVal.error.issues
          .map(
            (issue) => `campo ${issue.path.toLocaleString()}: ${issue.message}`,
          )
          .join(', '),
      )
    } else if (voto.ammonizione !== 0 && voto.espulsione !== 0) {
      setErrorMessageVoto('Selezionare ammonizione o espulsione')
    } else {
      try {
        await votoUpdate.mutateAsync({
          idVoto: voto.idVoto,
          ruolo: voto.ruolo,
          voto: voto.voto ?? 0,
          ammonizione: voto.ammonizione,
          espulsione: voto.espulsione,
          gol: voto.gol ?? 0,
          assist: voto.assist ?? 0,
          autogol: voto.autogol ?? 0,
          altriBonus: voto.altriBonus ?? 0,
        })
        setSelectedVotoId(undefined)
        setMessageVoto('Salvataggio completato')
      } catch (error) {
        setErrorMessageVoto(
          'Si è verificato un errore nel salvataggio del voto giocatore',
        )
      }
    }
  }

  //#endregion voto

  const handleModalClose = async () => {
    setOpenModalEdit(false)
    await handleCancelVoto()
  }

  return (
    <>
      <Stack direction="column" spacing={1} justifyContent="space-between">
        <Typography variant="h5">Gestione voti</Typography>
        <GenericAutocomplete
          onItemSelected={(id, text) => {
            const numericId = typeof id === 'number' ? id : undefined
            handleGiocatoreSelected(numericId)
          }}
          items={giocatori ?? []}
        />
        {votiList.isLoading &&
        !votiList.isSuccess &&
        selectedGiocatoreId !== undefined ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
            }}
          >
            <CircularProgress color="info" />
          </div>
        ) : selectedGiocatoreId === undefined ? (
          <span></span>
        ) : (
          <>
            <Box
              sx={{ width: '100%', overflowX: 'auto', contain: 'inline-size' }}
            >
              <DataGrid
                columnHeaderHeight={45}
                rowHeight={40}
                loading={votiList.isLoading}
                initialState={{
                  columns: {
                    columnVisibilityModel: {
                      id: false,
                    },
                  },
                  pagination: {
                    paginationModel: {
                      pageSize: 15,
                    },
                  },
                  filter: undefined,
                  density: 'compact',
                }}
                slotProps={{
                  loadingOverlay: {
                    variant: 'skeleton',
                  },
                }}
                checkboxSelection={false}
                disableColumnFilter={true}
                disableColumnMenu={true}
                disableColumnSelector={true}
                disableColumnSorting={false}
                disableColumnResize={true}
                hideFooter={false}
                hideFooterPagination={false}
                pageSizeOptions={[5, 10, 20]}
                paginationMode="client"
                pagination={true}
                hideFooterSelectedRowCount={true}
                columns={columns}
                rows={votiList.isLoading ? skeletonRows : voti}
                disableRowSelectionOnClick={true}
                autosizeOptions={autosizeOptions}
                sx={{
                  backgroundColor: theme.palette.background.paper,
                  '& .MuiDataGrid-columnHeader': {
                    color: theme.palette.primary.light,
                    backgroundColor: theme.palette.primary.dark,
                  },
                }}
              />
            </Box>
          </>
        )}
      </Stack>

      <Modal
        title={`Modifica voto ${voto.nome}`}
        open={openModalEdit}
        onClose={handleModalClose}
      >
        <Divider />
        <Box
          component="form"
          onSubmit={handleUpdateVoto}
          noValidate
          sx={{ mt: 1 }}
        >
          <Grid container spacing={0}>
            <Grid item xs={12}>
              {errorMessageVoto && (
                <Stack sx={{ width: '100%' }} spacing={0}>
                  <Alert
                    icon={<CheckIcon fontSize="inherit" />}
                    severity="error"
                  >
                    {errorMessageVoto}
                  </Alert>
                </Stack>
              )}
            </Grid>

            <Grid item xs={12}>
              <Stack direction="row" spacing={1} justifyContent="flex-start">
                <TextField
                  margin="normal"
                  size="small"
                  variant="outlined"
                  required
                  type="number"
                  sx={{ m: 2 }}
                  label="Voto"
                  name="voto"
                  value={voto?.voto}
                  onChange={(event) => {
                    const newValue = parseFloat(event.target.value)
                    setVoto((prev) => ({
                      ...prev,
                      voto: newValue,
                    }))
                  }}
                />
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                  <InputLabel id="select-label-gol">Gol</InputLabel>
                  <Select
                    size="small"
                    variant="outlined"
                    labelId="select-label-gol"
                    label="Gol"
                    sx={{ m: 0, width: '120px' }}
                    name="slcGol"
                    value={voto?.gol}
                    onChange={(event) => {
                      const newValue =
                        typeof event.target.value === 'string'
                          ? 0
                          : event.target.value
                      setVoto((prev) => ({
                        ...prev,
                        gol: newValue,
                      }))
                    }}
                  >
                    {[...Array(6).keys()].map((i) => (
                      <MenuItem
                        key={`slc_gol_${i}`}
                        value={i}
                        sx={{ color: 'black' }}
                      >
                        {i}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                  <InputLabel id="select-label-assist">Assist</InputLabel>
                  <Select
                    size="small"
                    variant="outlined"
                    labelId="select-label-assist"
                    label="Assist"
                    sx={{ m: 0, width: '120px' }}
                    name="slcAssist"
                    value={voto?.assist}
                    onChange={(event) => {
                      const newValue =
                        typeof event.target.value === 'string'
                          ? 0
                          : event.target.value
                      setVoto((prev) => ({
                        ...prev,
                        assist: newValue,
                      }))
                    }}
                  >
                    {[...Array(6).keys()].map((i) => (
                      <MenuItem
                        key={`slc_gol_${i}`}
                        value={i}
                        sx={{ color: 'black' }}
                      >
                        {i}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} justifyContent="flex-start">
                <FormControlLabel
                  control={
                    <Switch
                      color="info"
                      checked={voto.ammonizione !== 0}
                      onChange={(event) => {
                        const newValue = event.target.checked
                          ? Configurazione.bonusAmmonizione
                          : 0
                        setVoto((prev) => ({
                          ...prev,
                          ammonizione: newValue,
                        }))
                      }}
                    />
                  }
                  label="Ammonizione"
                />
                <FormControlLabel
                  control={
                    <Switch
                      color="error"
                      checked={voto.espulsione !== 0}
                      onChange={(event) => {
                        const newValue = event.target.checked
                          ? Configurazione.bonusEspulsione
                          : 0
                        setVoto((prev) => ({
                          ...prev,
                          espulsione: newValue,
                        }))
                      }}
                    />
                  }
                  label="Espulsione"
                />
              </Stack>
            </Grid>
            <Grid item xs={12}>
              <Stack direction="row" spacing={1} justifyContent="flex-start">
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                  <InputLabel id="select-label-autogol">Autogol</InputLabel>
                  <Select
                    size="small"
                    variant="outlined"
                    labelId="select-label-autogol"
                    label="Autogol"
                    sx={{ m: 0, width: '120px' }}
                    name="slcAutogol"
                    value={voto?.autogol}
                    onChange={(event) => {
                      const newValue =
                        typeof event.target.value === 'string'
                          ? 0
                          : event.target.value
                      setVoto((prev) => ({
                        ...prev,
                        autogol: newValue,
                      }))
                    }}
                  >
                    {[...Array(2).keys()].map((i) => (
                      <MenuItem
                        key={`slc_gol_${i}`}
                        value={i}
                        sx={{ color: 'black' }}
                      >
                        {i}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  margin="normal"
                  size="small"
                  variant="outlined"
                  required
                  type="number"
                  sx={{ m: 2 }}
                  label="Altri bonus"
                  name="altribonus"
                  value={voto?.altriBonus}
                  onChange={(event) => {
                    const newValue = parseFloat(event.target.value)
                    setVoto((prev) => ({
                      ...prev,
                      altriBonus: newValue,
                    }))
                  }}
                />
              </Stack>
            </Grid>
            <Grid item xs={5}>
              <Button
                type="submit"
                fullWidth
                color="info"
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Aggiorna dati
              </Button>
            </Grid>
            <Grid item xs={2}></Grid>
            <Grid item xs={5}>
              <Button
                type="button"
                onClick={handleModalClose}
                fullWidth
                color="warning"
                variant="outlined"
                sx={{ mt: 3, mb: 2 }}
              >
                Chiudi
              </Button>
            </Grid>
            <Grid item xs={12}>
              {messageVoto && (
                <Stack sx={{ width: '100%' }} spacing={0}>
                  <Alert
                    icon={<CheckIcon fontSize="inherit" />}
                    severity="success"
                  >
                    {messageVoto}
                  </Alert>
                </Stack>
              )}
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </>
  )
}
