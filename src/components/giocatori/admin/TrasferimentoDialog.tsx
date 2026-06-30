'use client'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  TextField,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/CheckCircle'
import dayjs from 'dayjs'
import { type AutocompleteOption } from '~/components/autocomplete/GenericAutocomplete'
import { type trasferimentoType } from '~/types/trasferimenti'
import { Configurazione } from '~/config'
import { convertFromIsoToDatetimeMUI } from '~/utils/dateUtils'

interface TrasferimentoDialogProps {
  open: boolean
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

export default function TrasferimentoDialog({
  open,
  trasferimento,
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
}: TrasferimentoDialogProps) {
  const isCurrentSeason =
    selectedTrasferimentoStagione === undefined ||
    selectedTrasferimentoStagione === Configurazione.stagione

  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === 'escapeKeyDown') onCancel()
      }}
      disableEscapeKeyDown={false}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {selectedTrasferimentoId
          ? 'Modifica trasferimento'
          : 'Nuovo trasferimento'}
      </DialogTitle>

      <DialogContent dividers>
        <Stack
          component="form"
          id="trasferimento-form"
          onSubmit={onSubmit}
          noValidate
          spacing={2}
          sx={{ pt: 1 }}
        >
          <TextField
            size="small"
            required
            fullWidth
            id="costo"
            label="Costo"
            name="costo"
            type="number"
            value={trasferimento.costo}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onInputChange(e, 'trasferimento')
            }
          />

          <FormControl size="small" fullWidth>
            <InputLabel id="dialog-fantasquadra-label">
              Fantasquadra
            </InputLabel>
            <Select
              labelId="dialog-fantasquadra-label"
              label="Fantasquadra"
              name="idSquadra"
              value={trasferimento.idSquadra?.toLocaleString() ?? '0'}
              onChange={(e: SelectChangeEvent) =>
                onSelectChange(e, 'trasferimento')
              }
            >
              {squadre.map((item) => (
                <MenuItem key={item.id} value={item.id?.toLocaleString()}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" fullWidth>
            <InputLabel id="dialog-squadra-label">Squadra Serie A</InputLabel>
            <Select
              labelId="dialog-squadra-label"
              label="Squadra Serie A"
              name="idSquadraSerieA"
              value={trasferimento.idSquadraSerieA?.toLocaleString() ?? '0'}
              onChange={(e: SelectChangeEvent) =>
                onSelectChange(e, 'trasferimento')
              }
            >
              {squadreSerieA.map((item) => (
                <MenuItem key={item.id} value={item.id?.toLocaleString()}>
                  {item.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            size="small"
            required
            fullWidth
            type="datetime-local"
            label="Data Acquisto"
            name="dataAcquisto"
            value={convertFromIsoToDatetimeMUI(
              dayjs(trasferimento.dataAcquisto).toISOString(),
            )}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onInputChange(e, 'trasferimento')
            }
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            size="small"
            fullWidth
            type="datetime-local"
            label="Data Cessione"
            name="dataCessione"
            value={
              trasferimento.dataCessione !== null
                ? convertFromIsoToDatetimeMUI(
                    dayjs(trasferimento.dataCessione).toISOString(),
                  )
                : ''
            }
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onInputChange(e, 'trasferimento')
            }
            InputLabelProps={{ shrink: true }}
          />

          {message && (
            <Alert icon={<CheckIcon fontSize="inherit" />} severity="success">
              {message}
            </Alert>
          )}
          {errorMessage && (
            <Alert icon={<CheckIcon fontSize="inherit" />} severity="error">
              {errorMessage}
            </Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onCancel} variant="outlined">
          Annulla
        </Button>
        {selectedTrasferimentoId !== undefined && isCurrentSeason && (
          <Button onClick={onDelete} color="error" variant="outlined">
            Elimina
          </Button>
        )}
        {isCurrentSeason && (
          <Button
            type="submit"
            form="trasferimento-form"
            variant="contained"
          >
            {selectedTrasferimentoId
              ? 'Aggiorna trasferimento'
              : 'Aggiungi trasferimento'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
