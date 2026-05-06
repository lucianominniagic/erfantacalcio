'use client'
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  LinearProgress,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  Typography,
} from '@mui/material'
import { CloudUpload } from '@mui/icons-material'
import { z } from 'zod'
import { calendarioSchema } from '~/schemas/calendario'
import { getDescrizioneGiornata } from '~/utils/helper'
import LinearProgressBar from '~/components/LinearProgressBar/LinearProgressBar'

type AlertState = {
  severity: 'success' | 'error' | 'warning'
  message: string
  title: string
} | null

interface UploadVotiFormProps {
  selectedIdCalendario: number | undefined
  calendario: z.infer<typeof calendarioSchema>[]
  infofile: string
  uploading: boolean
  progress: number
  alert: AlertState
  onAlertClose: () => void
  onChangeCalendario: (event: SelectChangeEvent) => void
  onSelezioneFile: () => void
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onUpload: () => void
}

export default function UploadVotiForm({
  selectedIdCalendario,
  calendario,
  infofile,
  uploading,
  progress,
  alert,
  onAlertClose,
  onChangeCalendario,
  onSelezioneFile,
  onFileChange,
  onUpload,
}: UploadVotiFormProps) {
  return (
    <Card elevation={2} sx={{ borderRadius: 2, p: 1 }}>
      <CardContent>
        <Box sx={{ p: 1 }}>
          <Stack direction="column" spacing={1} justifyContent="space-between">
            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
              <InputLabel id="select-label-calendario">Calendario</InputLabel>
              <Select
                size="small"
                variant="outlined"
                labelId="select-label-calendario"
                label="Calendario"
                sx={{ m: 0 }}
                required
                value={selectedIdCalendario?.toString() ?? ''}
                onChange={onChangeCalendario}
              >
                {calendario.map((item) => (
                  <MenuItem key={item.id} value={item.id.toString()}>
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
              variant="contained"
              component="div"
              onClick={onSelezioneFile}
            >
              Seleziona file
            </Button>
            <input
              accept=".csv"
              style={{ display: 'none' }}
              onChange={onFileChange}
              type="file"
              id="upload-input"
            />
            <Button
              variant="contained"
              onClick={onUpload}
              startIcon={<CloudUpload />}
              disabled={uploading}
            >
              Upload
            </Button>
          </Stack>
        </Box>
        <Box sx={{ p: 1 }}>
          <Typography variant="body2" component="div" color="text.secondary">
            {infofile}
          </Typography>
        </Box>
        <Box sx={{ p: 1 }}>
          {uploading && (
            <Box sx={{ mt: 1 }}>
              <LinearProgressBar progress={progress} />
            </Box>
          )}
          {alert && (
            <Alert severity={alert.severity} onClose={onAlertClose}>
              <AlertTitle>{alert.title}</AlertTitle>
              {alert.message}
            </Alert>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}
