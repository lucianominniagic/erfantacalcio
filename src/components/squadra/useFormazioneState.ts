import {
  Looks3Outlined,
  Looks4Outlined,
  Looks5Outlined,
  Looks6Outlined,
  LooksOneOutlined,
  LooksTwoOutlined,
} from '@mui/icons-material'
import React, { useState } from 'react'
import { useFormazioneData } from './useFormazioneData'
import { useFormazioneActions } from './useFormazioneActions'
import { useFormazionePrecedente } from './useFormazionePrecedente'

/**
 * Barrel hook: composes useFormazioneData + useFormazioneActions + useFormazionePrecedente.
 * Maintains the same public API as before for zero regressions.
 */
export function useFormazioneState() {
  const [openAlert, setOpenAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success')

  const alert = { setAlertMessage, setAlertSeverity, setOpenAlert }

  const data = useFormazioneData()
  const actions = useFormazioneActions(data, alert)
  const precedente = useFormazionePrecedente(
    { message: data.message, formazioneList: data.formazioneList },
    alert,
  )

  const filterIcons = [
    React.createElement(LooksOneOutlined, { key: 0, color: 'error' }),
    React.createElement(LooksTwoOutlined, { key: 1, color: 'error' }),
    React.createElement(Looks3Outlined, { key: 2, color: 'error' }),
    React.createElement(Looks4Outlined, { key: 3, color: 'error' }),
    React.createElement(Looks5Outlined, { key: 4, color: 'error' }),
    React.createElement(Looks6Outlined, { key: 5, color: 'error' }),
  ]

  return {
    // session info
    idSquadra: data.idSquadra,
    squadra: data.squadra,
    // data state
    enableRosa: data.enableRosa,
    message: data.message,
    giornate: data.giornate,
    idTorneo: data.idTorneo,
    setIdTorneo: data.setIdTorneo,
    setIdPartita: data.setIdPartita,
    rosa: data.rosa,
    campo: data.campo,
    panca: data.panca,
    modulo: data.modulo,
    isLoading: data.isLoading,
    // action state
    idGiocatoreStat: actions.idGiocatoreStat,
    setIdGiocatoreStat: actions.setIdGiocatoreStat,
    openModalCalendario: actions.openModalCalendario,
    setOpenModalCalendario: actions.setOpenModalCalendario,
    saving: actions.saving,
    // alert state
    openAlert,
    setOpenAlert,
    alertMessage,
    alertSeverity,
    // derived
    filterIcons,
    // handlers
    handleClickPlayer: actions.handleClickPlayer,
    handleSave: actions.handleSave,
    handleModalCalendarioClose: actions.handleModalCalendarioClose,
    resetFormazione: actions.resetFormazione,
    canConfirmPrecedente: precedente.canConfirmPrecedente,
    confirmingPrecedente: precedente.confirmingPrecedente,
    handleConfirmPrecedente: precedente.handleConfirmPrecedente,
    formazioneGiaRilasciata: precedente.formazioneGiaRilasciata,
  }
}
