'use client'

import React from 'react'
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
  FormControlLabel,
  Radio,
  RadioGroup,
  Alert,
  Snackbar,
  Button,
  Grid,
  CircularProgress,
} from '@mui/material'
import { HourglassTop, Save } from '@mui/icons-material'
import { ShirtSVG } from './shirtSVG'
import { type MagliaType } from '~/schemas/maglia'
import { useShirtSelector } from './useShirtSelector'

export type { MagliaType as magliaType } from '~/schemas/maglia'

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
  if (!(shirtCollections as readonly string[]).includes(val)) {
    console.warn(`[toShirtTemplate] valore non riconosciuto "${val}", fallback a 'solid'`)
    return 'solid'
  }
  return val as ShirtTemplate
}

const colorPickerSx = {
  width: 84,
  height: 36,
  padding: 0,
  borderRadius: 2,
  '& input': { padding: 1, width: '90%', height: '90%', cursor: 'pointer' },
}

const ShirtSelector = () => {
  const {
    mainColor, setMainColor,
    secondaryColor, setSecondaryColor,
    thirdColor, setThirdColor,
    textColor, setTextColor,
    shirtNumber, setShirtNumber,
    selectedTemplate, setSelectedTemplate,
    maglia, isLoadingMaglia,
    saving, handleSave,
    alertMessage, openAlert, setOpenAlert,
  } = useShirtSelector()

  return (
    <Box component="form" onSubmit={handleSave} noValidate>
      <Grid container spacing={0}>
        <Grid item xs={12} height={20} sx={{ mb: 2 }}>
          <Typography variant="h6">Scegli i colori sociali</Typography>
        </Grid>

        {/* Color pickers */}
        {[
          { id: 'main-color', label: '1° Colore', value: mainColor, onChange: setMainColor },
          { id: 'secondary-color', label: '2° Colore', value: secondaryColor, onChange: setSecondaryColor },
          { id: 'third-color', label: 'Maniche', value: thirdColor, onChange: setThirdColor },
        ].map(({ id, label, value, onChange }) => (
          <Grid item xs={4} key={id}>
            <FormControl>
              <InputLabel shrink htmlFor={id}>{label}</InputLabel>
              <OutlinedInput
                id={id}
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                sx={colorPickerSx}
              />
            </FormControl>
          </Grid>
        ))}

        {/* Number + text color */}
        <Grid item xs={12} height={20} sx={{ mb: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>Seleziona numero maglia</Typography>
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
                <MenuItem key={i + 1} value={i + 1}>{i + 1}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={6}>
          <FormControl component="fieldset" sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
            <RadioGroup row value={textColor} onChange={(e) => setTextColor(e.target.value)} name="jersey-text-color">
              <FormControlLabel value="black" control={<Radio />} label="Nero" />
              <FormControlLabel value="white" control={<Radio />} label="Bianco" />
            </RadioGroup>
          </FormControl>
        </Grid>

        {/* Template selector */}
        <Grid item xs={12} height={20} sx={{ mb: 2, mt: 2 }}>
          <Typography variant="h6" gutterBottom>Seleziona una tipologia di maglia</Typography>
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
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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

        {/* Current + preview + save */}
        {!isLoadingMaglia && maglia ? (
          <>
            <Grid item xs={6} sm={4} sx={{ mt: 2 }}>
              <Box>
                <Typography variant="h6" gutterBottom>Maglia attuale</Typography>
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
                <Typography variant="h6" gutterBottom>Anteprima</Typography>
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
