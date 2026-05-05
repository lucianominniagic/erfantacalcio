'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Stack,
  FormControl,
  InputLabel,
  OutlinedInput,
  Select,
  MenuItem,
  FormLabel,
  FormControlLabel,
  Radio,
  RadioGroup,
  Alert,
  Snackbar,
  Button,
  Grid,
  CircularProgress,
} from '@mui/material'
import { api } from '~/utils/api'
import { HourglassTop, Save } from '@mui/icons-material'
import { ShirtSVG } from './shirtSVG'

export interface magliaType {
  mainColor: string
  secondaryColor: string
  thirdColor: string
  textColor: string
  shirtNumber: number
  selectedTemplate: string
}

const shirtCollections = [
  'solid',
  'stripes',
  'centerLine',
  'bicolor',
  'ajax',
  'samp',
  'diagonal',
  'inter',
  'celtic',
  'roma',
  'america',
  'palmeiras',
  'germany',
  'veneziaFC',
  'manUnited',
  'manCity',
  'chelsea',
  'juventus',
  'lazio',
  'barcelona',
  'milan',
  'tottenham',
] as const
export type ShirtTemplate = (typeof shirtCollections)[number]

/**
 * Converte una stringa grezza (es. dal DB) in ShirtTemplate validato.
 * Se il valore non è riconosciuto, torna al default 'solid'.
 */
export function toShirtTemplate(val: string): ShirtTemplate {
  return (shirtCollections as readonly string[]).includes(val)
    ? (val as ShirtTemplate)
    : 'solid'
}

const ShirtSelector = () => {
  const [alertMessage, setAlertMessage] = useState('')
  const [openAlert, setOpenAlert] = useState(false)
  const [saving, setSaving] = useState(false)
  const [mainColor, setMainColor] = useState('#ff0000')
  const [secondaryColor, setSecondaryColor] = useState('#ffffff')
  const [thirdColor, setThirdColor] = useState('#000000')
  const [textColor, setTextColor] = useState('#000000')
  const [shirtNumber, setShirtNumber] = useState(10)
  const [selectedTemplate, setSelectedTemplate] =
    useState<ShirtTemplate>('solid')
  const [maglia, setMaglia] = useState<magliaType | undefined>({
    mainColor: '#ff0000',
    secondaryColor: '#ffffff',
    thirdColor: '#000000',
    textColor: '#000000',
    shirtNumber: 10,
    selectedTemplate: 'solid',
  })

  const squadra = api.squadre.getMaglia.useQuery()

  const updateMaglia = api.squadre.updateMaglia.useMutation({
    onSuccess: async () => {
      setAlertMessage('Salvataggio completato')
      squadra.refetch()
    },
  })

  useEffect(() => {
    if (!squadra.isFetching && squadra.isSuccess && squadra.data) {
      setMaglia(squadra.data)
      setMainColor(squadra.data.mainColor)
      setSecondaryColor(squadra.data.secondaryColor)
      setThirdColor(squadra.data.thirdColor)
      setTextColor(squadra.data.textColor)
      setShirtNumber(squadra.data.shirtNumber)
      setSelectedTemplate(toShirtTemplate(squadra.data.selectedTemplate))
    }
  }, [squadra.data, squadra.isSuccess, squadra.isFetching])

  const handleSave = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)

    updateMaglia.mutate({
      mainColor: mainColor,
      secondaryColor: secondaryColor,
      thirdColor: thirdColor,
      textColor: textColor,
      shirtNumber: shirtNumber,
      selectedTemplate: selectedTemplate,
    })
    setOpenAlert(true)
    setSaving(false)
  }

  return (
    <Box component="form" onSubmit={handleSave} noValidate>
      <Grid container spacing={0}>
        <Grid item xs={12} height={20} sx={{ mb: 2 }}>
          <Typography variant="h6">Scegli i colori sociali</Typography>
        </Grid>
        <Grid item xs={4}>
          <FormControl>
            <InputLabel shrink htmlFor="main-color">
              1° Colore
            </InputLabel>
            <OutlinedInput
              id="main-color"
              type="color"
              value={mainColor}
              onChange={(e) => setMainColor(e.target.value)}
              sx={{
                width: 84,
                height: 36,
                padding: 0,
                borderRadius: 2,
                '& input': {
                  padding: 1,
                  width: '90%',
                  height: '90%',
                  cursor: 'pointer',
                },
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl>
            <InputLabel shrink htmlFor="secondary-color">
              2° Colore
            </InputLabel>
            <OutlinedInput
              id="secondary-color"
              type="color"
              value={secondaryColor}
              onChange={(e) => setSecondaryColor(e.target.value)}
              sx={{
                width: 84,
                height: 36,
                padding: 0,
                borderRadius: 1,
                '& input': {
                  padding: 1,
                  width: '90%',
                  height: '90%',
                  cursor: 'pointer',
                },
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={4}>
          <FormControl>
            <InputLabel shrink htmlFor="third-color">
              Maniche
            </InputLabel>
            <OutlinedInput
              id="third-color"
              type="color"
              value={thirdColor}
              onChange={(e) => setThirdColor(e.target.value)}
              sx={{
                width: 84,
                height: 36,
                padding: 0,
                borderRadius: 2,
                '& input': {
                  padding: 1,
                  width: '90%',
                  height: '90%',
                  cursor: 'pointer',
                },
              }}
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} height={20} sx={{ mb: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Seleziona numero maglia
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <FormControl>
            <InputLabel id="jersey-number-label">Numero di maglia</InputLabel>
            <Select
              labelId="jersey-number-label"
              value={shirtNumber}
              onChange={(e) => setShirtNumber(e.target.value as number)}
              label="Numero di maglia"
              sx={{ minWidth: 120 }}
            >
              {Array.from({ length: 11 }, (_, i) => (
                <MenuItem key={i + 1} value={(i + 1)}>
                  {i + 1}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl
            component="fieldset"
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <RadioGroup
              row
              value={textColor}
              onChange={(e) => setTextColor(e.target.value)}
              name="jersey-text-color"
            >
              <FormControlLabel
                value="black"
                control={<Radio />}
                label="Nero"
              />
              <FormControlLabel
                value="white"
                control={<Radio />}
                label="Bianco"
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12} height={20} sx={{ mb: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Seleziona una tipologia di maglia
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <ToggleButtonGroup
            value={selectedTemplate}
            exclusive
            onChange={(_, val) => val && setSelectedTemplate(val)}
            sx={{ mb: 0, flexWrap: 'wrap' }}
          >
            {shirtCollections.map((template) => (
              <ToggleButton key={template} value={template} sx={{ width: 100 }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <ShirtSVG
                    template={template}
                    mainColor={mainColor}
                    secondaryColor={secondaryColor}
                    thirdColor={thirdColor}
                    textColor={textColor}
                    size={60}
                    number={shirtNumber}
                  />

                  <Typography variant="caption">{template}</Typography>
                </Box>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Grid>
        {!squadra.isLoading && maglia ? (
          <>
            <Grid item xs={6} sm={4} sx={{ mt: 2 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Maglia attuale
                </Typography>
                <ShirtSVG
                  template={toShirtTemplate(maglia.selectedTemplate)}
                  mainColor={maglia.mainColor}
                  secondaryColor={maglia.secondaryColor}
                  thirdColor={maglia.thirdColor}
                  textColor={maglia.textColor}
                  size={150}
                  number={maglia.shirtNumber}
                />
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} sx={{ mt: 2 }}>
              <Box>
                <Typography variant="h6" gutterBottom>
                  Anteprima
                </Typography>
                <ShirtSVG
                  template={selectedTemplate}
                  mainColor={mainColor}
                  secondaryColor={secondaryColor}
                  thirdColor={thirdColor}
                  textColor={textColor}
                  size={150}
                  number={shirtNumber}
                />
              </Box>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ mt: 2, mb: 10 }}>
              <Button
                type="submit"
                disabled={saving}
                endIcon={!saving ? <Save /> : <HourglassTop />}
                variant="contained"
                color="primary"
                size="medium"
              >
                {saving ? 'Attendere...' : 'Salva'}
              </Button>
            </Grid>
          </>
        ) : (
          <Grid item xs={12}>
            <CircularProgress color="info" />
          </Grid>
        )}
      </Grid>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ height: '60%' }}
        open={openAlert}
        autoHideDuration={3000}
        onClose={() => setOpenAlert(false)}
      >
        <Alert
          onClose={() => setOpenAlert(false)}
          severity={'success'}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default ShirtSelector
