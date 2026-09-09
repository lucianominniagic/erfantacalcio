'use client'
import { useState, useEffect } from 'react'
import { type AutocompleteOption } from '~/components/autocomplete/GenericAutocomplete'
import { type votoType, type votoListType } from '~/types/voti'
import { useQuery, useMutation } from '@tanstack/react-query'
import { orpc } from '~/utils/orpc'
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
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'warning' | 'error'
  }>({
    open: false,
    message: '',
    severity: 'success',
  })
  const [voto, setVoto] = useState<votoType>(defaultVoto)

  // ── queries ───────────────────────────────────────────────────────────────
  const votiList = useQuery(orpc.voti.list.queryOptions({
    input: { idGiocatore: selectedGiocatoreId! },
    enabled: !!selectedGiocatoreId,
  }))
  const giocatoriList = useQuery(
    orpc.giocatori.listAll.queryOptions({
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
  )
  const votoOne = useQuery(orpc.voti.get.queryOptions({
    input: { idVoto: selectedVotoId! },
    enabled: !!selectedVotoId,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  }))

  // ── mutations ─────────────────────────────────────────────────────────────
  const votoUpdate = useMutation({
    ...orpc.voti.update.mutationOptions(),
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
    const responseVal = votoSchema.safeParse(voto)

    if (!responseVal.success) {
      setSnackbar({
        open: true,
        severity: 'warning',
        message: responseVal.error.issues
          .map(
            (issue) => `campo ${issue.path.toLocaleString()}: ${issue.message}`,
          )
          .join(', '),
      })
    } else if (voto.ammonizione !== 0 && voto.espulsione !== 0) {
      setSnackbar({
        open: true,
        severity: 'warning',
        message: 'Selezionare ammonizione o espulsione',
      })
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
        await handleModalClose()
        setSnackbar({
          open: true,
          severity: 'success',
          message: 'Salvataggio completato',
        })
      } catch {
        setSnackbar({
          open: true,
          severity: 'error',
          message: 'Si è verificato un errore nel salvataggio del voto giocatore',
        })
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
    snackbar,
    // derived
    votiIsLoading: votiList.isLoading,
    votiIsSuccess: votiList.isSuccess,
    // handlers
    setVoto,
    handleCloseSnackbar: () => setSnackbar((s) => ({ ...s, open: false })),
    handleGiocatoreSelected,
    handleEditVoto,
    handleUpdateVoto,
    handleModalClose,
  }
}
