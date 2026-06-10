'use client'
import { useState, useEffect } from 'react'
import { type SquadraType } from '~/types/squadre'
import { useQuery, useMutation } from '@tanstack/react-query'
import { orpc } from '~/utils/orpc'
import { utenteSchema } from '~/schemas/presidente'

const defaultUtente: SquadraType = {
  id: 0,
  isAdmin: false,
  isLockLevel: false,
  presidente: '',
  email: '',
  squadra: '',
  importoAnnuale: 0,
  importoMulte: 0,
  importoMercato: 0,
  fantamilioni: 0,
}

export function usePresidentiAdmin() {
  const [idSquadra, setIdSquadra] = useState<number>()
  const [errorMessageModal, setErrorMessageModal] = useState('')
  const [messageModal, setMessageModal] = useState('')
  const [data, setData] = useState<SquadraType[]>([])
  const [openModalEdit, setOpenModalEdit] = useState(false)
  const [utenteInModifica, setUtenteInModifica] =
    useState<SquadraType>(defaultUtente)

  // ── queries / mutations ───────────────────────────────────────────────────
  const squadreList = useQuery(orpc.squadre.list.queryOptions({}))
  const squadra = useQuery(
    orpc.squadre.get.queryOptions({
      input: { idSquadra: idSquadra! },
      enabled: !!idSquadra,
    }),
  )
  const updateSquadra = useMutation(orpc.squadre.update.mutationOptions({
    onSuccess: async () => await squadreList.refetch(),
  }))

  // ── effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (squadreList.data) {
      setData(squadreList.data)
    }
  }, [squadreList.data])

  useEffect(() => {
    if (!squadra.isFetching && squadra.isSuccess && squadra.data) {
      setUtenteInModifica(squadra.data)
      setErrorMessageModal('')
      setMessageModal('')
      setOpenModalEdit(true)
    }
  }, [squadra.data, squadra.isSuccess, squadra.isFetching])

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleEdit = async (_idUtente: number) => {
    setIdSquadra(_idUtente)
  }

  const handleModalClose = () => {
    setOpenModalEdit(false)
    setIdSquadra(undefined)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessageModal('')
    setMessageModal('')
    const responseVal = utenteSchema.safeParse(utenteInModifica)
    if (!responseVal.success) {
      setErrorMessageModal(
        responseVal.error.issues
          .map(
            (issue) => `campo ${issue.path.toLocaleString()}: ${issue.message}`,
          )
          .join(', '),
      )
    } else {
      try {
        await updateSquadra.mutateAsync(utenteInModifica)
        setMessageModal('Salvataggio completato')
      } catch {
        setErrorMessageModal(
          "Si è verificato un errore nel salvataggio dell'utente",
        )
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.currentTarget
    setUtenteInModifica((prevState) => ({
      ...prevState,
      [name]:
        type === 'number' ? +value : type === 'checkbox' ? checked : value,
    }))
  }

  return {
    // state
    data,
    openModalEdit,
    utenteInModifica,
    errorMessageModal,
    messageModal,
    // derived
    isLoading: squadreList.isLoading,
    // handlers
    handleEdit,
    handleModalClose,
    handleSubmit,
    handleInputChange,
  }
}
