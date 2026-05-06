'use client'
import {
  Alert,
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/CheckCircle'
import Modal from '~/components/modal/Modal'
import { type votoType } from '~/types/voti'
import { Configurazione } from '~/config'

interface VotoEditModalProps {
  open: boolean
  voto: votoType
  errorMessage: string
  message: string
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onClose: () => void
  onVotoChange: (updated: votoType) => void
}

export default function VotoEditModal({
  open,
  voto,
  errorMessage,
  message,
  onSubmit,
  onClose,
  onVotoChange,
}: VotoEditModalProps) {
  return (
    <Modal title={`Modifica voto ${voto.nome}`} open={open} onClose={onClose}>
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
            <Stack direction="row" spacing={1} justifyContent="flex-start">
              <TextField
                margin="normal"
                size="small"
                variant="outlined"
                required
                type="number"
                sx={{ m: 2 }}
                label="Voto"
                name="voto"
                value={voto?.voto}
                onChange={(event) => {
                  onVotoChange({ ...voto, voto: parseFloat(event.target.value) })
                }}
              />
              <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                <InputLabel id="select-label-gol">Gol</InputLabel>
                <Select
                  size="small"
                  variant="outlined"
                  labelId="select-label-gol"
                  label="Gol"
                  sx={{ m: 0, width: '120px' }}
                  name="slcGol"
                  value={voto?.gol}
                  onChange={(event) => {
                    const newValue =
                      typeof event.target.value === 'string'
                        ? 0
                        : event.target.value
                    onVotoChange({ ...voto, gol: newValue })
                  }}
                >
                  {[...Array(6).keys()].map((i) => (
                    <MenuItem key={`slc_gol_${i}`} value={i}>
                      {i}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                <InputLabel id="select-label-assist">Assist</InputLabel>
                <Select
                  size="small"
                  variant="outlined"
                  labelId="select-label-assist"
                  label="Assist"
                  sx={{ m: 0, width: '120px' }}
                  name="slcAssist"
                  value={voto?.assist}
                  onChange={(event) => {
                    const newValue =
                      typeof event.target.value === 'string'
                        ? 0
                        : event.target.value
                    onVotoChange({ ...voto, assist: newValue })
                  }}
                >
                  {[...Array(6).keys()].map((i) => (
                    <MenuItem key={`slc_gol_${i}`} value={i}>
                      {i}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={1} justifyContent="flex-start">
              <FormControlLabel
                control={
                  <Switch
                    color="info"
                    checked={voto.ammonizione !== 0}
                    onChange={(event) => {
                      const newValue = event.target.checked
                        ? Configurazione.bonusAmmonizione
                        : 0
                      onVotoChange({ ...voto, ammonizione: newValue })
                    }}
                  />
                }
                label="Ammonizione"
              />
              <FormControlLabel
                control={
                  <Switch
                    color="error"
                    checked={voto.espulsione !== 0}
                    onChange={(event) => {
                      const newValue = event.target.checked
                        ? Configurazione.bonusEspulsione
                        : 0
                      onVotoChange({ ...voto, espulsione: newValue })
                    }}
                  />
                }
                label="Espulsione"
              />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={1} justifyContent="flex-start">
              <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                <InputLabel id="select-label-autogol">Autogol</InputLabel>
                <Select
                  size="small"
                  variant="outlined"
                  labelId="select-label-autogol"
                  label="Autogol"
                  sx={{ m: 0, width: '120px' }}
                  name="slcAutogol"
                  value={voto?.autogol}
                  onChange={(event) => {
                    const newValue =
                      typeof event.target.value === 'string'
                        ? 0
                        : event.target.value
                    onVotoChange({ ...voto, autogol: newValue })
                  }}
                >
                  {[...Array(2).keys()].map((i) => (
                    <MenuItem key={`slc_gol_${i}`} value={i}>
                      {i}
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
                label="Altri bonus"
                name="altribonus"
                value={voto?.altriBonus}
                onChange={(event) => {
                  onVotoChange({
                    ...voto,
                    altriBonus: parseFloat(event.target.value),
                  })
                }}
              />
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Stack
              direction="row"
              spacing={2}
              justifyContent="flex-end"
              sx={{ mt: 2 }}
            >
              <Button type="submit" variant="contained">
                Aggiorna dati
              </Button>
              <Button type="button" onClick={onClose} variant="outlined">
                Chiudi
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
