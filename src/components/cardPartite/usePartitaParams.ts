import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

export function usePartitaFromSearchParams() {
  const searchParams = useSearchParams()
  const idPartita = searchParams?.get('idPartita')
  const [partita, setPartita] = useState<number | null>(null)

  useEffect(() => {
    if (idPartita) {
      const parsed = Number(idPartita)
      setPartita(!isNaN(parsed) ? parsed : null)
    }
  }, [idPartita])

  return [partita, setPartita] as const
}

export function useGiocatoreModal() {
  const [idGiocatore, setIdGiocatore] = useState<number | undefined>()
  const [openModalCalendario, setOpenModalCalendario] = useState(false)

  const handleStatGiocatore = (id: number) => {
    setIdGiocatore(id)
    setOpenModalCalendario(true)
  }

  const handleModalClose = () => {
    setOpenModalCalendario(false)
  }

  return { idGiocatore, openModalCalendario, handleStatGiocatore, handleModalClose }
}
