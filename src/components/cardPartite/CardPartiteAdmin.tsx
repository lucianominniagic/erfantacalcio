import React, { useEffect, useState } from 'react'
import {
  Typography,
  Stack,
  TextField,
  Divider,
  Button,
  Checkbox,
  FormControlLabel,
  Paper,
} from '@mui/material'
import {
  type PartitaAdminType,
  type GiornataAdminType,
} from '~/types/risultati'
import { api } from '~/utils/api'
import dayjs from 'dayjs'
import { tabellinoSchema } from '~/schemas/calendario'
import { CardWithActions } from '~/components/cards'

interface GiornataCardProps {
  giornata: GiornataAdminType
}

function CardPartiteAdmin({ giornata }: GiornataCardProps) {
  const [risultati, setRisultati] = useState<PartitaAdminType[]>([])
  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const updateRisultati = api.risultati.update.useMutation()

  useEffect(() => {
    if (giornata) {
      setRisultati(giornata.partite)
    }
  }, [giornata])

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    idPartita: number,
  ) => {
    const { name, value, type } = event.currentTarget

    const updatedResults = risultati.map((partita) => {
      // Se l'id della partita corrisponde, aggiorna solo il valore corrispondente
      if (partita.idPartita === idPartita) {
        return {
          ...partita,
          [name]:
            type === 'number'
              ? +value
              : type === 'datetime-local'
                ? dayjs(value).toISOString()
                : value,
        }
      }
      return partita // Altrimenti, ritorna la partita immutata
    })

    setRisultati(updatedResults)
  }

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    idPartita: number,
  ) => {
    const { name, checked } = e.currentTarget

    const updatedResults = risultati.map((partita) => {
      // Se l'id della partita corrisponde, aggiorna solo il valore corrispondente
      if (partita.idPartita === idPartita) {
        return {
          ...partita,
          [name]: checked,
        }
      }
      return partita // Altrimenti, ritorna la partita immutata
    })

    setRisultati(updatedResults)
  }

  const handleSubmit= async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setMessage('')
    setErrorMessage('')
    let hasError = false

    const promises = risultati
      .filter((c) => c.escludi === false)
      .map(async (partita) => {
        const responseVal = tabellinoSchema.safeParse(partita)
        if (!responseVal.success) {
          setErrorMessage(
            responseVal.error.issues
              .map(
                (issue) =>
                  `campo ${issue.path.toLocaleString()}: ${issue.message}`,
              )
              .join(', '),
          )
          hasError = true
        } else {
          try {
            await updateRisultati.mutateAsync({
              escludi: partita.escludi,
              idPartita: partita.idPartita,
              golHome: partita.calcoloGolSegnatiHome,
              golAway: partita.calcoloGolSegnatiAway,
              fantapuntiHome: partita.totaleFantapuntiHome,
              fantapuntiAway: partita.totaleFantapuntiAway,
              multaHome: partita.multaHome,
              multaAway: partita.multaAway,
            })
          } catch (error) {
            setErrorMessage(
              `Si è verificato un errore nel salvataggio della partita ${partita.squadraHome}-${partita.squadraAway}`,
            )
            hasError = true
          }
        }
      })
    await Promise.all(promises)
    if (!hasError) setMessage('Salvataggio completato')
  }

  return (
    <CardWithActions
      title={giornata?.Title}
      subtitle={giornata?.SubTitle}
      titleVariant="h5"
      subtitleVariant="h6"
      elevation={0}
      showHeaderDivider
      asForm
      onSubmit={handleSubmit}
      successMessage={message}
      errorMessage={errorMessage}
      withPaper={false}
      contentSx={{ paddingBottom: '3px', paddingTop: '10px' }}
      actions={
        <Button
          type="submit"
          fullWidth
          color="info"
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
        >
          Aggiorna dati
        </Button>
      }
      sx={{ maxWidth: 600, padding: 0 }}
    >
      {risultati.length > 0 ? (
        risultati.map((partita) => (
          <span key={`span_${partita.idPartita}`}>
            <Stack
              direction="row"
              spacing={0}
              justifyContent="space-between"
            >
              <Typography variant="h5" component="div" color="text.secondary">
                {partita.squadraHome} - {partita.squadraAway}
              </Typography>
              <Typography variant="h5" component="div" color="text.secondary">
                {partita.golHome} - {partita.golAway}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0}>
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={(event) =>
                      handleCheckboxChange(event, partita.idPartita)
                    }
                    color="success"
                    name="multaHome"
                    checked={partita.multaHome}
                    value={partita.multaHome}
                  />
                }
                label="Multa home"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={(event) =>
                      handleCheckboxChange(event, partita.idPartita)
                    }
                    color="success"
                    name="multaAway"
                    checked={partita.multaAway}
                    value={partita.multaAway}
                  />
                }
                label="Multa away"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    onChange={(event) =>
                      handleCheckboxChange(event, partita.idPartita)
                    }
                    color="success"
                    name="escludi"
                    checked={partita.escludi}
                    value={partita.escludi}
                  />
                }
                label="Escludi partita"
              />
            </Stack>
            <Stack
              direction="row"
              spacing={0}
              justifyContent="space-between"
            >
              <TextField
                margin="normal"
                size="small"
                variant="outlined"
                required
                type="number"
                sx={{ m: 2, width: '100px' }}
                label="Home"
                name="totaleFantapuntiHome"
                value={partita.totaleFantapuntiHome}
                onChange={(event) =>
                  handleInputChange(event, partita.idPartita)
                }
              />
              <TextField
                margin="normal"
                size="small"
                variant="outlined"
                required
                type="number"
                sx={{ m: 2, width: '100px' }}
                label="Away"
                name="totaleFantapuntiAway"
                value={partita.totaleFantapuntiAway}
                onChange={(event) =>
                  handleInputChange(event, partita.idPartita)
                }
              />
              <TextField
                margin="normal"
                size="small"
                variant="outlined"
                required
                type="number"
                sx={{ m: 2, width: '100px' }}
                label="Gol home"
                name="calcoloGolSegnatiHome"
                value={partita.calcoloGolSegnatiHome}
                onChange={(event) =>
                  handleInputChange(event, partita.idPartita)
                }
              />
              <TextField
                margin="normal"
                size="small"
                variant="outlined"
                required
                type="number"
                sx={{ m: 2, width: '100px' }}
                label="Gol away"
                name="calcoloGolSegnatiAway"
                value={partita.calcoloGolSegnatiAway}
                onChange={(event) =>
                  handleInputChange(event, partita.idPartita)
                }
              />
            </Stack>
            <Divider />
          </span>
        ))
      ) : (
        <Typography variant="body2" component="div" color="text.secondary">
          Nessuna partita in programma
        </Typography>
      )}
    </CardWithActions>
  )
}

export default CardPartiteAdmin
