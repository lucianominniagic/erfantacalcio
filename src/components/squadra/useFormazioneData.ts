import { useSession } from 'next-auth/react'
import { type Dispatch, useEffect, useReducer, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { orpc } from '~/utils/orpc'
import { type Moduli } from '~/types/common'
import { moduloDefault } from '~/utils/formazione'
import {
  type GiocatoreFormazioneType,
  type GiocatoreType,
} from '~/types/squadre'
import { giornataSchema } from '~/schemas/calendario'
import {
  checkDataFormazione,
  sortPlayersByRoleDescThenCostoDesc,
  sortPlayersByRoleDescThenRiserva,
} from './utils'

export type FormazioneState = {
  rosa: GiocatoreFormazioneType[]
  campo: GiocatoreFormazioneType[]
  panca: GiocatoreFormazioneType[]
  modulo: Moduli
  idPartita: number
}

export type FormazioneAction =
  | { type: 'INIT_FROM_ROSA'; payload: GiocatoreFormazioneType[] }
  | {
      type: 'INIT_FROM_FORMAZIONE'
      payload: {
        rosa: GiocatoreFormazioneType[]
        campo: GiocatoreFormazioneType[]
        panca: GiocatoreFormazioneType[]
        modulo: Moduli
        idPartita: number
      }
    }
  | {
      type: 'UPDATE_LISTS'
      payload: {
        rosa: GiocatoreFormazioneType[]
        campo: GiocatoreFormazioneType[]
        panca: GiocatoreFormazioneType[]
      }
    }
  | { type: 'SET_MODULO'; payload: Moduli }
  | { type: 'SET_ID_PARTITA'; payload: number }
  | { type: 'RESET'; payload: GiocatoreFormazioneType[] }
  | { type: 'RESET_FOR_GIORNATA' }

export type FormazioneDispatch = Dispatch<FormazioneAction>

const initialState: FormazioneState = {
  rosa: [],
  campo: [],
  panca: [],
  modulo: moduloDefault,
  idPartita: 0,
}

function formazioneReducer(
  state: FormazioneState,
  action: FormazioneAction,
): FormazioneState {
  switch (action.type) {
    case 'INIT_FROM_ROSA':
      return { ...state, rosa: action.payload }
    case 'INIT_FROM_FORMAZIONE':
      return { ...state, ...action.payload }
    case 'UPDATE_LISTS':
      return { ...state, ...action.payload }
    case 'SET_MODULO':
      return { ...state, modulo: action.payload }
    case 'SET_ID_PARTITA':
      return { ...state, idPartita: action.payload }
    case 'RESET':
      return { ...state, rosa: action.payload, campo: [], panca: [], modulo: moduloDefault }
    case 'RESET_FOR_GIORNATA':
      return initialState
    default:
      return state
  }
}

export function useFormazioneData() {
  const session = useSession()
  const idSquadra = parseInt(session.data?.user?.id ?? '0')
  const squadra = session.data?.user?.squadra ?? ''

  const [enableRosa, setEnableRosa] = useState(false)
  const [message, setMessage] = useState('')
  const [giornate, setGiornate] = useState<z.infer<typeof giornataSchema>[]>([])
  const [idTorneo, setIdTorneo] = useState<number>()
  const [state, dispatch] = useReducer(formazioneReducer, initialState)

  const calendarioProssima = useQuery(
    orpc.formazione.getGiornateDaGiocare.queryOptions({
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
  )
  const formazioneList = useQuery(
    orpc.formazione.get.queryOptions({
      input: { idTorneo: idTorneo! },
      enabled: !!idTorneo,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
  )
  const rosaList = useQuery(
    orpc.squadre.getRosa.queryOptions({
      input: { idSquadra, includeVenduti: false },
      enabled: enableRosa,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
  )

  useEffect(() => {
    if (calendarioProssima.data) {
      if (
        calendarioProssima.data.length > 0 &&
        checkDataFormazione(calendarioProssima.data[0]?.data)
      ) {
        setEnableRosa(true)
        const campionato =
          calendarioProssima.data.find((g) => g.girone === null) ??
          calendarioProssima.data[0]
        setIdTorneo(campionato?.idTorneo)
      } else {
        const dataFine = calendarioProssima.data[0]?.dataFine
        if (dataFine && checkDataFormazione(dataFine)) {
          setMessage(
            'Formazione non rilasciabile, vuoi confermare la precedente formazione?',
          )
        } else {
          setMessage('Formazione non rilasciabile')
        }
        const campionato =
          calendarioProssima.data.find((g) => g.girone === null) ??
          calendarioProssima.data[0]
        setIdTorneo(campionato?.idTorneo)
      }
      setGiornate(calendarioProssima.data)
    }
  }, [calendarioProssima.data])

  useEffect(() => {
    // INIT_FROM_FORMAZIONE always wins; INIT_FROM_ROSA is the fallback when no saved formation exists
    if (formazioneList.data) {
      dispatch({
        type: 'INIT_FROM_FORMAZIONE',
        payload: {
          idPartita: formazioneList.data.idPartita,
          modulo: formazioneList.data.modulo as Moduli,
          campo: formazioneList.data.giocatori.filter((c) => c.titolare),
          rosa: sortPlayersByRoleDescThenCostoDesc(
            formazioneList.data.giocatori.filter(
              (c) => !c.titolare && c.riserva === null,
            ),
          ),
          panca: sortPlayersByRoleDescThenRiserva(
            formazioneList.data.giocatori.filter((c) => !c.titolare && c.riserva),
          ),
        },
      })
    } else if (rosaList.data) {
      dispatch({
        type: 'INIT_FROM_ROSA',
        payload: rosaList.data.map((giocatore: GiocatoreType) => ({
          ...giocatore,
          titolare: false,
          riserva: null,
        })),
      })
    }
  }, [
    rosaList.data,
    idTorneo,
    formazioneList.data,
    formazioneList.isFetching,
    formazioneList.isSuccess,
  ])

  const isLoading =
    (rosaList.isLoading && enableRosa) || calendarioProssima.isLoading

  return {
    idSquadra,
    squadra,
    enableRosa,
    message,
    giornate,
    idTorneo,
    setIdTorneo,
    ...state,
    setIdPartita: (id: number) => dispatch({ type: 'SET_ID_PARTITA', payload: id }),
    isLoading,
    formazioneList,
    dispatch,
  }
}

export type FormazioneDataState = ReturnType<typeof useFormazioneData>
