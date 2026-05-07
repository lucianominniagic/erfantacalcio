'use client'
import {
  Alert,
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  type SelectChangeEvent,
  Stack,
  TextField,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/CheckCircle'
import dayjs from 'dayjs'
import { GenericCard } from '~/components/cards'
import { type AutocompleteOption } from '~/components/autocomplete/GenericAutocomplete'
import { type trasferimentoType } from '~/types/trasferimenti'
import { Configurazione } from '~/config'
import { convertFromIsoToDatetimeMUI } from '~/utils/dateUtils'

interface TrasferimentoFormPanelProps {
  trasferimento: trasferimentoType
  selectedGiocatoreId: number | undefined
  selectedTrasferimentoId: number | undefined
  selectedTrasferimentoStagione: string | undefined
  squadre: AutocompleteOption[]
  squadreSerieA: AutocompleteOption[]
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

export default function TrasferimentoFormPanel({
  trasferimento,
  selectedGiocatoreId,
  selectedTrasferimentoId,
  selectedTrasferimentoStagione,
  squadre,
  squadreSerieA,
  errorMessage,
  message,
  onSubmit,
  onCancel,
  onDelete,
  onInputChange,
  onSelectChange,
}: TrasferimentoFormPanelProps) {
  if (selectedGiocatoreId === undefined) return null

  return (
    <Paper elevation={3}>
      <GenericCard
        title="Trasferimento giocatore"
        subtitle="Inserisci/aggiorna trasferimento"
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
                  id="costo"
                  label="Costo"
                  name="costo"
                  type="number"
                  value={trasferimento.costo}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    onInputChange(event, 'trasferimento')
                  }
                />
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                  <InputLabel id="select-label-fantasquadra">
                    Fantasquadra
                  </InputLabel>
                  <Select
                    size="small"
                    variant="outlined"
                    labelId="select-label-fantasquadra"
                    label="Fantasquadra"
                    sx={{ m: 0 }}
                    id="idSquadra"
                    name="idSquadra"
                    value={trasferimento.idSquadra?.toLocaleString() ?? '0'}
                    onChange={(event: SelectChangeEvent) =>
                      onSelectChange(event, 'trasferimento')
                    }
                  >
                    {squadre.map((item) => (
                      <MenuItem
                        key={item.id}
                        value={item.id?.toLocaleString()}
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                  <InputLabel id="select-label-squadra">Squadra</InputLabel>
                  <Select
                    size="small"
                    variant="outlined"
                    labelId="select-label-squadra"
                    label="Squadra"
                    sx={{ m: 0 }}
                    id="idSquadraSerieA"
                    name="idSquadraSerieA"
                    value={
                      trasferimento.idSquadraSerieA?.toLocaleString() ?? '0'
                    }
                    onChange={(event: SelectChangeEvent) =>
                      onSelectChange(event, 'trasferimento')
                    }
                  >
                    {squadreSerieA.map((item) => (
                      <MenuItem
                        key={item.id}
                        value={item.id?.toLocaleString()}
                      >
                        {item.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  margin="normal"
                  size="small"
                  variant="outlined"
                  required
                  type="datetime-local"
                  sx={{ m: 2 }}
                  id="dataAcquisto"
                  label="Data Acquisto"
                  name="dataAcquisto"
                  value={convertFromIsoToDatetimeMUI(
                    dayjs(trasferimento.dataAcquisto).toISOString(),
                  )}
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    onInputChange(event, 'trasferimento')
                  }
                />
                <TextField
                  margin="normal"
                  size="small"
                  variant="outlined"
                  required
                  type="datetime-local"
                  sx={{ m: 2 }}
                  id="dataCessione"
                  name="dataCessione"
                  value={
                    trasferimento.dataCessione !== null
                      ? convertFromIsoToDatetimeMUI(
                          dayjs(trasferimento.dataCessione).toISOString(),
                        )
                      : null
                  }
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                    onInputChange(event, 'trasferimento')
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
                {selectedTrasferimentoId !== undefined &&
                  selectedTrasferimentoStagione ===
                    Configurazione.stagione && (
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
                {selectedTrasferimentoStagione === Configurazione.stagione && (
                  <Button
                    type="submit"
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                  >
                    {selectedTrasferimentoId
                      ? 'Aggiorna trasferimento'
                      : 'Aggiungi trasferimento'}
                  </Button>
                )}
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
    </Paper>
  )
}
