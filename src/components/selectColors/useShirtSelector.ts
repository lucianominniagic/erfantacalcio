'use client'

import React, { useEffect, useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { orpc } from '~/utils/orpc'
import { type MagliaType } from '~/schemas/maglia'
import { toShirtTemplate, type ShirtTemplate } from '.'

export function useShirtSelector() {
  const [alertMessage, setAlertMessage] = useState('')
  const [openAlert, setOpenAlert] = useState(false)
  const [saving, setSaving] = useState(false)
  const [mainColor, setMainColor] = useState('#ff0000')
  const [secondaryColor, setSecondaryColor] = useState('#ffffff')
  const [thirdColor, setThirdColor] = useState('#000000')
  const [textColor, setTextColor] = useState('#000000')
  const [shirtNumber, setShirtNumber] = useState(10)
  const [selectedTemplate, setSelectedTemplate] = useState<ShirtTemplate>('solid')
  const [maglia, setMaglia] = useState<MagliaType | undefined>({
    mainColor: '#ff0000',
    secondaryColor: '#ffffff',
    thirdColor: '#000000',
    textColor: '#000000',
    shirtNumber: 10,
    selectedTemplate: 'solid',
  })

  const squadra = useQuery(orpc.squadre.getMaglia.queryOptions({}))

  const updateMaglia = useMutation(orpc.squadre.updateMaglia.mutationOptions({
    onSuccess: async () => {
      setAlertMessage('Salvataggio completato')
      void squadra.refetch()
    },
  }))

  useEffect(() => {
    if (!squadra.isFetching && squadra.isSuccess && squadra.data) {
      setMaglia(squadra.data)
      setMainColor(squadra.data.mainColor)
      setSecondaryColor(squadra.data.secondaryColor)
      setThirdColor(squadra.data.thirdColor)
      setTextColor(squadra.data.textColor)
      setShirtNumber(squadra.data.shirtNumber)
      setSelectedTemplate(toShirtTemplate(squadra.data.selectedTemplate))
    }
  }, [squadra.data, squadra.isSuccess, squadra.isFetching])

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    updateMaglia.mutate({
      mainColor,
      secondaryColor,
      thirdColor,
      textColor,
      shirtNumber,
      selectedTemplate,
    })
    setOpenAlert(true)
    setSaving(false)
  }

  return {
    // colors
    mainColor,
    setMainColor,
    secondaryColor,
    setSecondaryColor,
    thirdColor,
    setThirdColor,
    textColor,
    setTextColor,
    // shirt config
    shirtNumber,
    setShirtNumber,
    selectedTemplate,
    setSelectedTemplate,
    // persisted maglia
    maglia,
    isLoadingMaglia: squadra.isLoading,
    // save
    saving,
    handleSave,
    // alert
    alertMessage,
    openAlert,
    setOpenAlert,
  }
}
