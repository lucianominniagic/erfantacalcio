'use client'
import { useState, useEffect } from 'react'
import { type SelectChangeEvent } from '@mui/material'
import dayjs from 'dayjs'
import { type AutocompleteOption } from '~/components/autocomplete/GenericAutocomplete'
import { type GiocatoreType } from '~/types/giocatori'
import {
  type trasferimentoType,
  type trasferimentoListType,
} from '~/types/trasferimenti'
import { api } from '~/utils/api'
import { Configurazione } from '~/config'
import { giocatoreSchema, trasferimentoSchema } from '~/schemas/giocatore'

const defaultGiocatore: GiocatoreType = {
  idGiocatore: 0,
  nome: '',
  nomeFantagazzetta: '',
  ruolo: 'P',
}

const defaultTrasferimento: trasferimentoType = {
  idTrasferimento: 0,
  idGiocatore: 0,
  idSquadra: null,
  idSquadraSerieA: null,
  costo: 0,
  dataAcquisto: dayjs(new Date()).toDate(),
  dataCessione: null,
}

export function useGiocatoriAdmin() {
  const [selectedGiocatoreId, setSelectedGiocatoreId] = useState<number>()
  const [selectedGiocatore, setSelectedGiocatore] = useState<string>()
  const [selectedTrasferimentoId, setSelectedTrasferimentoId] =
    useState<number>()
  const [selectedTrasferimentoStagione, setSelectedTrasferimentoStagione] =
    useState<string>()
  const [searchInput, setSearchInput] = useState('')
  const [squadre, setSquadre] = useState<AutocompleteOption[]>([])
  const [squadreSerieA, setSquadreSerieA] = useState<AutocompleteOption[]>([])
  const [trasferimenti, setTrasferimenti] = useState<trasferimentoListType[]>(
    [],
  )
  const [errorMessageGiocatore, setErrorMessageGiocatore] = useState('')
  const [messageGiocatore, setMessageGiocatore] = useState('')
  const [errorMessageTrasferimento, setErrorMessageTrasferimento] = useState('')
  const [messageTrasferimento, setMessageTrasferimento] = useState('')
  const [giocatore, setGiocatore] = useState<GiocatoreType>(defaultGiocatore)
  const [trasferimento, setTrasferimento] =
    useState<trasferimentoType>(defaultTrasferimento)

  // ── tRPC queries ──────────────────────────────────────────────────────────
  const trasferimentiList = api.trasferimenti.list.useQuery(
    { idGiocatore: selectedGiocatoreId! },
    { enabled: !!selectedGiocatoreId },
  )
  const giocatoriSearch = api.giocatori.search.useQuery(
    { query: searchInput },
    {
      enabled: searchInput.length >= 2,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
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

  // ── mutations ─────────────────────────────────────────────────────────────
  const giocatoreUpsert = api.giocatori.upsert.useMutation({
    onSuccess: async () => {
      await giocatoriSearch.refetch()
    },
  })
  const giocatoreDelete = api.giocatori.delete.useMutation({
    onSuccess: async () => {
      await giocatoriSearch.refetch()
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

  // ── effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (trasferimentiList.data) {
      setTrasferimenti(trasferimentiList.data)
    }
  }, [trasferimentiList.data])

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

  // ── handlers: trasferimento ───────────────────────────────────────────────
  const handleCancelTrasferimento = async () => {
    setSelectedTrasferimentoId(undefined)
    setSelectedTrasferimentoStagione(Configurazione.stagione)
    setTrasferimento(defaultTrasferimento)
    document?.getElementById('search_items')?.focus()
  }

  // ── handlers: anagrafica ──────────────────────────────────────────────────
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
      } catch {
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
      } catch {
        setErrorMessageGiocatore(
          "Si è verificato un errore nell'eliminazione del giocatore",
        )
      }
    }
  }

  // ── handlers: trasferimento (continued) ───────────────────────────────────
  const handleEditTrasferimento = async (_idTrasferimento: number) => {
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
      } catch {
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
    } catch {
      setErrorMessageTrasferimento(
        "Si è verificato un errore nell'eliminazione del trasferimento",
      )
    }
  }

  // ── shared input handlers ─────────────────────────────────────────────────
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

  return {
    // state
    selectedGiocatoreId,
    selectedGiocatore,
    selectedTrasferimentoId,
    selectedTrasferimentoStagione,
    giocatori: giocatoriSearch.data ?? [],
    giocatoriIsLoading: giocatoriSearch.isFetching,
    squadre,
    squadreSerieA,
    trasferimenti,
    errorMessageGiocatore,
    messageGiocatore,
    errorMessageTrasferimento,
    messageTrasferimento,
    giocatore,
    trasferimento,
    // derived
    trasferimentiIsLoading: trasferimentiList.isLoading,
    trasferimentiIsSuccess: trasferimentiList.isSuccess,
    giocatoreNome: giocatoreOne.data?.nome,
    // handlers
    handleGiocatoreSelected,
    handleCancelGiocatore,
    handleUpsertGiocatore,
    handleDeleteGiocatore,
    handleCancelTrasferimento,
    handleEditTrasferimento,
    handleUpsertTrasferimento,
    handleDeleteTrasferimento,
    handleInputChange,
    handleSelectChange,
    handleSearchInputChange: setSearchInput,
  }
}
