import { useMutation } from '@tanstack/react-query'
import { orpc } from '~/utils/orpc'
import type { FormazioneDataState } from './useFormazioneData'
import {
  sortPlayersByRoleDescThenCostoDesc,
  validateAndGetModulo,
  applyPlayerClick,
} from './utils'
import { type GiocatoreFormazioneType } from '~/types/squadre'
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
    const newModulo = validateAndGetModulo(campo, ruoloGiocatore)
    if (newModulo !== null) {
      dispatch({ type: 'SET_MODULO', payload: newModulo })
    }
    return newModulo !== null
  }

  const handleClickPlayer = (playerClicked: GiocatoreFormazioneType) => {
    const canAdd = canAddPlayer(playerClicked.ruolo)
    const result = applyPlayerClick(rosa, campo, panca, playerClicked, canAdd)
    dispatch({ type: 'UPDATE_LISTS', payload: result })
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

