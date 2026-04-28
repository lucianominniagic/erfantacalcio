'use client'
import { useState, useEffect, useCallback } from 'react'
import {
  Grid,
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Alert,
  AlertTitle,
  CardHeader,
  Select,
  MenuItem,
  type SelectChangeEvent,
  LinearProgress,
  FormControl,
  InputLabel,
  Paper,
} from '@mui/material'
import LinearProgressBar from '~/components/LinearProgressBar/LinearProgressBar'
import { api } from '~/utils/api'
import { getDescrizioneGiornata, getIdNextGiornata } from '~/utils/helper'
import { CloudUpload } from '@mui/icons-material'
import { type iVotoGiocatore } from '~/types/voti'
import { z } from 'zod'
import { calendarioSchema } from '~/schemas/calendario'

export default function UploadVoti() {
  //#region select calendario
  const [selectedIdCalendario, setSelectedIdCalendario] = useState<number>()
  const [selectedGiornataSerieA, setSelectedGiornataSerieA] = useState<number>(0)
  const [calendario, setCalendario] = useState<z.infer<typeof calendarioSchema>[]>([])
  const calendarioList = api.calendario.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
  

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
      console.log(`Imposto calendario di default a ${idCalendario}`)
      setSelectedIdCalendario(idCalendario)
      setSelectedGiornataSerieA(getGiornataSerieA(idCalendario))
    }
  }, [calendarioList.data, getGiornataSerieA])

  const handleChangeCalendario = async (event: SelectChangeEvent) => {
    const idCalendario = event.target.value
    setSelectedIdCalendario(parseInt(idCalendario))
    setSelectedGiornataSerieA(getGiornataSerieA(parseInt(idCalendario)))
  }

  //#endregion

  //#region upload file
  const uploadFileVercel = api.voti.uploadVercel.useMutation()
  const resetVoti = api.voti.resetVoti.useMutation()
  const readVoti = api.voti.readVoti.useMutation()
  const processVoti = api.voti.processVoti.useMutation()
  const refreshStats = api.voti.refreshStats.useMutation()
  const [infofile, setInfofile] = useState('')
  const [file, setFile] = useState<File | undefined>()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [alert, setAlert] = useState<{
    severity: 'success' | 'error' | 'warning'
    message: string
    title: string
  } | null>(null)
  const handleSelezioneFile = async () => {
    document.getElementById('upload-input')?.click()
  }
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0])
    setInfofile('')
    setProgress(0)
    setUploading(false)

    if (event.target.files?.[0]) {
      setInfofile(
        `Nome file: ${event.target.files?.[0]?.name ?? ''}, dimensioni del file: ${(event.target.files?.[0]?.size ?? 0) / 1000} Kb, tipo: ${event.target.files?.[0]?.type}`,
      )
    }
  }

  const handleUploadVercel = async () => {
    if (await validateForm(file)) {
      const filename = `voti_${selectedGiornataSerieA}_${selectedIdCalendario}.csv`
      setUploading(true)

      const MAX_SIZE = 4.5 * 1024 * 1024 // Dimensione del blocco (4.5 MB)
      let offset = 0

      // Funzione per leggere e caricare un blocco del file
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

              // Carica il blocco corrente
              try {
                const serverPathfilename = await uploadFileVercel.mutateAsync({
                  idCalendario: selectedIdCalendario ?? 0,
                  fileName: filename,
                  fileData: fileData,
                })
                setProgress(5)

                await resetVoti.mutateAsync({
                  idCalendario: selectedIdCalendario ?? 0,
                })
                setProgress(10)

                const voti = await readVoti.mutateAsync({
                  fileUrl: serverPathfilename,
                })
                try {
                  await processRecords(voti)
                } catch (error) {
                  setProgress(0)
                  setAlert({
                    severity: 'error',
                    message: error instanceof Error ? error.message : 'Errore sconosciuto durante il processamento dei voti',
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
              } catch (error) {
                setAlert({
                  severity: 'error',
                  message: 'Errore caricamento file',
                  title: 'Errore',
                })
                return
              }
            }
          }

          reader.readAsArrayBuffer(blob)
        }
      }

      // Avvia il processo di caricamento del file
      readAndUploadBlock()
    }
  }

  async function processRecords(voti: iVotoGiocatore[]): Promise<void> {
    const chunkSize = 10
    const idCalendario = selectedIdCalendario ?? 0
    // Itera su ciascun blocco e chiama mutateAsync
    for (let i = 0; i < voti.length; i += chunkSize) {
      const chunk = voti.slice(i, i + chunkSize)
      const progressVoti = (i * 90) / voti.length + 10
      await processVoti.mutateAsync({
        idCalendario: idCalendario,
        votiGiocatori: chunk,
      })
      setProgress(progressVoti)
    }
  }

  const validateForm = async (file: File | undefined) => {
    if (!file) {
      setAlert({
        severity: 'error',
        message: 'Nessun file selezionato.',
        title: 'Avviso',
      })
      return
    }
    if (file.size > 4.5 * 1024 * 1024) {
      // Converti 5 MB in byte
      setAlert({
        severity: 'error',
        message: 'La dimensione del file supera i 4.5 megabyte.',
        title: 'Avviso',
      })
      return // File non valido
    }

    return true
  }

  //#endregion

  return (
    <Grid container justifyContent="center" spacing={0}>
      <Grid item xs={12} md={6}>
        {calendarioList.isLoading ? (
          <Box
            sx={{
              width: '90%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <LinearProgress color="inherit" />
          </Box>
        ) : (
          <Paper elevation={3}>
            <Card sx={{ maxWidth: 600, p: 1 }}>
              <CardHeader
                title="Upload file voti"
                subheader="ammessi solo file .csv"
                titleTypographyProps={{ variant: 'h4' }}
              />
              <CardContent>
                <Box sx={{ p: 1 }}>
                  <Stack
                    direction="column"
                    spacing={1}
                    justifyContent="space-between"
                  >
                    <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                      <InputLabel id="select-label-calendario">
                        Calendario
                      </InputLabel>
                      <Select
                        size="small"
                        variant="outlined"
                        labelId="select-label-calendario"
                        label="Calendario"
                        sx={{ m: 0 }}
                        required
                        value={selectedIdCalendario?.toString() ?? ''}
                        onChange={handleChangeCalendario}
                      >
                        {calendario.map((item) => (
                          <MenuItem
                            key={item.id}
                            value={item.id.toString()}
                            
                          >
                            {getDescrizioneGiornata(
                              item.giornataSerieA,
                              item.nome,
                              item.giornata,
                              item.gruppoFase,
                            )}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      color="info"
                      variant="contained"
                      component="div"
                      onClick={handleSelezioneFile}
                    >
                      Seleziona file
                    </Button>
                    <input
                      accept=".csv"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                      type="file"
                      id="upload-input"
                    />
                    <Button
                      color="info"
                      variant="contained"
                      onClick={handleUploadVercel}
                      startIcon={<CloudUpload />}
                      disabled={uploading}
                    >
                      Upload
                    </Button>
                  </Stack>
                </Box>
                <Box sx={{ p: 1 }}>
                  <Typography
                    variant="body2"
                    component="div"
                    color="text.secondary"
                  >
                    {infofile}
                  </Typography>
                </Box>
                <Box sx={{ p: 1 }}>
                  {uploading && (
                    <>
                      <br />
                      <LinearProgressBar progress={progress} />
                    </>
                  )}
                  {alert && (
                    <Alert
                      severity={alert.severity}
                      onClose={() => setAlert(null)}
                    >
                      <AlertTitle>{alert.title}</AlertTitle>
                      {alert.message}
                    </Alert>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Paper>
        )}
      </Grid>
    </Grid>
  )

  /* function getGiornataSerieA(idCalendario: number | undefined) {
        return calendarioList.data?.find(item => item.idCalendario === idCalendario)?.giornataSerieA ?? 0;
    } */
}
