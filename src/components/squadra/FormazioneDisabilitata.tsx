'use client'
import { CheckCircle, HourglassTop } from '@mui/icons-material'
import {
  Alert,
  Box,
  Button,
  Grid,
  Snackbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import React from 'react'

interface Props {
  message: string
  formazioneGiaRilasciata: boolean
  canConfirmPrecedente: boolean
  confirmingPrecedente: boolean
  handleConfirmPrecedente: () => void
  openAlert: boolean
  setOpenAlert: (open: boolean) => void
  alertMessage: string
  alertSeverity: 'success' | 'error'
}

export function FormazioneDisabilitata({
  message,
  formazioneGiaRilasciata,
  canConfirmPrecedente,
  confirmingPrecedente,
  handleConfirmPrecedente,
  openAlert,
  setOpenAlert,
  alertMessage,
  alertSeverity,
}: Props) {
  const theme = useTheme()
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'))

  return (
    <Grid
      item
      xs={12}
      display="flex"
      flexDirection="column"
      alignItems="center"
      sx={{ mt: '30px', gap: 3 }}
    >
      <Typography
        variant={isDesktop ? 'h3' : 'h4'}
        color="error"
        textAlign="center"
      >
        {formazioneGiaRilasciata
          ? 'Formazione già rilasciata fuori orario consentito'
          : message}
      </Typography>
      {canConfirmPrecedente && (
        <Button
          variant="contained"
          size="large"
          disabled={confirmingPrecedente}
          endIcon={
            confirmingPrecedente ? <HourglassTop /> : <CheckCircle />
          }
          onClick={handleConfirmPrecedente}
        >
          {confirmingPrecedente
            ? 'Attendere...'
            : 'Conferma formazione precedente'}
        </Button>
      )}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ height: '30%' }}
        open={openAlert}
        autoHideDuration={3000}
        onClose={() => setOpenAlert(false)}
      >
        <Alert
          onClose={() => setOpenAlert(false)}
          severity={alertSeverity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Grid>
  )
}
