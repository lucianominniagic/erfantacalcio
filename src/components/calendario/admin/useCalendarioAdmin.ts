'use client'
import { useState, useEffect } from 'react'
import { type SelectChangeEvent } from '@mui/material'
import { z } from 'zod'
import dayjs from 'dayjs'
import { api } from '~/utils/api'
import { calendarioSchema } from '~/schemas/calendario'

type CalendarioEntry = z.infer<typeof calendarioSchema>

const defaultCalendario: CalendarioEntry = {
  id: 0,
  idTorneo: 1,
  nome: '',
  gruppoFase: null,
  giornata: 0,
  giornataSerieA: 0,
  isGiocata: false,
  isSovrapposta: false,
  isRecupero: false,
  data: '',
  dataFine: '',
  girone: null,
  isSelected: false,
}

export function useCalendarioAdmin() {
  const [idCalendario, setIdCalendario] = useState<number>()
  const [errorMessageModal, setErrorMessageModal] = useState('')
  const [messageModal, setMessageModal] = useState('')
  const [data, setData] = useState<CalendarioEntry[]>([])
  const [openModalEdit, setOpenModalEdit] = useState(false)
  const [calendarioInModifica, setCalendarioInModifica] =
    useState<CalendarioEntry>(defaultCalendario)

  // ── queries ───────────────────────────────────────────────────────────────
  const calendarioList = api.calendario.list.useQuery()
  const oneCalendario = api.calendario.getOne.useQuery(
    { idCalendario: idCalendario! },
    { enabled: !!idCalendario },
  )
  const torneiList = api.tornei.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  })

  // ── mutations ─────────────────────────────────────────────────────────────
  const updateCalendario = api.calendario.update.useMutation({
    onSuccess: async () => await calendarioList.refetch(),
  })

  // ── effects ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (calendarioList.data) {
      setData(calendarioList.data)
    }
  }, [calendarioList.data])

  useEffect(() => {
    if (
      !oneCalendario.isFetching &&
      oneCalendario.isSuccess &&
      oneCalendario.data
    ) {
      setCalendarioInModifica(oneCalendario.data)
      setErrorMessageModal('')
      setMessageModal('')
      setOpenModalEdit(true)
    }
  }, [oneCalendario.data, oneCalendario.isSuccess, oneCalendario.isFetching])

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleEdit = async (_idCalendario: number) => {
    setIdCalendario(_idCalendario)
  }

  const handleModalClose = () => {
    setOpenModalEdit(false)
    setIdCalendario(undefined)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessageModal('')
    setMessageModal('')
    const responseVal = calendarioSchema.safeParse(calendarioInModifica)
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
        const payload = {
          ...calendarioInModifica,
          dataFine: calendarioInModifica.dataFine || calendarioInModifica.data,
        }
        await updateCalendario.mutateAsync(payload)
        setMessageModal('Salvataggio completato')
        handleModalClose()
      } catch {
        setErrorMessageModal(
          'Si è verificato un errore nel salvataggio del calendario',
        )
      }
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.currentTarget
    setCalendarioInModifica((prevState) => ({
      ...prevState,
      [name]:
        type === 'number'
          ? +value
          : type === 'checkbox'
            ? checked
            : type === 'datetime-local'
              ? dayjs(value).toISOString()
              : value,
    }))
  }

  const handleSelectChange = (event: SelectChangeEvent) => {
    setCalendarioInModifica((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }))
  }

  const handleDateChange = (field: 'data' | 'dataFine', value: string) => {
    setCalendarioInModifica((prev) => ({ ...prev, [field]: value }))
  }

  return {
    // state
    data,
    openModalEdit,
    calendarioInModifica,
    errorMessageModal,
    messageModal,
    torneiList: torneiList.data,
    // derived
    isLoading: calendarioList.isLoading,
    // handlers
    handleEdit,
    handleModalClose,
    handleSubmit,
    handleInputChange,
    handleSelectChange,
    handleDateChange,
  }
}
