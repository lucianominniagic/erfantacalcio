'use client'
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControlLabel,
  Grid,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/CheckCircle'
import Modal from '~/components/modal/Modal'
import { type SquadraType } from '~/types/squadre'

interface PresidenteFormModalProps {
  open: boolean
  utenteInModifica: SquadraType
  errorMessage: string
  message: string
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onClose: () => void
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function PresidenteFormModal({
  open,
  utenteInModifica,
  errorMessage,
  message,
  onSubmit,
  onClose,
  onInputChange,
}: PresidenteFormModalProps) {
  return (
    <Modal title="Modifica dati squadra" open={open} onClose={onClose}>
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
            <TextField
              margin="normal"
              size="small"
              variant="outlined"
              required
              sx={{ m: 2 }}
              label="Presidente"
              name="presidente"
              value={utenteInModifica.presidente}
              onChange={onInputChange}
            />
            <TextField
              margin="normal"
              size="small"
              variant="outlined"
              required
              sx={{ m: 2 }}
              label="Squadra"
              name="squadra"
              value={utenteInModifica.squadra}
              onChange={onInputChange}
            />
            <TextField
              margin="normal"
              size="small"
              variant="outlined"
              required
              sx={{ m: 2 }}
              label="Email"
              name="email"
              value={utenteInModifica.email}
              autoFocus
              onChange={onInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              margin="normal"
              size="small"
              variant="outlined"
              required
              type="number"
              sx={{ m: 2 }}
              label="Importo annuale"
              name="importoAnnuale"
              value={utenteInModifica?.importoAnnuale}
              onChange={onInputChange}
            />
            <TextField
              margin="normal"
              size="small"
              variant="outlined"
              required
              type="number"
              sx={{ m: 2 }}
              label="Importo multe"
              name="importoMulte"
              value={utenteInModifica?.importoMulte}
              onChange={onInputChange}
            />
            <TextField
              margin="normal"
              size="small"
              variant="outlined"
              required
              type="number"
              sx={{ m: 2 }}
              label="Importo mercato"
              name="importoMercato"
              value={utenteInModifica?.importoMercato}
              onChange={onInputChange}
            />
            <TextField
              margin="normal"
              size="small"
              variant="outlined"
              required
              type="number"
              sx={{ m: 2 }}
              label="Fantamilioni"
              name="fantamilioni"
              value={utenteInModifica?.fantamilioni}
              onChange={onInputChange}
            />
          </Grid>
          <Grid item xs={12}>
            <FormControlLabel
              sx={{ ml: 2, mr: 2 }}
              color="error"
              control={
                <Checkbox
                  onChange={onInputChange}
                  color="success"
                  name="isAdmin"
                  checked={utenteInModifica?.isAdmin}
                  value={utenteInModifica?.isAdmin}
                />
              }
              label={<Typography color="primary">Amministratore</Typography>}
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
