import { useMutation } from '@tanstack/react-query'
import { orpc } from '~/utils/orpc'
import type { FormazioneDataState } from './useFormazioneData'
import {
  allowedFormations,
  calcolaCodiceFormazione,
  formatModulo,
  sortPlayersByRoleDescThenRiserva,
  sortPlayersByRoleDescThenCostoDesc,
} from './utils'
import { type GiocatoreFormazioneType } from '~/types/squadre'
import { type Moduli } from '~/types/common'
import { moduloDefault } from '~/utils/helper'
import React, { useState } from 'react'

interface AlertState {
  setAlertMessage: (msg: string) => void
  setAlertSeverity: (s: 'success' | 'error') => void
  setOpenAlert: (open: boolean) => void
}

export function useFormazioneActions(
  data: FormazioneDataState,
  alert: AlertState,
) {
  const {
    giornate,
    idPartita,
    campo,
    setCampo,
    panca,
    setPanca,
    rosa,
    setRosa,
    modulo,
    setModulo,
    idSquadra,
  } = data

  const [saving, setSaving] = useState(false)
  const [idGiocatoreStat, setIdGiocatoreStat] = useState<number>()
  const [openModalCalendario, setOpenModalCalendario] = useState(false)

  const saveFormazione = useMutation(
    orpc.formazione.create.mutationOptions({
      onSuccess: async () => {
        alert.setAlertSeverity('success')
      },
    }),
  )

  function canAddPlayer(ruoloGiocatore: string): boolean {
    const newState = calcolaCodiceFormazione(campo, ruoloGiocatore)
    const newStateStr = newState.toString().padStart(4, '0')

    const isValid = allowedFormations.some((formation) => {
      const formationStr = formation.toString().padStart(4, '0')
      for (let i = 0; i < 4; i++) {
        const currentRoleCount = parseInt(newStateStr.charAt(i), 10)
        const maxRoleCount = parseInt(formationStr.charAt(i), 10)
        if (currentRoleCount > maxRoleCount) return false
      }
      return true
    })

    if (isValid) {
      const moduloFormatted = formatModulo(newStateStr)
      setModulo(moduloFormatted as Moduli)
    }

    return isValid
  }

  const updateLists = (
    playerSelected: GiocatoreFormazioneType,
    targetArray: GiocatoreFormazioneType[],
    setTargetArray: (value: GiocatoreFormazioneType[]) => void,
    sourceArray: GiocatoreFormazioneType[],
    setSourceArray: (value: GiocatoreFormazioneType[]) => void,
    orderTargetList = true,
    orderSourceList = false,
  ) => {
    if (
      playerSelected &&
      !targetArray.find((c) => c.idGiocatore === playerSelected.idGiocatore)
    ) {
      const updatedSourceArray = sourceArray.filter(
        (player) => player.idGiocatore !== playerSelected.idGiocatore,
      )
      const updatedTargetArray = [...targetArray, playerSelected]
      orderSourceList
        ? setSourceArray(sortPlayersByRoleDescThenRiserva(updatedSourceArray))
        : setSourceArray(updatedSourceArray)
      orderTargetList
        ? setTargetArray(sortPlayersByRoleDescThenRiserva(updatedTargetArray))
        : setTargetArray(updatedTargetArray)
    }
  }

  const handleClickPlayer = (playerClicked: GiocatoreFormazioneType) => {
    playerClicked.riserva = null
    playerClicked.titolare = false

    const canAdd = canAddPlayer(playerClicked.ruolo)

    if (rosa.some((c) => c.idGiocatore === playerClicked.idGiocatore) && canAdd) {
      playerClicked.titolare = true
      updateLists(playerClicked, campo, setCampo, rosa, setRosa, false)
    } else if (rosa.some((c) => c.idGiocatore === playerClicked.idGiocatore)) {
      playerClicked.riserva = 100
      updateLists(playerClicked, panca, setPanca, rosa, setRosa, true)
    } else if (campo.some((c) => c.idGiocatore === playerClicked.idGiocatore)) {
      updateLists(playerClicked, rosa, setRosa, campo, setCampo, true)
    } else if (panca.some((c) => c.idGiocatore === playerClicked.idGiocatore)) {
      updateLists(playerClicked, rosa, setRosa, panca, setPanca, false, true)
    }
  }

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (rosa.length > 0 || campo.length !== 11) {
      alert.setAlertMessage('Completa la formazione')
      alert.setAlertSeverity('error')
    } else if (!idPartita && idPartita !== 0) {
      alert.setAlertMessage('Nessuna partita in programma, impossibile procedere')
      alert.setAlertSeverity('error')
    } else {
      setSaving(true)
      const giocatoriPayload = [...campo, ...panca].map((giocatore) => ({
        idGiocatore: giocatore.idGiocatore,
        titolare: giocatore.titolare,
        riserva: giocatore.riserva,
      }))

      if (idPartita !== 0) {
        await saveFormazione.mutateAsync({ idPartita, modulo, giocatori: giocatoriPayload })
        alert.setAlertMessage(
          `Salvataggio completato: ${
            giornate.find((g) => g.partite.some((p) => p.idPartita === idPartita))?.Title ?? ''
          }`,
        )
      } else {
        await Promise.all(
          giornate.map(async (g) => {
            const idP = g.partite
              .filter((c) => c.idHome === idSquadra || c.idAway === idSquadra)
              .map((p) => p.idPartita)[0]
            await saveFormazione.mutateAsync({ idPartita: idP, modulo, giocatori: giocatoriPayload })
          }),
        )
        alert.setAlertMessage(
          'Salvataggio completato per entrambe le giornate di campionato e champions',
        )
      }
      setSaving(false)
    }
    alert.setOpenAlert(true)
  }

  const handleModalCalendarioClose = () => setOpenModalCalendario(false)

  const resetFormazione = (newIdTorneo?: number) => {
    setModulo(moduloDefault)
    setCampo([])
    setPanca([])
    if (newIdTorneo !== undefined) {
      setRosa([])
      data.setIdTorneo(newIdTorneo)
    } else {
      setRosa(sortPlayersByRoleDescThenCostoDesc(rosa.concat(campo, panca)))
    }
  }

  return {
    idGiocatoreStat,
    setIdGiocatoreStat,
    openModalCalendario,
    setOpenModalCalendario,
    saving,
    handleSave,
    handleClickPlayer,
    handleModalCalendarioClose,
    resetFormazione,
  }
}

export type FormazioneActionsState = ReturnType<typeof useFormazioneActions>
