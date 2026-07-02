'use client'
import { useState } from 'react'
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  type SelectChangeEvent,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/CheckCircle'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import SearchIcon from '@mui/icons-material/Search'
import { type GiocatoreType } from '~/types/giocatori'
import { ruoliList, getRuoloEsteso } from '~/utils/formazione'

interface GiocatoreDialogProps {
  open: boolean
  giocatore: GiocatoreType
  selectedGiocatoreId: number | undefined
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

export default function GiocatoreDialog({
  open,
  giocatore,
  selectedGiocatoreId,
  errorMessage,
  message,
  onSubmit,
  onCancel,
  onDelete,
  onInputChange,
  onSelectChange,
}: GiocatoreDialogProps) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const handleCancelWithReset = () => {
    setConfirmDelete(false)
    onCancel()
  }
  return (
    <Dialog
      open={open}
      onClose={(_, reason) => {
        if (reason === 'escapeKeyDown') handleCancelWithReset()
      }}
      disableEscapeKeyDown={false}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>
        {selectedGiocatoreId ? 'Modifica giocatore' : 'Nuovo giocatore'}
      </DialogTitle>

      <DialogContent dividers>
        <Stack
          component="form"
          id="giocatore-form"
          onSubmit={onSubmit}
          noValidate
          spacing={2}
          sx={{ pt: 1 }}
        >
          <TextField
            size="small"
            required
            fullWidth
            label="Nome"
            name="nome"
            value={giocatore.nome ?? ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onInputChange(e, 'anagrafica')
            }
          />

          <FormControl size="small" fullWidth>
            <InputLabel id="dialog-ruolo-label">Ruolo</InputLabel>
            <Select
              labelId="dialog-ruolo-label"
              label="Ruolo"
              name="ruolo"
              value={giocatore.ruolo ?? 'P'}
              onChange={(e: SelectChangeEvent) =>
                onSelectChange(e, 'anagrafica')
              }
            >
              {ruoliList.map((item) => (
                <MenuItem key={item} value={item}>
                  {getRuoloEsteso(item)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              size="small"
              fullWidth
              label="Nome Fantagazzetta"
              name="nomeFantagazzetta"
              value={giocatore.nomeFantagazzetta ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onInputChange(e, 'anagrafica')
              }
            />
            <Tooltip title="Cerca su Fantacalcio.it">
              <span>
                <IconButton
                  size="small"
                  disabled={!giocatore.nomeFantagazzetta}
                  onClick={() => {
                    const query = encodeURIComponent(
                      giocatore.nomeFantagazzetta ?? '',
                    )
                    window.open(
                      `https://www.fantacalcio.it/ricerca?q=${query}`,
                      '_blank',
                      'noopener,noreferrer',
                    )
                  }}
                >
                  <OpenInNewIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Cerca su Google">
              <span>
                <IconButton
                  size="small"
                  disabled={!giocatore.nomeFantagazzetta}
                  onClick={() => {
                    const query = encodeURIComponent(
                      `${giocatore.nomeFantagazzetta ?? ''} fantacalcio`,
                    )
                    window.open(
                      `https://www.google.com/search?q=${query}`,
                      '_blank',
                      'noopener,noreferrer',
                    )
                  }}
                >
                  <SearchIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>

          <TextField
            size="small"
            fullWidth
            label="ID PF"
            name="id_pf"
            type="number"
            value={giocatore.id_pf ?? ''}
            inputProps={{ min: 1 }}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onInputChange(e, 'anagrafica')
            }
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
        <Button onClick={handleCancelWithReset} variant="outlined">
          Annulla
        </Button>
        {selectedGiocatoreId !== undefined && !confirmDelete && (
          <Button
            onClick={() => setConfirmDelete(true)}
            color="error"
            variant="outlined"
          >
            Elimina
          </Button>
        )}
        {confirmDelete && (
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="error">
              Confermi l&apos;eliminazione?
            </Typography>
            <Button
              onClick={() => setConfirmDelete(false)}
              variant="outlined"
              size="small"
            >
              No
            </Button>
            <Button
              onClick={() => {
                setConfirmDelete(false)
                onDelete()
              }}
              color="error"
              variant="contained"
              size="small"
            >
              Sì, elimina
            </Button>
          </Stack>
        )}
        {!confirmDelete && (
          <Button type="submit" form="giocatore-form" variant="contained">
            {selectedGiocatoreId ? 'Aggiorna giocatore' : 'Aggiungi giocatore'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
