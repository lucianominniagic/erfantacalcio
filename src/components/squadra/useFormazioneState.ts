import {
  Looks3Outlined,
  Looks4Outlined,
  Looks5Outlined,
  Looks6Outlined,
  LooksOneOutlined,
  LooksTwoOutlined,
} from '@mui/icons-material'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import React from 'react'
import { z } from 'zod'
import { api } from '~/utils/api'
import { type Moduli } from '~/types/common'
import { moduloDefault } from '~/utils/helper'
import {
  type GiocatoreFormazioneType,
  type GiocatoreType,
} from '~/types/squadre'
import { giornataSchema } from '~/schemas/calendario'
import {
  allowedFormations,
  calcolaCodiceFormazione,
  checkDataFormazione,
  formatModulo,
  sortPlayersByRoleDescThenCostoDesc,
  sortPlayersByRoleDescThenRiserva,
} from './utils'

export function useFormazioneState() {
  const session = useSession()
  const idSquadra = parseInt(session.data?.user?.id ?? '0')
  const squadra = session.data?.user?.squadra ?? ''

  const [idGiocatoreStat, setIdGiocatoreStat] = useState<number>()
  const [openModalCalendario, setOpenModalCalendario] = useState(false)
  const [enableRosa, setEnableRosa] = useState(false)
  const [message, setMessage] = useState('')
  const [giornate, setGiornate] = useState<z.infer<typeof giornataSchema>[]>([])
  const [idTorneo, setIdTorneo] = useState<number>()
  const [rosa, setRosa] = useState<GiocatoreFormazioneType[]>([])
  const [campo, setCampo] = useState<GiocatoreFormazioneType[]>([])
  const [panca, setPanca] = useState<GiocatoreFormazioneType[]>([])
  const [idPartita, setIdPartita] = useState<number>(0)
  const [modulo, setModulo] = useState<Moduli>(moduloDefault)
  const [openAlert, setOpenAlert] = useState(false)
  const [saving, setSaving] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertSeverity, setAlertSeverity] = useState<'success' | 'error'>('success')

  const calendarioProssima = api.formazione.getGiornateDaGiocare.useQuery(
    undefined,
    { refetchOnWindowFocus: false, refetchOnReconnect: false },
  )
  const saveFormazione = api.formazione.create.useMutation({
    onSuccess: async () => {
      setAlertSeverity('success')
    },
  })
  const formazioneList = api.formazione.get.useQuery(
    { idTorneo: idTorneo! },
    {
      enabled: !!idTorneo,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )
  const rosaList = api.squadre.getRosa.useQuery(
    { idSquadra: idSquadra, includeVenduti: false },
    {
      enabled: enableRosa,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  )

  useEffect(() => {
    if (calendarioProssima.data) {
      if (
        calendarioProssima.data.length > 0 &&
        checkDataFormazione(calendarioProssima.data[0]?.data)
      ) {
        setEnableRosa(true)
        // When multiple giornate, load campionato (girone === null) by default
        const campionato =
          calendarioProssima.data.find((g) => g.girone === null) ??
          calendarioProssima.data[0]
        setIdTorneo(campionato?.idTorneo)
      } else {
        const dataFine = calendarioProssima.data[0]?.dataFine
        if (dataFine && checkDataFormazione(dataFine)) {
          setMessage('Formazione non rilasciabile, è stata confermata la precedente formazione')
        } else {
          setMessage('Formazione non rilasciabile')
        }
      }
      setGiornate(calendarioProssima.data)
    }
  }, [calendarioProssima.data])

  useEffect(() => {
    if (rosaList.data) {
      const rosaConRuolo = rosaList.data.map((giocatore: GiocatoreType) => ({
        ...giocatore,
        titolare: false,
        riserva: null,
      }))
      setRosa(rosaConRuolo)
    }
  }, [rosaList.data, idTorneo])

  useEffect(() => {
    if (formazioneList.data) {
      setIdPartita(formazioneList.data.idPartita)
      setModulo(formazioneList.data.modulo as Moduli)
      setCampo(formazioneList.data.giocatori.filter((c) => c.titolare))
      setRosa(
        sortPlayersByRoleDescThenCostoDesc(
          formazioneList.data.giocatori.filter(
            (c) => !c.titolare && c.riserva === null,
          ),
        ),
      )
      setPanca(
        sortPlayersByRoleDescThenRiserva(
          formazioneList.data.giocatori.filter((c) => !c.titolare && c.riserva),
        ),
      )
    }
  }, [formazioneList.isFetching, formazioneList.isSuccess, formazioneList.data])

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
      setAlertMessage('Completa la formazione')
      setAlertSeverity('error')
    } else if (!idPartita && idPartita !== 0) {
      setAlertMessage('Nessuna partita in programma, impossibile procedere')
      setAlertSeverity('error')
    } else {
      setSaving(true)
      const giocatoriPayload = [...campo, ...panca].map((giocatore) => ({
        idGiocatore: giocatore.idGiocatore,
        titolare: giocatore.titolare,
        riserva: giocatore.riserva,
      }))

      if (idPartita !== 0) {
        await saveFormazione.mutateAsync({
          idPartita,
          modulo,
          giocatori: giocatoriPayload,
        })
        setAlertMessage(
          `Salvataggio completato: ${giornate.find((g) => g.partite.some((p) => p.idPartita === idPartita))?.Title ?? ''}`,
        )
      } else {
        await Promise.all(
          giornate.map(async (g) => {
            const idP = g.partite
              .filter((c) => c.idHome === idSquadra || c.idAway === idSquadra)
              .map((p) => p.idPartita)[0]!
            await saveFormazione.mutateAsync({
              idPartita: idP,
              modulo,
              giocatori: giocatoriPayload,
            })
          }),
        )
        setAlertMessage(
          'Salvataggio completato per entrambe le giornate di campionato e champions',
        )
      }
      setSaving(false)
    }
    setOpenAlert(true)
  }

  const handleModalCalendarioClose = () => setOpenModalCalendario(false)
  
  const resetFormazione = (newIdTorneo?: number) => {
    setModulo(moduloDefault)
    setCampo([])
    setPanca([])
    if (newIdTorneo !== undefined) {
      setRosa([])
      setIdTorneo(newIdTorneo)
    } else {
      setRosa(sortPlayersByRoleDescThenCostoDesc(rosa.concat(campo, panca)))
    }
  }

  const filterIcons = [
    React.createElement(LooksOneOutlined, { key: 0, color: 'error' }),
    React.createElement(LooksTwoOutlined, { key: 1, color: 'error' }),
    React.createElement(Looks3Outlined, { key: 2, color: 'error' }),
    React.createElement(Looks4Outlined, { key: 3, color: 'error' }),
    React.createElement(Looks5Outlined, { key: 4, color: 'error' }),
    React.createElement(Looks6Outlined, { key: 5, color: 'error' }),
  ]

  const isLoading =
    (rosaList.isLoading && enableRosa) || calendarioProssima.isLoading

  return {
    // session info
    idSquadra,
    squadra,
    // state
    idGiocatoreStat,
    setIdGiocatoreStat,
    openModalCalendario,
    setOpenModalCalendario,
    openAlert,
    setOpenAlert,
    saving,
    alertMessage,
    alertSeverity,
    enableRosa,
    message,
    giornate,
    idTorneo,
    setIdTorneo,
    setIdPartita,
    rosa,
    campo,
    panca,
    modulo,
    // derived
    isLoading,
    filterIcons,
    // handlers
    handleClickPlayer,
    handleSave,
    handleModalCalendarioClose,
    resetFormazione,
  }
}
