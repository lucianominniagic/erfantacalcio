'use client'
import {
  Alert,
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  TextField,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/CheckCircle'
import { GenericCard } from '~/components/cards'
import { type GiocatoreType } from '~/types/giocatori'
import { ruoliList, getRuoloEsteso } from '~/utils/formazione'

interface GiocatoreFormPanelProps {
  giocatore: GiocatoreType
  selectedGiocatoreId: number | undefined
  selectedGiocatore: string | undefined
  errorMessage: string
  message: string
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onCancel: () => void
  onDelete: () => void
  onInputChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    form: 'anagrafica' | 'trasferimento',
  ) => void
  onSelectChange: (
    event: SelectChangeEvent,
    form: 'anagrafica' | 'trasferimento',
  ) => void
}

export default function GiocatoreFormPanel({
  giocatore,
  selectedGiocatoreId,
  selectedGiocatore,
  errorMessage,
  message,
  onSubmit,
  onCancel,
  onDelete,
  onInputChange,
  onSelectChange,
}: GiocatoreFormPanelProps) {
  return (
    <GenericCard
      title="Anagrafica giocatore"
      subtitle="Inserisci/aggiorna giocatore"
      titleVariant="h4"
      sx={{ p: 0 }}
    >
      <Box component="form" onSubmit={onSubmit} noValidate sx={{ mt: 1 }}>
        <Grid container spacing={0}>
          <Grid item xs={8}>
            <Stack direction="row" spacing={1} justifyContent="flex-start">
              <TextField
                margin="normal"
                size="small"
                variant="outlined"
                required
                sx={{ m: 2 }}
                label="Nome"
                name="nome"
                value={giocatore?.nome ?? selectedGiocatore}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  onInputChange(event, 'anagrafica')
                }
              />
              <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                <InputLabel id="select-label-ruolo">Ruolo</InputLabel>
                <Select
                  size="small"
                  variant="outlined"
                  labelId="select-label-ruolo"
                  label="Ruolo"
                  sx={{ m: 0 }}
                  name="ruolo"
                  value={giocatore?.ruolo ?? 'P'}
                  onChange={(event: SelectChangeEvent) =>
                    onSelectChange(event, 'anagrafica')
                  }
                >
                  {ruoliList.map((item) => (
                    <MenuItem key={item} value={item}>
                      {getRuoloEsteso(item)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                margin="normal"
                size="small"
                variant="outlined"
                required
                sx={{ m: 2 }}
                label="Nome fantagazzetta"
                name="nomeFantagazzetta"
                value={giocatore?.nomeFantagazzetta ?? ''}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                  onInputChange(event, 'anagrafica')
                }
              />
            </Stack>
          </Grid>
          <Grid item xs={4}>
            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                type="button"
                onClick={onCancel}
                variant="outlined"
                sx={{ mt: 3, mb: 2 }}
              >
                Annulla
              </Button>
              {selectedGiocatoreId !== undefined && (
                <Button
                  type="button"
                  onClick={onDelete}
                  color="error"
                  variant="outlined"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Elimina
                </Button>
              )}
              <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
                {selectedGiocatoreId
                  ? 'Aggiorna giocatore'
                  : 'Aggiungi giocatore'}
              </Button>
            </Stack>
          </Grid>
          <Grid item xs={12}>
            <Stack
              direction="row"
              spacing={1}
              justifyContent="space-between"
            >
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
              {errorMessage && (
                <Stack sx={{ width: '100%' }} spacing={0}>
                  <Alert
                    icon={<CheckIcon fontSize="inherit" />}
                    severity="error"
                  >
                    {errorMessage}
                  </Alert>
                </Stack>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>
    </GenericCard>
  )
}
