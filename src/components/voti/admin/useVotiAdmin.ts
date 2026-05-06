'use client'
import { useState, useEffect } from 'react'
import { type AutocompleteOption } from '~/components/autocomplete/GenericAutocomplete'
import { type votoType, type votoListType } from '~/types/voti'
import { api } from '~/utils/api'
import { votoSchema } from '~/schemas/giocatore'

const defaultVoto: votoType = {
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
}

export function useVotiAdmin() {
  const [openModalEdit, setOpenModalEdit] = useState(false)
  const [selectedGiocatoreId, setSelectedGiocatoreId] = useState<number>()
  const [selectedVotoId, setSelectedVotoId] = useState<number>()
  const [giocatori, setGiocatori] = useState<AutocompleteOption[]>([])
  const [voti, setVoti] = useState<votoListType[]>([])
  const [errorMessageVoto, setErrorMessageVoto] = useState('')
  const [messageVoto, setMessageVoto] = useState('')
  const [voto, setVoto] = useState<votoType>(defaultVoto)

  // ── queries ───────────────────────────────────────────────────────────────
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

  // ── mutations ─────────────────────────────────────────────────────────────
  const votoUpdate = api.voti.update.useMutation({
    onSuccess: async () => {
      await votiList.refetch()
    },
  })

  // ── effects ───────────────────────────────────────────────────────────────
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

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleCancelVoto = async () => {
    setSelectedVotoId(undefined)
    document?.getElementById('search_items')?.focus()
  }

  const handleGiocatoreSelected = async (idGiocatore: number | undefined) => {
    setSelectedGiocatoreId(idGiocatore)
    setSelectedVotoId(undefined)
    await handleCancelVoto()
  }

  const handleEditVoto = async (_idVoto: number) => {
    setSelectedVotoId(_idVoto)
  }

  const handleUpdateVoto = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
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
      } catch {
        setErrorMessageVoto(
          'Si è verificato un errore nel salvataggio del voto giocatore',
        )
      }
    }
  }

  const handleModalClose = async () => {
    setOpenModalEdit(false)
    await handleCancelVoto()
  }

  return {
    // state
    openModalEdit,
    selectedGiocatoreId,
    giocatori,
    voti,
    voto,
    errorMessageVoto,
    messageVoto,
    // derived
    votiIsLoading: votiList.isLoading,
    votiIsSuccess: votiList.isSuccess,
    // handlers
    setVoto,
    handleGiocatoreSelected,
    handleEditVoto,
    handleUpdateVoto,
    handleModalClose,
  }
}
