'use client'
import { useState, useEffect, Fragment } from 'react'
import {
  Button,
  Typography,
  Box,
  Stack,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from '@mui/material'
import { api } from '~/utils/api'
import CheckIcon from '@mui/icons-material/CheckCircle'
import PlayCircle from '@mui/icons-material/PlayCircle'
import { Configurazione } from '~/config'
import { messageSchema } from '~/schemas/messageSchema'
import { z } from 'zod'
import LoadingSpinner from '~/components/LinearProgressBar/LoadingSpinner'
import PageHeader from '~/components/PageHeader'

export default function AvvioStagione() {
  const faseNuovaStagione = api.nuovaStagione.getFaseAvvio.useQuery()
  const chiudiStagione = api.nuovaStagione.chiudiStagione.useMutation()
  const preparaStagione = api.nuovaStagione.preparaStagione.useMutation()
  const preparaIdSquadre = api.nuovaStagione.preparaIdSquadre.useMutation()
  const creaPartite = api.nuovaStagione.creaPartite.useMutation()
  const creaClassifiche = api.nuovaStagione.creaClassifiche.useMutation()
  const steps = [
    {
      fase: 1,
      label: 'Chiusura stagione',
    },
    {
      fase: 2,
      label: 'Prepara nuova stagione',
    },
    {
      fase: 3,
      label: `Sorteggia calendario: Cambia la stagione! Stagione configurata: ${Configurazione.stagione}`,
    },
    {
      fase: 4,
      label: 'Crea partite',
    },
    {
      fase: 5,
      label: 'Crea classifiche',
    },
  ]
  const [activeStep, setActiveStep] = useState(0)
  const [errorMessage, setErrorMessage] = useState('')
  const [message, setMessage] = useState('')
  const [disableButton, setDisableButton] = useState(false)

  useEffect(() => {
    if (
      !faseNuovaStagione.isFetching &&
      faseNuovaStagione.isSuccess &&
      faseNuovaStagione.data
    ) {
      setErrorMessage('')
      setActiveStep(faseNuovaStagione.data - 1)
    }
  }, [
    faseNuovaStagione.data,
    faseNuovaStagione.isFetching,
    faseNuovaStagione.isSuccess,
  ])

  useEffect(() => {
    if (faseNuovaStagione.isError) {
      setErrorMessage(
        'Si è verificato un errore in fase valutazione della fase per la nuova stagione',
      )
    }
  }, [faseNuovaStagione.isError])

  const handleNext = async () => {
    setMessage('')
    setDisableButton(true)
    let message: z.infer<typeof messageSchema> = { isError: false, isComplete: false, message: '' }

    switch (activeStep) {
      case 0:
        message = await chiudiStagione.mutateAsync()
        break
      case 1:
        message = await preparaStagione.mutateAsync()
        break
      case 2:
        message = await preparaIdSquadre.mutateAsync()
        break
      case 3:
        message = await creaPartite.mutateAsync()
        break
      case 4:
        message = await creaClassifiche.mutateAsync()
        break
    }
    if (message.isError) setErrorMessage(message.message)
    else if (!message.isComplete) setMessage(message.message)
    else {
      setMessage(message.message)
      setActiveStep((prevActiveStep) => prevActiveStep + 1)
    }
    setDisableButton(false)
  }

  return (
    <Box sx={{ width: '100%' }}>
      <PageHeader title="Avvio nuova stagione" Icon={PlayCircle} />
      {faseNuovaStagione.isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
          <LoadingSpinner />
        </Box>
      ) : (
        <Stepper activeStep={activeStep}>
          {steps.map((step) => (
            <Step key={`step_${step.fase}`}>
              <StepLabel>{step.label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      )}
      {activeStep === steps.length ? (
        <Fragment>
          <Typography sx={{ mt: 2, mb: 1 }} variant="h5">
            Processo di avvio nuova stagione completato!
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
            <Box sx={{ flex: '1 1 auto' }} />
          </Box>
        </Fragment>
      ) : (
        <Fragment>
          {!errorMessage && (
            <>
              <Typography sx={{ mt: 2, mb: 1 }} variant="h5">
                Prossimo Step: {steps[activeStep]?.label}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                <Box sx={{ flex: '1 1 auto' }} />
                <Button onClick={handleNext} disabled={disableButton}>
                  {activeStep === steps.length - 1 ? 'Completa' : 'Avvia'}
                </Button>
              </Box>
            </>
          )}
          {disableButton && (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, mt: 2 }}>
              <Typography variant="h5">Elaborazione in corso...</Typography>
              <LoadingSpinner />
            </Box>
          )}
        </Fragment>
      )}
      {errorMessage && (
        <Stack
          spacing={1}
          justifyContent="space-between"
          sx={{ width: '100%', mt: '40px' }}
        >
          <Alert icon={<CheckIcon fontSize="inherit" />} severity="error">
            {errorMessage}
          </Alert>
        </Stack>
      )}
      {message && (
        <Stack
          spacing={1}
          justifyContent="space-between"
          sx={{ width: '100%', mt: '40px' }}
        >
          <Alert icon={<CheckIcon fontSize="inherit" />} severity="success">
            {message}
          </Alert>
        </Stack>
      )}
    </Box>
  )
}
