'use client'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/CheckCircle'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker'
import dayjs from 'dayjs'
import 'dayjs/locale/it'
import { z } from 'zod'
import Modal from '~/components/modal/Modal'
import { calendarioSchema } from '~/schemas/calendario'

type CalendarioEntry = z.infer<typeof calendarioSchema>

interface TorneoItem {
  idTorneo: number
  nome: string
  gruppoFase: string | null
}

interface CalendarioFormProps {
  open: boolean
  calendarioInModifica: CalendarioEntry
  torneiList: TorneoItem[] | undefined
  errorMessage: string
  message: string
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onClose: () => void
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onSelectChange: (event: SelectChangeEvent) => void
  onDateChange: (field: 'data' | 'dataFine', value: string) => void
}

export default function CalendarioForm({
  open,
  calendarioInModifica,
  torneiList,
  errorMessage,
  message,
  onSubmit,
  onClose,
  onInputChange,
  onSelectChange,
  onDateChange,
}: CalendarioFormProps) {
  return (
    <Modal title="Modifica dati calendario" open={open} onClose={onClose}>
      <Divider />
      <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
        <Grid container spacing={0}>
          <Grid item xs={12}>
            {errorMessage && (
              <Stack sx={{ width: '100%' }} spacing={0}>
                <Alert icon={<CheckIcon fontSize="inherit" />} severity="error">
                  {errorMessage}
                </Alert>
              </Stack>
            )}
          </Grid>
          <Grid item xs={12}>
            <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
              <InputLabel id="select-label-torneo">Nome torneo</InputLabel>
              <Select
                size="small"
                variant="outlined"
                labelId="select-label-torneo"
                label="Nome torneo"
                margin="dense"
                required
                sx={{ m: 2 }}
                name="idTorneo"
                onChange={onSelectChange}
                value={
                  torneiList
                    ? calendarioInModifica.idTorneo.toString()
                    : ''
                }
              >
                {torneiList?.map((item) => (
                  <MenuItem
                    key={`torneiSlc_${item.idTorneo}`}
                    value={item.idTorneo}
                  >
                    {item.nome} {item.gruppoFase}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              size="small"
              variant="outlined"
              required
              type="number"
              sx={{ m: 2 }}
              label="Giornata"
              name="giornata"
              value={calendarioInModifica.giornata}
              onChange={onInputChange}
            />
            <TextField
              margin="normal"
              size="small"
              variant="outlined"
              required
              type="number"
              sx={{ m: 2 }}
              label="Giornata serie A"
              name="giornataSerieA"
              value={calendarioInModifica.giornataSerieA}
              autoFocus
              onChange={onInputChange}
            />
            <TextField
              margin="normal"
              size="small"
              variant="outlined"
              type="number"
              sx={{ m: 2 }}
              label="Girone"
              name="girone"
              value={calendarioInModifica.girone}
              onChange={onInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="it">
              <MobileDateTimePicker
                label="Data inizio"
                value={dayjs(calendarioInModifica.data)}
                onChange={(newValue) =>
                  onDateChange(
                    'data',
                    newValue?.toISOString() ?? new Date().toISOString(),
                  )
                }
              />
              <MobileDateTimePicker
                label="Data fine (opzionale)"
                value={
                  calendarioInModifica.dataFine
                    ? dayjs(calendarioInModifica.dataFine)
                    : null
                }
                onChange={(newValue) =>
                  onDateChange('dataFine', newValue?.toISOString() ?? '')
                }
                slotProps={{
                  textField: {
                    helperText: 'Se vuoto, usa la data di inizio',
                    size: 'small',
                  },
                }}
              />
            </LocalizationProvider>

            <FormControlLabel
              sx={{ ml: 2, mr: 2 }}
              color="error"
              control={
                <Checkbox
                  onChange={onInputChange}
                  color="success"
                  name="isRecupero"
                  checked={calendarioInModifica.isRecupero}
                  value={calendarioInModifica.isRecupero}
                />
              }
              label={<Typography color="primary">Da recuperare</Typography>}
            />
            <FormControlLabel
              sx={{ ml: 2, mr: 2 }}
              color="error"
              control={
                <Checkbox
                  onChange={onInputChange}
                  color="success"
                  name="isSovrapposta"
                  checked={calendarioInModifica.isSovrapposta}
                  value={calendarioInModifica.isSovrapposta}
                />
              }
              label={<Typography color="primary">Sovrapposta</Typography>}
            />
          </Grid>
          <Grid item xs={12}>
            <Stack
              direction="row"
              spacing={2}
              justifyContent="flex-end"
              sx={{ mt: 2 }}
            >
              <Button
                type="button"
                onClick={onClose}
                color="primary"
                variant="outlined"
              >
                Chiudi
              </Button>
              <Button type="submit" color="primary" variant="contained">
                Aggiorna dati
              </Button>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            {message && (
              <Stack sx={{ width: '100%' }} spacing={0}>
                <Alert
                  icon={<CheckIcon fontSize="inherit" />}
                  severity="success"
                >
                  {message}
                </Alert>
              </Stack>
            )}
          </Grid>
        </Grid>
      </Box>
    </Modal>
  )
}
