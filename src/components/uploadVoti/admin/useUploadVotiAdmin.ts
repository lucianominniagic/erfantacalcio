'use client'
import { useState, useEffect, useCallback } from 'react'
import { type SelectChangeEvent } from '@mui/material'
import { z } from 'zod'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '~/utils/orpc'
import { getIdNextGiornata } from '~/utils/torneo'
import { calendarioSchema } from '~/schemas/calendario'

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
      setUploading(true)
      setProgress(0)

      try {
        const stream = await orpc.voti.importaVotiGiornata.call({
          idCalendario: selectedIdCalendario ?? 0,
          fileName: filename,
          fileData,
        })

        for await (const event of stream) {
          setProgress(event.progress)
          if (event.step === 'done') {
            setUploading(false)
            setAlert({
              severity: 'success',
              message: `File processato correttamente: ${event.fileUrl}`,
              title: 'File inviato',
            })
          }
        }
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
