import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { orpc } from '~/utils/orpc'
import { type Moduli } from '~/types/common'
import { moduloDefault } from '~/utils/helper'
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

export function useFormazioneData() {
  const session = useSession()
  const idSquadra = parseInt(session.data?.user?.id ?? '0')
  const squadra = session.data?.user?.squadra ?? ''

  const [enableRosa, setEnableRosa] = useState(false)
  const [message, setMessage] = useState('')
  const [giornate, setGiornate] = useState<z.infer<typeof giornataSchema>[]>([])
  const [idTorneo, setIdTorneo] = useState<number>()
  const [rosa, setRosa] = useState<GiocatoreFormazioneType[]>([])
  const [campo, setCampo] = useState<GiocatoreFormazioneType[]>([])
  const [panca, setPanca] = useState<GiocatoreFormazioneType[]>([])
  const [idPartita, setIdPartita] = useState<number>(0)
  const [modulo, setModulo] = useState<Moduli>(moduloDefault)

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
    rosa,
    setRosa,
    campo,
    setCampo,
    panca,
    setPanca,
    idPartita,
    setIdPartita,
    modulo,
    setModulo,
    isLoading,
    formazioneList,
  }
}

export type FormazioneDataState = ReturnType<typeof useFormazioneData>
