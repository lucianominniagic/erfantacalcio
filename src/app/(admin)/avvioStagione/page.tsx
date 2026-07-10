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
  StepContent,
} from '@mui/material'
import { useQuery, useMutation } from '@tanstack/react-query'
import { orpc } from '~/utils/orpc'
import CheckIcon from '@mui/icons-material/CheckCircle'
import PlayCircle from '@mui/icons-material/PlayCircle'
import { Configurazione } from '~/config'
import { messageSchema } from '~/schemas/messageSchema'
import { z } from 'zod'
import LoadingSpinner from '~/components/LinearProgressBar/LoadingSpinner'
import PageHeader from '~/components/PageHeader'

export default function AvvioStagione() {
  const faseNuovaStagione = useQuery(orpc.nuovastagione.getFaseAvvio.queryOptions())
  const chiudiStagione = useMutation(orpc.nuovastagione.chiudiStagione.mutationOptions())
  const preparaStagione = useMutation(orpc.nuovastagione.preparaStagione.mutationOptions())
  const preparaIdSquadre = useMutation(orpc.nuovastagione.preparaIdSquadre.mutationOptions())
  const creaPartite = useMutation(orpc.nuovastagione.creaPartite.mutationOptions())
  const creaClassifiche = useMutation(orpc.nuovastagione.creaClassifiche.mutationOptions())
  const steps = [
    {
      fase: 1,
      label: 'Chiusura stagione',
      description: 'Chiudi la stagione in corso, chiudendo i trasferimenti di tutti i giocatori e generando lo storico statistiche',
    },
    {
      fase: 2,
      label: 'Prepara nuova stagione',
      description: 'Prepara la nuova stagione, eliminando classifiche, voti, formazioni, partite e azzerando il calendario',
    },
    {
      fase: 3,
      label: `Sorteggio utenti: Cambia la stagione! Stagione configurata: ${Configurazione.stagione}`,
      description: 'ATTENZIONE: prima di eseguire cambia la stagione! Crea nuovi utenti temporanei con ID maggiorati di 10, sorteggia nuovi ID squadra e aggiorna gli utenti con i nuovi ID',
    },
    {
      fase: 4,
      label: 'Crea partite',
      description: 'Prima di eseguire questo step esegui un nuovo login! Crea le partite per la nuova stagione, usando le tabelle di Berger',
    },
    {
      fase: 5,
      label: 'Crea classifiche',
      description: 'Crea le classifiche per la nuova stagione, in base ai tornei configurati',
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
    let message: z.infer<typeof messageSchema> = {
      isError: false,
      isComplete: false,
      message: '',
    }

    switch (activeStep) {
      case 0:
        do {
          message = await chiudiStagione.mutateAsync(undefined)
          if (!message.isError && !message.isComplete) setMessage(message.message)
        } while (!message.isError && !message.isComplete)
        break
      case 1:
        message = await preparaStagione.mutateAsync(undefined)
        break
      case 2:
        message = await preparaIdSquadre.mutateAsync(undefined)
        break
      case 3:
        message = await creaPartite.mutateAsync(undefined)
        break
      case 4:
        message = await creaClassifiche.mutateAsync(undefined)
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
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step) => (
            <Step key={`step_${step.fase}`}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>{step.description}</StepContent>
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
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1,
                mt: 2,
              }}
            >
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
