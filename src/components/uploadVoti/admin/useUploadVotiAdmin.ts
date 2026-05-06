'use client'
import { useState, useEffect, useCallback } from 'react'
import { type SelectChangeEvent } from '@mui/material'
import { z } from 'zod'
import { api } from '~/utils/api'
import { getIdNextGiornata } from '~/utils/helper'
import { type iVotoGiocatore } from '~/types/voti'
import { calendarioSchema } from '~/schemas/calendario'

type AlertState = {
  severity: 'success' | 'error' | 'warning'
  message: string
  title: string
} | null

export function useUploadVotiAdmin() {
  const [selectedIdCalendario, setSelectedIdCalendario] = useState<number>()
  const [selectedGiornataSerieA, setSelectedGiornataSerieA] =
    useState<number>(0)
  const [calendario, setCalendario] = useState<
    z.infer<typeof calendarioSchema>[]
  >([])
  const [infofile, setInfofile] = useState('')
  const [file, setFile] = useState<File | undefined>()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [alert, setAlert] = useState<AlertState>(null)

  // ── queries / mutations ───────────────────────────────────────────────────
  const calendarioList = api.calendario.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
  const uploadFileVercel = api.voti.uploadVercel.useMutation()
  const resetVoti = api.voti.resetVoti.useMutation()
  const readVoti = api.voti.readVoti.useMutation()
  const processVoti = api.voti.processVoti.useMutation()
  const refreshStats = api.voti.refreshStats.useMutation()

  // ── effects ───────────────────────────────────────────────────────────────
  const getGiornataSerieA = useCallback(
    (idCalendario: number | undefined) => {
      return (
        calendarioList.data?.find((item) => item.id === idCalendario)
          ?.giornataSerieA ?? 0
      )
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

  async function processRecords(voti: iVotoGiocatore[]): Promise<void> {
    const chunkSize = 10
    const idCalendario = selectedIdCalendario ?? 0
    for (let i = 0; i < voti.length; i += chunkSize) {
      const chunk = voti.slice(i, i + chunkSize)
      const progressVoti = (i * 90) / voti.length + 10
      await processVoti.mutateAsync({ idCalendario, votiGiocatori: chunk })
      setProgress(progressVoti)
    }
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
      setInfofile(
        `Nome file: ${f.name}, dimensioni del file: ${f.size / 1000} Kb, tipo: ${f.type}`,
      )
    }
  }

  const handleUploadVercel = async () => {
    if (!validateForm(file)) return
    const filename = `voti_${selectedGiornataSerieA}_${selectedIdCalendario}.csv`
    setUploading(true)

    const MAX_SIZE = 4.5 * 1024 * 1024
    let offset = 0

    const readAndUploadBlock = () => {
      if (file) {
        const blob = file.slice(offset, offset + MAX_SIZE)
        const reader = new FileReader()

        reader.onload = async () => {
          if (reader.result && typeof reader.result !== 'string') {
            const blockData = new Uint8Array(reader.result)
            const fileData = Buffer.from(blockData).toString('base64')
            const contentLength = blockData.length
            offset += contentLength

            setProgress(0)

            try {
              const serverPathfilename = await uploadFileVercel.mutateAsync({
                idCalendario: selectedIdCalendario ?? 0,
                fileName: filename,
                fileData: fileData,
              })
              setProgress(5)

              await resetVoti.mutateAsync({ idCalendario: selectedIdCalendario ?? 0 })
              setProgress(10)

              const voti = await readVoti.mutateAsync({ fileUrl: serverPathfilename })
              try {
                await processRecords(voti)
              } catch (error) {
                setProgress(0)
                setAlert({
                  severity: 'error',
                  message:
                    error instanceof Error
                      ? error.message
                      : 'Errore sconosciuto durante il processamento dei voti',
                  title: 'Errore',
                })
                return
              }
              setProgress(90)
              await refreshStats.mutateAsync({ ruolo: 'P' })
              setProgress(92)
              await refreshStats.mutateAsync({ ruolo: 'D' })
              setProgress(95)
              await refreshStats.mutateAsync({ ruolo: 'C' })
              setProgress(98)
              await refreshStats.mutateAsync({ ruolo: 'A' })
              setProgress(100)

              setUploading(false)
              setAlert({
                severity: 'success',
                message: `File processato correttamente: ${serverPathfilename}`,
                title: 'File inviato',
              })
            } catch {
              setAlert({ severity: 'error', message: 'Errore caricamento file', title: 'Errore' })
            }
          }
        }

        reader.readAsArrayBuffer(blob)
      }
    }

    readAndUploadBlock()
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
