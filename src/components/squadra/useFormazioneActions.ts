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
    panca,
    rosa,
    modulo,
    idSquadra,
    dispatch,
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
      dispatch({ type: 'SET_MODULO', payload: formatModulo(newStateStr) as Moduli })
    }

    return isValid
  }

  const handleClickPlayer = (playerClicked: GiocatoreFormazioneType) => {
    playerClicked.riserva = null
    playerClicked.titolare = false

    const canAdd = canAddPlayer(playerClicked.ruolo)

    let newRosa = rosa
    let newCampo = campo
    let newPanca = panca

    if (rosa.some((c) => c.idGiocatore === playerClicked.idGiocatore) && canAdd) {
      playerClicked.titolare = true
      newRosa = rosa.filter((p) => p.idGiocatore !== playerClicked.idGiocatore)
      newCampo = [...campo, playerClicked]
    } else if (rosa.some((c) => c.idGiocatore === playerClicked.idGiocatore)) {
      playerClicked.riserva = 100
      newRosa = rosa.filter((p) => p.idGiocatore !== playerClicked.idGiocatore)
      newPanca = sortPlayersByRoleDescThenRiserva([...panca, playerClicked])
    } else if (campo.some((c) => c.idGiocatore === playerClicked.idGiocatore)) {
      newCampo = campo.filter((p) => p.idGiocatore !== playerClicked.idGiocatore)
      newRosa = sortPlayersByRoleDescThenRiserva([...rosa, playerClicked])
    } else if (panca.some((c) => c.idGiocatore === playerClicked.idGiocatore)) {
      newPanca = panca.filter((p) => p.idGiocatore !== playerClicked.idGiocatore)
      newRosa = [...rosa, playerClicked]
    }

    dispatch({ type: 'UPDATE_LISTS', payload: { rosa: newRosa, campo: newCampo, panca: newPanca } })
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
    if (newIdTorneo !== undefined) {
      dispatch({ type: 'RESET_FOR_GIORNATA' })
      data.setIdTorneo(newIdTorneo)
    } else {
      dispatch({
        type: 'RESET',
        payload: sortPlayersByRoleDescThenCostoDesc([...rosa, ...campo, ...panca]),
      })
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

