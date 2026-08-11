'use client'
import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { orpc } from '~/utils/orpc'
import { squadraSerieASchema } from '~/schemas/squadraSerieA'
import { type SquadraSerieAType } from '~/types/squadreSerieA'

const defaultSquadraSerieA: SquadraSerieAType = {
  idSquadraSerieA: 0,
  nome: '',
  maglia: '',
}

export function useSquadreSerieAAdmin() {
  const [errorMessageModal, setErrorMessageModal] = useState('')
  const [messageModal, setMessageModal] = useState('')
  const [openModalEdit, setOpenModalEdit] = useState(false)
  const [squadraSerieAInModifica, setSquadraSerieAInModifica] =
    useState<SquadraSerieAType>(defaultSquadraSerieA)

  // ── queries / mutations ───────────────────────────────────────────────────
  const squadreSerieAList = useQuery(orpc.squadreSerieA.list.queryOptions({}))
  const updateSquadraSerieA = useMutation(
    orpc.squadreSerieA.update.mutationOptions({
      onSuccess: async () => await squadreSerieAList.refetch(),
    }),
  )

  const data: SquadraSerieAType[] = squadreSerieAList.data ?? []

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleEdit = (idSquadraSerieA: number) => {
    const squadra = data.find(
      (item) => item.idSquadraSerieA === idSquadraSerieA,
    )
    if (!squadra) return
    setSquadraSerieAInModifica(squadra)
    setErrorMessageModal('')
    setMessageModal('')
    setOpenModalEdit(true)
  }

  const handleModalClose = () => {
    setOpenModalEdit(false)
    setSquadraSerieAInModifica(defaultSquadraSerieA)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessageModal('')
    setMessageModal('')
    const responseVal = squadraSerieASchema.safeParse(squadraSerieAInModifica)
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
        await updateSquadraSerieA.mutateAsync(responseVal.data)
        setMessageModal('Salvataggio completato')
      } catch {
        setErrorMessageModal(
          'Si è verificato un errore nel salvataggio della squadra',
        )
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.currentTarget
    setSquadraSerieAInModifica((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  return {
    // state
    data,
    openModalEdit,
    squadraSerieAInModifica,
    errorMessageModal,
    messageModal,
    // derived
    isLoading: squadreSerieAList.isLoading,
    // handlers
    handleEdit,
    handleModalClose,
    handleSubmit,
    handleInputChange,
  }
}
