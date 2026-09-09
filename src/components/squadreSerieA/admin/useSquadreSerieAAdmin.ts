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
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'warning' | 'error'
  }>({
    open: false,
    message: '',
    severity: 'success',
  })
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
    setOpenModalEdit(true)
  }

  const handleModalClose = () => {
    setOpenModalEdit(false)
    setSquadraSerieAInModifica(defaultSquadraSerieA)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const responseVal = squadraSerieASchema.safeParse(squadraSerieAInModifica)
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
    } else {
      try {
        await updateSquadraSerieA.mutateAsync(responseVal.data)
        handleModalClose()
        setSnackbar({
          open: true,
          severity: 'success',
          message: 'Salvataggio completato',
        })
      } catch {
        setSnackbar({
          open: true,
          severity: 'error',
          message: 'Si è verificato un errore nel salvataggio della squadra',
        })
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
    snackbar,
    // derived
    isLoading: squadreSerieAList.isLoading,
    // handlers
    handleCloseSnackbar: () => setSnackbar((s) => ({ ...s, open: false })),
    handleEdit,
    handleModalClose,
    handleSubmit,
    handleInputChange,
  }
}
