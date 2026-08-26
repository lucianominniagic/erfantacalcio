'use client'
import { useState, useEffect, useCallback } from 'react'
import { type SelectChangeEvent } from '@mui/material'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '~/utils/orpc'
import { getIdNextGiornata } from '~/utils/torneo'
import { calendarioSchema } from '~/schemas/calendario'
import { IMPORTA_VOTI_CHUNK_SIZE, IMPORTA_VOTI_RUOLI } from '~/types/voti'

type AlertState = {
  severity: 'success' | 'error' | 'warning'
  message: string
  title: string
} | null

export function useUploadVotiAdmin() {
  const [selectedIdCalendario, setSelectedIdCalendario] = useState<number>()
  const [selectedGiornataSerieA, setSelectedGiornataSerieA] = useState<number>(0)
  const [calendario, setCalendario] = useState<z.infer<typeof calendarioSchema>[]>([])
  const [infofile, setInfofile] = useState('')
  const [file, setFile] = useState<File | undefined>()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [alert, setAlert] = useState<AlertState>(null)

  // ── queries ───────────────────────────────────────────────────────────────
  const calendarioList = useQuery(
    orpc.calendario.list.queryOptions({
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
  )

  // ── effects ───────────────────────────────────────────────────────────────
  const getGiornataSerieA = useCallback(
    (idCalendario: number | undefined) => {
      return calendarioList.data?.find((item) => item.id === idCalendario)?.giornataSerieA ?? 0
    },
    [calendarioList.data],
  )

  useEffect(() => {
    if (calendarioList.data) {
      setCalendario(calendarioList.data)
      const idCalendario = getIdNextGiornata(calendarioList.data)
      setSelectedIdCalendario(idCalendario)
      setSelectedGiornataSerieA(getGiornataSerieA(idCalendario))
    }
  }, [calendarioList.data, getGiornataSerieA])

  // ── helpers ───────────────────────────────────────────────────────────────
  const validateForm = (f: File | undefined): boolean => {
    if (!f) {
      setAlert({ severity: 'error', message: 'Nessun file selezionato.', title: 'Avviso' })
      return false
    }
    if (f.size > 4.5 * 1024 * 1024) {
      setAlert({
        severity: 'error',
        message: 'La dimensione del file supera i 4.5 megabyte.',
        title: 'Avviso',
      })
      return false
    }
    return true
  }

  // ── handlers ──────────────────────────────────────────────────────────────
  const handleChangeCalendario = (event: SelectChangeEvent) => {
    const idCalendario = event.target.value
    setSelectedIdCalendario(parseInt(idCalendario))
    setSelectedGiornataSerieA(getGiornataSerieA(parseInt(idCalendario)))
  }

  const handleSelezioneFile = () => {
    document.getElementById('upload-input')?.click()
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0])
    setInfofile('')
    setProgress(0)
    setUploading(false)
    if (event.target.files?.[0]) {
      const f = event.target.files[0]
      setInfofile(`Nome file: ${f.name}, dimensioni del file: ${f.size / 1000} Kb, tipo: ${f.type}`)
    }
  }

  const handleUploadVercel = async () => {
    if (!validateForm(file)) return

    const filename = `voti_${selectedGiornataSerieA}_${selectedIdCalendario}.csv`
    const blob = file!.slice(0, file!.size)
    const reader = new FileReader()

    reader.onload = async () => {
      if (!reader.result || typeof reader.result === 'string') return

      const fileData = Buffer.from(new Uint8Array(reader.result)).toString('base64')
      const idCalendario = selectedIdCalendario ?? 0
      setUploading(true)
      setProgress(0)

      try {
        // Il processo è spezzato in tante chiamate separate (una invocazione
        // serverless ciascuna) per evitare il timeout di Vercel su un piano
        // base: una singola chiamata che fa tutto (upload + reset + parse +
        // upsert di tutti i voti + refresh statistiche) rischia di superare
        // il limite di durata della function.

        // Step 1/3: upload su Blob, reset voti esistenti, parsing CSV.
        const { fileUrl, voti } = await orpc.voti.importaVotiInit.call({
          idCalendario,
          fileName: filename,
          fileData,
        })
        setProgress(15)

        // Step 2/3: upsert dei voti, un chunk alla volta.
        for (let i = 0; i < voti.length; i += IMPORTA_VOTI_CHUNK_SIZE) {
          const chunk = voti.slice(i, i + IMPORTA_VOTI_CHUNK_SIZE)
          await orpc.voti.importaVotiProcessChunk.call({ idCalendario, voti: chunk })
          const processed = Math.min(i + chunk.length, voti.length)
          setProgress(15 + Math.round((processed / Math.max(voti.length, 1)) * 70))
        }

        // Step 3/3: refresh statistiche, un ruolo alla volta.
        for (let i = 0; i < IMPORTA_VOTI_RUOLI.length; i++) {
          await orpc.voti.importaVotiRefreshStats.call({ ruolo: IMPORTA_VOTI_RUOLI[i] })
          setProgress(85 + (i + 1) * 3)
        }

        setUploading(false)
        setProgress(100)
        setAlert({
          severity: 'success',
          message: `File processato correttamente: ${fileUrl}`,
          title: 'File inviato',
        })
      } catch (error) {
        setUploading(false)
        setProgress(0)
        setAlert({
          severity: 'error',
          message: error instanceof Error ? error.message : 'Errore caricamento file',
          title: 'Errore',
        })
      }
    }

    reader.readAsArrayBuffer(blob)
  }

  return {
    // state
    selectedIdCalendario,
    calendario,
    infofile,
    uploading,
    progress,
    alert,
    // derived
    calendarioIsLoading: calendarioList.isLoading,
    // handlers
    setAlert,
    handleChangeCalendario,
    handleSelezioneFile,
    handleFileChange,
    handleUploadVercel,
  }
}
