'use client'
import {
  Alert,
  Box,
  Button,
  Grid,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Paper,
  useTheme,
} from '@mui/material'
import { useEffect, useState } from 'react'
import { z } from 'zod'
import GenericAutocomplete, {
  type AutocompleteOption,
} from '~/components/autocomplete/GenericAutocomplete'
import { GenericCard } from '~/components/cards'
import { type GiocatoreType } from '~/types/giocatori'
import {
  type trasferimentoType,
  type trasferimentoListType,
} from '~/types/trasferimenti'
import { api } from '~/utils/api'
import { ruoliList, getRuoloEsteso } from '~/utils/helper'
import CheckIcon from '@mui/icons-material/CheckCircle'
import { Configurazione } from '~/config'
import dayjs from 'dayjs'
import { convertFromIsoToDatetimeMUI } from '~/utils/dateUtils'
import { DataGrid, GridActionsCellItem, GridColDef } from '@mui/x-data-grid'
import { BarChartOutlined, PersonSearch } from '@mui/icons-material'
import PageHeader from '~/components/PageHeader'
import { giocatoreSchema, trasferimentoSchema } from '~/schemas/giocatore'
import LoadingSpinner from '~/components/LinearProgressBar/LoadingSpinner'

export default function Giocatori() {
  const theme = useTheme()

  const [selectedGiocatoreId, setSelectedGiocatoreId] = useState<number>()
  const [selectedGiocatore, setSelectedGiocatore] = useState<string>()
  const [selectedTrasferimentoId, setSelectedTrasferimentoId] =
    useState<number>()
  const [selectedTrasferimentoStagione, setSelectedTrasferimentoStagione] =
    useState<string>()
  const [giocatori, setGiocatori] = useState<AutocompleteOption[]>([])
  const [squadre, setSquadre] = useState<AutocompleteOption[]>([])
  const [squadreSerieA, setSquadreSerieA] = useState<AutocompleteOption[]>([])
  const [trasferimenti, setTrasferimenti] = useState<trasferimentoListType[]>(
    [],
  )
  const [errorMessageGiocatore, setErrorMessageGiocatore] = useState('')
  const [messageGiocatore, setMessageGiocatore] = useState('')
  const [errorMessageTrasferimento, setErrorMessageTrasferimento] = useState('')
  const [messageTrasferimento, setMessageTrasferimento] = useState('')
  const defaultGiocatore: GiocatoreType = {
    idGiocatore: 0,
    nome: '',
    nomeFantagazzetta: '',
    ruolo: 'P',
  }
  const [giocatore, setGiocatore] = useState<GiocatoreType>(defaultGiocatore)
  const defaultTrasferimento: trasferimentoType = {
    idTrasferimento: 0,
    idGiocatore: 0,
    idSquadra: null,
    idSquadraSerieA: null,
    costo: 0,
    dataAcquisto: dayjs(new Date()).toDate(),
    dataCessione: null,
  }
  const [trasferimento, setTrasferimento] =
    useState<trasferimentoType>(defaultTrasferimento)

  const trasferimentiList = api.trasferimenti.list.useQuery(
    { idGiocatore: selectedGiocatoreId! },
    { enabled: !!selectedGiocatoreId },
  )
  const giocatoriList = api.giocatori.listAll.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
  const giocatoreOne = api.giocatori.get.useQuery(
    { idGiocatore: selectedGiocatoreId! },
    {
      enabled: !!selectedGiocatoreId,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const squadreList = api.squadre.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
  const squadreSerieAList = api.squadreSerieA.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
  const giocatoreUpsert = api.giocatori.upsert.useMutation({
    onSuccess: async () => {
      await giocatoriList.refetch()
    },
  })
  const giocatoreDelete = api.giocatori.delete.useMutation({
    onSuccess: async () => {
      await giocatoriList.refetch()
      await trasferimentiList.refetch()
    },
  })
  const trasferimentoOne = api.trasferimenti.get.useQuery(
    { idTrasferimento: selectedTrasferimentoId! },
    {
      enabled: !!selectedTrasferimentoId,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const trasferimentoUpsert = api.trasferimenti.upsert.useMutation({
    onSuccess: async () => {
      await trasferimentiList.refetch()
    },
  })
  const trasferimentoDelete = api.trasferimenti.delete.useMutation({
    onSuccess: async () => {
      await trasferimentiList.refetch()
    },
  })
  

  const columns: GridColDef[] = [
    { field: 'id', hideable: true },
    {
      field: 'id_pf',
      type: 'string',
      align: 'left',
      renderHeader: () => <strong>ID P.F.</strong>,
      flex: 1,
      sortable: true,
    },
    {
      field: 'ruolo',
      type: 'string',
      align: 'left',
      renderHeader: () => <strong>Ruolo</strong>,
      flex: 1,
      sortable: true,
    },
    {
      field: 'squadra',
      type: 'string',
      align: 'left',
      renderHeader: () => <strong>Squadra</strong>,
      flex: 1,
      sortable: true,
    },
    {
      field: 'squadraSerieA',
      type: 'string',
      align: 'left',
      renderHeader: () => <strong>Squadra serie A</strong>,
      flex: 1,
      sortable: true,
    },
    {
      field: 'dataAcquisto',
      type: 'date',
      align: 'left',
      renderHeader: () => <strong>Data acquisto</strong>,
      flex: 1,
      sortable: true,
    },
    {
      field: 'dataCessione',
      type: 'date',
      align: 'left',
      renderHeader: () => <strong>Data cessione</strong>,
      flex: 1,
      sortable: true,
    },
    {
      field: 'stagione',
      type: 'string',
      align: 'left',
      renderHeader: () => <strong>Stagione</strong>,
      flex: 1,
      sortable: true,
    },
    {
      field: 'costo',
      type: 'number',
      align: 'right',
      renderHeader: () => <strong>Costo</strong>,
      flex: 1,
      sortable: true,
    },
    {
      field: 'actions',
      type: 'actions',
      getActions: (params) => {
        if (params.row['stagione'] === Configurazione.stagione) {
          return [
            <GridActionsCellItem
              key={params.id}
              icon={<BarChartOutlined color="success" />}
              label="Vedi giocatore"
              onClick={() =>
                handleEditTrasferimento(params.id as number)
              }
            />,
          ];
        }
        return []; // Nessuna azione se la stagione non è quella specificata
      },
      width: 100,
    },
  ]

  const pageSize = 5

  const skeletonRows = Array.from({ length: pageSize }, (_, index) => ({
    id: `skeleton-${index}`,
  }))

  useEffect(() => {
    if (trasferimentiList.data) {
      setTrasferimenti(trasferimentiList.data)
    }
  }, [trasferimentiList.data])

  useEffect(() => {
    if (giocatoriList.data) {
      setGiocatori(giocatoriList.data)
    }
  }, [giocatoriList.data])

  useEffect(() => {
    if (squadreList.data) {
      const newData: AutocompleteOption[] = [
        { id: 0, label: '' },
        ...squadreList.data.map((item) => ({
          id: item.id,
          label: item.squadra,
        })),
      ]
      setSquadre(newData)
    }
  }, [squadreList.data])

  useEffect(() => {
    if (squadreSerieAList.data) {
      const newData: AutocompleteOption[] = [
        { id: 0, label: '' },
        ...squadreSerieAList.data.map((item) => ({
          id: item.idSquadraSerieA,
          label: item.nome,
        })),
      ]
      setSquadreSerieA(newData)
    }
  }, [squadreSerieAList.data])

  useEffect(() => {
    if (
      !giocatoreOne.isFetching &&
      giocatoreOne.isSuccess &&
      giocatoreOne.data
    ) {
      setGiocatore(giocatoreOne.data)
      setErrorMessageGiocatore('')
      setMessageGiocatore('')
    }
  }, [giocatoreOne.data, giocatoreOne.isSuccess, giocatoreOne.isFetching])

  useEffect(() => {
    if (
      !trasferimentoOne.isFetching &&
      trasferimentoOne.isSuccess &&
      trasferimentoOne.data
    ) {
      setTrasferimento(trasferimentoOne.data)
      setErrorMessageTrasferimento('')
      setMessageTrasferimento('')
    }
  }, [
    trasferimentoOne.data,
    trasferimentoOne.isSuccess,
    trasferimentoOne.isFetching,
  ])

  //#region anagrafica

  const handleGiocatoreSelected = async (
    idGiocatore: number | undefined,
    nome: string | undefined,
  ) => {
    setSelectedGiocatoreId(idGiocatore)
    setSelectedGiocatore(nome)
    setSelectedTrasferimentoId(undefined)
    setSelectedTrasferimentoStagione(Configurazione.stagione)
    setGiocatore(defaultGiocatore)
    await handleCancelTrasferimento()
  }

  const handleCancelGiocatore = async () => {
    setGiocatore(defaultGiocatore)
    setSelectedGiocatoreId(undefined)
    setSelectedGiocatore(undefined)
    setSelectedTrasferimentoId(undefined)
    setSelectedTrasferimentoStagione(Configurazione.stagione)
    document?.getElementById('search_items')?.focus()
  }

  const handleUpsertGiocatore = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    setErrorMessageGiocatore('')
    setMessageGiocatore('')
    const responseVal = giocatoreSchema.safeParse(giocatore)
    if (!responseVal.success) {
      setErrorMessageGiocatore(
        responseVal.error.issues
          .map(
            (issue) => `campo ${issue.path.toLocaleString()}: ${issue.message}`,
          )
          .join(', '),
      )
    } else {
      try {
        const idGiocatore = await giocatoreUpsert.mutateAsync({
          idGiocatore: giocatore.idGiocatore,
          nome: giocatore.nome,
          nomeFantagazzetta: giocatore.nomeFantagazzetta,
          ruolo: giocatore.ruolo,
        })
        setSelectedGiocatoreId(idGiocatore)
        setSelectedTrasferimentoStagione(Configurazione.stagione)
        setMessageGiocatore('Salvataggio completato')
        document?.getElementById('costo')?.focus()
      } catch (error) {
        setErrorMessageGiocatore(
          "Si è verificato un errore nel salvataggio dell'anagrafica giocatore",
        )
      }
    }
  }

  const handleDeleteGiocatore = async () => {
    setErrorMessageGiocatore('')
    setMessageGiocatore('')
    if (selectedGiocatoreId) {
      try {
        await giocatoreDelete.mutateAsync(selectedGiocatoreId)
        await handleCancelGiocatore()
        setMessageGiocatore('Eliminazione completata')
        document?.getElementById('search_items')?.focus()
      } catch (error) {
        setErrorMessageGiocatore(
          "Si è verificato un errore nell'eliminazione del giocatore",
        )
      }
    }
  }

  //#endregion anagrafica

  //#region trasferimento

  const handleCancelTrasferimento = async () => {
    setSelectedTrasferimentoId(undefined)
    setSelectedTrasferimentoStagione(Configurazione.stagione)
    setTrasferimento(defaultTrasferimento)
    document?.getElementById('search_items')?.focus()
  }

  const handleEditTrasferimento = async (
    _idTrasferimento: number
  ) => {
    setSelectedTrasferimentoId(_idTrasferimento)
    
    document?.getElementById('costo')?.focus()
  }

  const handleUpsertTrasferimento = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    setErrorMessageTrasferimento('')
    setMessageTrasferimento('')
    const responseVal = trasferimentoSchema.safeParse(trasferimento)
    if (!responseVal.success) {
      setErrorMessageTrasferimento(
        responseVal.error.issues
          .map(
            (issue) => `campo ${issue.path.toLocaleString()}: ${issue.message}`,
          )
          .join(', '),
      )
    } else {
      try {
        const idTrasferimento = await trasferimentoUpsert.mutateAsync({
          idTrasferimento: trasferimento.idTrasferimento,
          idGiocatore: selectedGiocatoreId ?? 0,
          idSquadra: trasferimento.idSquadra,
          idSquadraSerieA: trasferimento.idSquadraSerieA,
          costo: trasferimento.costo,
          dataAcquisto: trasferimento.dataAcquisto,
          dataCessione: trasferimento.dataCessione,
        })
        setSelectedTrasferimentoId(idTrasferimento)
        setSelectedTrasferimentoStagione(Configurazione.stagione)
        setMessageTrasferimento('Salvataggio completato')
        //document?.getElementById("search_items")?.focus();
      } catch (error) {
        setErrorMessageTrasferimento(
          'Si è verificato un errore nel salvataggio del trasferimento giocatore',
        )
      }
    }
  }

  const handleDeleteTrasferimento = async () => {
    setErrorMessageTrasferimento('')
    setMessageTrasferimento('')
    try {
      await trasferimentoDelete.mutateAsync(trasferimento.idTrasferimento)
      await handleCancelTrasferimento()
      setMessageTrasferimento('Eliminazione completata')
      document?.getElementById('search_items')?.focus()
    } catch (error) {
      setErrorMessageTrasferimento(
        "Si è verificato un errore nell'eliminazione del trasferimento",
      )
    }
  }

  //#endregion trasferimento

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    form: 'anagrafica' | 'trasferimento',
  ) => {
    const { name, value, type, checked } = event.currentTarget
    if (form === 'anagrafica')
      setGiocatore((prevState) => ({
        ...prevState,
        [name]:
          type === 'number'
            ? +value
            : type === 'checkbox'
              ? checked
              : type === 'datetime-local'
                ? dayjs(value).toDate()
                : value,
      }))
    if (form === 'trasferimento')
      setTrasferimento((prevState) => ({
        ...prevState,
        [name]:
          type === 'number'
            ? +value
            : type === 'checkbox'
              ? checked
              : type === 'datetime-local'
                ? dayjs(value).toDate()
                : value,
      }))
  }

  const handleSelectChange = (
    event: SelectChangeEvent,
    form: 'anagrafica' | 'trasferimento',
  ) => {
    if (form === 'anagrafica')
      setGiocatore((prevState) => ({
        ...prevState,
        [event.target.name]: event.target.value,
      }))
    if (form === 'trasferimento')
      setTrasferimento((prevState) => ({
        ...prevState,
        [event.target.name]:
          event.target.value === '0' ? null : parseInt(event.target.value),
      }))
  }

  return (
    <Stack
      direction="column"
      spacing={1}
      justifyContent="space-between"
      paddingTop={2}
      paddingBottom={2}
    >
      <PageHeader title="Gestione giocatori" Icon={PersonSearch} />
      <GenericAutocomplete
        onItemSelected={(id, text) => {
          const numericId = typeof id === 'number' ? id : undefined
          handleGiocatoreSelected(numericId, text)
        }}
        items={giocatori ?? []}
      />
      <Stack direction="row" spacing={1} justifyContent="flex-start">
        <Typography variant="h5">IdGiocatore: {selectedGiocatoreId}</Typography>
        <Typography variant="h5">
          IdTrasferimento: {selectedTrasferimentoId}
        </Typography>
      </Stack>
      <GenericCard
        title="Anagrafica giocatore"
        subtitle="Inserisci/aggiorna giocatore"
        titleVariant='h4'
        sx={{ p: 0 }}
      >
          <Box
            component="form"
            onSubmit={handleUpsertGiocatore}
            noValidate
            sx={{ mt: 1 }}
          >
            <Grid container spacing={0}>
              <Grid item xs={8}>
                <Stack direction="row" spacing={1} justifyContent="flex-start">
                  <TextField
                    margin="normal"
                    size="small"
                    variant="outlined"
                    required
                    sx={{ m: 2 }}
                    label="Nome"
                    name="nome"
                    value={giocatore?.nome ?? selectedGiocatore}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange(event, 'anagrafica')
                    }
                  />
                  <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                    <InputLabel id="select-label-ruolo">Ruolo</InputLabel>
                    <Select
                      size="small"
                      variant="outlined"
                      labelId="select-label-ruolo"
                      label="Ruolo"
                      sx={{ m: 0 }}
                      name="ruolo"
                      value={giocatore?.ruolo ?? 'P'}
                      onChange={(event: SelectChangeEvent) =>
                        handleSelectChange(event, 'anagrafica')
                      }
                    >
                      {ruoliList.map((item) => (
                        <MenuItem
                          key={item}
                          value={item}
                          
                        >
                          {getRuoloEsteso(item)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    margin="normal"
                    size="small"
                    variant="outlined"
                    required
                    sx={{ m: 2 }}
                    label="Nome fantagazzetta"
                    name="nomeFantagazzetta"
                    value={giocatore?.nomeFantagazzetta ?? ''}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange(event, 'anagrafica')
                    }
                  />
                </Stack>
              </Grid>
              <Grid item xs={4}>
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    type="button"
                    onClick={handleCancelGiocatore}
                    variant="outlined"
                    sx={{ mt: 3, mb: 2 }}
                  >
                    Annulla
                  </Button>
                  {selectedGiocatoreId !== undefined && (
                    <Button
                      type="button"
                      onClick={handleDeleteGiocatore}
                      color="error"
                      variant="outlined"
                      sx={{ mt: 3, mb: 2 }}
                    >
                      Elimina
                    </Button>
                  )}
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                  >
                    {selectedGiocatoreId
                      ? 'Aggiorna giocatore'
                      : 'Aggiungi giocatore'}
                  </Button>
                </Stack>
              </Grid>
              <Grid item xs={12}>
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="space-between"
                >
                  {messageGiocatore && (
                    <Stack sx={{ width: '100%' }} spacing={0}>
                      <Alert
                        icon={<CheckIcon fontSize="inherit" />}
                        severity="success"
                      >
                        {messageGiocatore}
                      </Alert>
                    </Stack>
                  )}
                  {errorMessageGiocatore && (
                    <Stack sx={{ width: '100%' }} spacing={0}>
                      <Alert
                        icon={<CheckIcon fontSize="inherit" />}
                        severity="error"
                      >
                        {errorMessageGiocatore}
                      </Alert>
                    </Stack>
                  )}
                </Stack>
              </Grid>
            </Grid>
          </Box>
        </GenericCard>
      {selectedGiocatoreId !== undefined && (
        <Paper elevation={3}>
          <GenericCard
            title="Trasferimento giocatore"
            subtitle="Inserisci/aggiorna trasferimento"
            titleVariant='h4'
            sx={{ p: 0 }}
          >
              <Box
                component="form"
                onSubmit={handleUpsertTrasferimento}
                noValidate
                sx={{ mt: 1 }}
              >
                <Grid container spacing={0}>
                  <Grid item xs={8}>
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-start"
                    >
                      <TextField
                        margin="normal"
                        size="small"
                        variant="outlined"
                        required
                        sx={{ m: 2 }}
                        id="costo"
                        label="Costo"
                        name="costo"
                        type="number"
                        value={trasferimento.costo}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                        ) => handleInputChange(event, 'trasferimento')}
                      />
                      <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                        <InputLabel id="select-label-fantasquadra">
                          Fantasquadra
                        </InputLabel>
                        <Select
                          size="small"
                          variant="outlined"
                          labelId="select-label-fantasquadra"
                          label="Fantasquadra"
                          sx={{ m: 0 }}
                          id="idSquadra"
                          name="idSquadra"
                          value={
                            trasferimento.idSquadra?.toLocaleString() ?? '0'
                          }
                          onChange={(event: SelectChangeEvent) =>
                            handleSelectChange(event, 'trasferimento')
                          }
                        >
                          {squadre.map((item) => (
                            <MenuItem
                              key={item.id}
                              value={item.id?.toLocaleString()}
                              
                            >
                              {item.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                        <InputLabel id="select-label-squadra">
                          Squadra
                        </InputLabel>
                        <Select
                          size="small"
                          variant="outlined"
                          labelId="select-label-squadra"
                          label="Squadra"
                          sx={{ m: 0 }}
                          id="idSquadraSerieA"
                          name="idSquadraSerieA"
                          value={
                            trasferimento.idSquadraSerieA?.toLocaleString() ??
                            '0'
                          }
                          onChange={(event: SelectChangeEvent) =>
                            handleSelectChange(event, 'trasferimento')
                          }
                        >
                          {squadreSerieA.map((item) => (
                            <MenuItem
                              key={item.id}
                              value={item.id?.toLocaleString()}
                              
                            >
                              {item.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        margin="normal"
                        size="small"
                        variant="outlined"
                        required
                        type="datetime-local"
                        sx={{ m: 2 }}
                        id="dataAcquisto"
                        label="Data Acquisto"
                        name="dataAcquisto"
                        value={convertFromIsoToDatetimeMUI(
                          dayjs(trasferimento.dataAcquisto).toISOString(),
                        )}
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                        ) => handleInputChange(event, 'trasferimento')}
                      />
                      <TextField
                        margin="normal"
                        size="small"
                        variant="outlined"
                        required
                        type="datetime-local"
                        sx={{ m: 2 }}
                        id="dataCessione"
                        //label='Data Cessione'
                        name="dataCessione"
                        value={
                          trasferimento.dataCessione !== null
                            ? convertFromIsoToDatetimeMUI(
                                dayjs(trasferimento.dataCessione).toISOString(),
                              )
                            : null
                        }
                        onChange={(
                          event: React.ChangeEvent<HTMLInputElement>,
                        ) => handleInputChange(event, 'trasferimento')}
                      />
                    </Stack>
                  </Grid>
                  <Grid item xs={4}>
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="flex-end"
                    >
                      <Button
                        type="button"
                        onClick={handleCancelTrasferimento}
                        variant="outlined"
                        sx={{ mt: 3, mb: 2 }}
                      >
                        Annulla
                      </Button>
                      {selectedTrasferimentoId !== undefined &&
                        selectedTrasferimentoStagione ===
                          Configurazione.stagione && (
                          <Button
                            type="button"
                            onClick={handleDeleteTrasferimento}
                            color="error"
                            variant="outlined"
                            sx={{ mt: 3, mb: 2 }}
                          >
                            Elimina
                          </Button>
                        )}
                      {selectedTrasferimentoStagione ===
                        Configurazione.stagione && (
                        <Button
                          type="submit"
                          variant="contained"
                          sx={{ mt: 3, mb: 2 }}
                        >
                          {selectedTrasferimentoId
                            ? 'Aggiorna trasferimento'
                            : 'Aggiungi trasferimento'}
                        </Button>
                      )}
                    </Stack>
                  </Grid>
                  <Grid item xs={12}>
                    <Stack
                      direction="row"
                      spacing={1}
                      justifyContent="space-between"
                    >
                      {messageTrasferimento && (
                        <Stack sx={{ width: '100%' }} spacing={0}>
                          <Alert
                            icon={<CheckIcon fontSize="inherit" />}
                            severity="success"
                          >
                            {messageTrasferimento}
                          </Alert>
                        </Stack>
                      )}
                      {errorMessageTrasferimento && (
                        <Stack sx={{ width: '100%' }} spacing={0}>
                          <Alert
                            icon={<CheckIcon fontSize="inherit" />}
                            severity="error"
                          >
                            {errorMessageTrasferimento}
                          </Alert>
                        </Stack>
                      )}
                    </Stack>
                  </Grid>
                </Grid>
              </Box>
            </GenericCard>
        </Paper>
      )}
      {trasferimentiList.isLoading &&
      !trasferimentiList.isSuccess &&
      selectedGiocatoreId !== undefined ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
          <LoadingSpinner />
        </Box>
      ) : selectedGiocatoreId === undefined ? (
        <span></span>
      ) : (
        <>
          <Typography variant="h5">
            Trasferimenti {giocatoreOne.data?.nome}
          </Typography>
          <Box
            sx={{ width: '100%', overflowX: 'auto', contain: 'inline-size' }}
          >
            <DataGrid
              columnHeaderHeight={45}
              rowHeight={40}
              loading={trasferimentiList.isLoading}
              initialState={{
                pagination: {
                  paginationModel: {
                    pageSize: pageSize,
                  },
                },
                filter: undefined,
                density: 'comfortable',
              }}
              slotProps={{
                loadingOverlay: {
                  variant: 'skeleton',
                },
              }}
              columnVisibilityModel={{
                id: false,
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
              rows={trasferimentiList.isLoading ? skeletonRows : trasferimenti}
              disableRowSelectionOnClick={true}
              sx={{
                backgroundColor: theme.palette.background.paper,
                overflowX: 'auto',
                '& .MuiDataGrid-virtualScroller': {
                  overflowX: 'auto',
                },
                minWidth: '100%',
                '& .MuiDataGrid-viewport': {
                  overflowX: 'auto !important',
                },
              }}
            />
          </Box>
        </>
      )}
    </Stack>
  )
}
