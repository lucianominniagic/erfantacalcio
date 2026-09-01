'use client'
import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  Stack,
  TextField,
} from '@mui/material'
import CheckIcon from '@mui/icons-material/CheckCircle'
import Modal from '~/components/modal/Modal'
import { type SquadraSerieAType } from '~/types/squadreSerieA'
import { magliaRichiedeSfondoBianco } from '~/utils/maglia'

interface SquadraSerieAFormModalProps {
  open: boolean
  squadraSerieAInModifica: SquadraSerieAType
  errorMessage: string
  message: string
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  onClose: () => void
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}

export default function SquadraSerieAFormModal({
  open,
  squadraSerieAInModifica,
  errorMessage,
  message,
  onSubmit,
  onClose,
  onInputChange,
}: SquadraSerieAFormModalProps) {
  return (
    <Modal title="Modifica squadra Serie A" open={open} onClose={onClose}>
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
              label="Nome"
              name="nome"
              value={squadraSerieAInModifica.nome}
              autoFocus
              onChange={onInputChange}
            />
            <TextField
              margin="normal"
              size="small"
              variant="outlined"
              required
              sx={{ m: 2 }}
              label="Maglia (nome file)"
              name="maglia"
              value={squadraSerieAInModifica.maglia}
              onChange={onInputChange}
            />
          </Grid>
          <Grid item xs={12} sx={{ m: 2 }}>
            {squadraSerieAInModifica.maglia && (
              <img
                src={`/images/maglie/${squadraSerieAInModifica.maglia}`}
                width={48}
                height={42}
                alt={squadraSerieAInModifica.nome}
                style={{
                  objectFit: 'contain',
                  backgroundColor: magliaRichiedeSfondoBianco(
                    squadraSerieAInModifica.maglia,
                  )
                    ? '#fff'
                    : undefined,
                }}
              />
            )}
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
