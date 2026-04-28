'use client'
import { useCallback, useState } from 'react'
import { useSession } from 'next-auth/react'
import Cropper from 'react-easy-crop'
import type { Area, Point } from 'react-easy-crop'
import {
  Box,
  Button,
  Typography,
  Avatar,
  Slider,
  Stack,
  Alert,
  AlertTitle,
  IconButton,
  Tooltip,
  LinearProgress,
  Chip,
} from '@mui/material'
import {
  CloudUpload,
  RotateLeft,
  RotateRight,
  ZoomIn,
  ZoomOut,
  CheckCircle,
  PhotoCamera,
  ArrowBack,
  Crop,
} from '@mui/icons-material'
import LinearProgressBar from '~/components/LinearProgressBar/LinearProgressBar'
import { api } from '~/utils/api'
import { getFileExtension } from '~/utils/stringUtils'
import { getTimestamp } from '~/utils/dateUtils'
import { getCroppedImg } from '~/utils/cropImage'

type Step = 'select' | 'crop' | 'upload'

export default function FotoProfilo() {
  const { data: session, update } = useSession()
  const updateFotoProfilo = api.profilo.updateFoto.useMutation()
  const uploadFileVercel = api.profilo.uploadFotoVercel.useMutation()

  const [step, setStep] = useState<Step>('select')
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [croppedImageUrl, setCroppedImageUrl] = useState<string | null>(null)
  const [croppedBlob, setCroppedBlob] = useState<Blob | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Crop state
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

  // Upload state
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [alert, setAlert] = useState<{
    severity: 'success' | 'error' | 'warning'
    message: string
    title: string
  } | null>(null)

  // ── Selezione file ─────────────────────────────────────────────────────────

  const loadFile = (file: File) => {
    if (file.size > 4.5 * 1024 * 1024) {
      setAlert({ severity: 'error', title: 'File troppo grande', message: 'Dimensione massima: 4.5 MB' })
      return
    }
    if (!file.type.startsWith('image/')) {
      setAlert({ severity: 'error', title: 'Formato non valido', message: 'Seleziona un file immagine (JPG, PNG, GIF)' })
      return
    }
    setAlert(null)
    setOriginalFile(file)
    const reader = new FileReader()
    reader.onload = () => {
      setImageSrc(reader.result as string)
      setZoom(1)
      setRotation(0)
      setCrop({ x: 0, y: 0 })
      setStep('crop')
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) loadFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const f = e.dataTransfer.files?.[0]
    if (f) loadFile(f)
  }

  // ── Crop ──────────────────────────────────────────────────────────────────

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels)
  }, [])

  const handleApplyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation)
      const url = URL.createObjectURL(blob)
      setCroppedBlob(blob)
      setCroppedImageUrl(url)
      setStep('upload')
    } catch {
      setAlert({ severity: 'error', title: 'Errore', message: 'Impossibile applicare il ritaglio' })
    }
  }

  // ── Upload ────────────────────────────────────────────────────────────────

  const handleUpload = async () => {
    if (!croppedBlob || !originalFile) return
    setAlert(null)
    setUploading(true)
    setProgress(0)

    const filename = `foto_${session?.user?.idSquadra}_${getTimestamp()}${getFileExtension(originalFile.name)}`

    try {
      const MAX_SIZE = 4.5 * 1024 * 1024
      const reader = new FileReader()
      reader.onload = async () => {
        if (!reader.result || typeof reader.result === 'string') return
        const blockData = new Uint8Array(reader.result)
        const fileData = Buffer.from(blockData).toString('base64')
        setProgress(60)

        try {
          const serverPath = await uploadFileVercel.mutateAsync({ fileName: filename, fileData })
          setProgress(85)
          const filePath = await updateFotoProfilo.mutateAsync({ fileName: serverPath })
          setProgress(100)
          await update({ ...session, user: { ...session?.user, image: filePath } })
          setUploading(false)
          setAlert({ severity: 'success', title: 'Caricamento completato', message: 'La tua foto profilo è stata aggiornata!' })
        } catch {
          setUploading(false)
          setAlert({ severity: 'error', title: 'Errore upload', message: 'Si è verificato un errore durante il caricamento.' })
        }
      }
      reader.readAsArrayBuffer(croppedBlob)
    } catch {
      setUploading(false)
      setAlert({ severity: 'error', title: 'Errore', message: 'Impossibile leggere il file.' })
    }
  }

  const handleReset = () => {
    setStep('select')
    setImageSrc(null)
    setCroppedImageUrl(null)
    setCroppedBlob(null)
    setOriginalFile(null)
    setAlert(null)
    setProgress(0)
    setUploading(false)
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', mt: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <Avatar
          src={session?.user?.image?.toString() ?? ''}
          alt={session?.user?.squadra ?? ''}
          sx={{ width: 52, height: 52, border: '2px solid rgba(255,193,7,0.35)' }}
        />
        <Box>
          <Typography variant="h2" sx={{ fontSize: '1.1rem', mb: 0 }}>
            Foto profilo
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {session?.user?.presidente} · {session?.user?.squadra}
          </Typography>
        </Box>

        {/* Stepper compatto */}
        <Box sx={{ ml: 'auto', display: 'flex', gap: 0.75 }}>
          {(['select', 'crop', 'upload'] as Step[]).map((s, i) => (
            <Box
              key={s}
              sx={{
                width: 28, height: 28, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.7rem', fontWeight: 700,
                ...(step === s
                  ? { background: 'linear-gradient(135deg,#FF8F00,#FFC107)', color: '#0d0d14' }
                  : i < ['select', 'crop', 'upload'].indexOf(step)
                    ? { background: 'rgba(255,193,7,0.2)', color: '#FFD54F' }
                    : { background: 'rgba(255,255,255,0.05)', color: 'text.disabled' }),
              }}
            >
              {i + 1}
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── STEP 1: Selezione ── */}
      {step === 'select' && (
        <Box
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          sx={{
            border: `2px dashed ${isDragging ? '#FFC107' : 'rgba(255,193,7,0.25)'}`,
            borderRadius: '16px',
            p: 5,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            cursor: 'pointer',
            transition: 'border-color 0.2s, background 0.2s',
            background: isDragging ? 'rgba(255,193,7,0.05)' : 'rgba(255,255,255,0.02)',
            '&:hover': { borderColor: 'rgba(255,193,7,0.5)', background: 'rgba(255,193,7,0.03)' },
          }}
          onClick={() => document.getElementById('upload-input')?.click()}
        >
          <PhotoCamera sx={{ fontSize: '3rem', color: isDragging ? '#FFC107' : 'rgba(255,193,7,0.4)' }} />
          <Typography variant="subtitle1" sx={{ textAlign: 'center' }}>
            Trascina una foto qui
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            oppure clicca per selezionare un file
          </Typography>
          <Chip
            label="JPG · PNG · GIF · max 4.5 MB"
            size="small"
            sx={{ color: 'text.secondary', bgcolor: 'rgba(255,255,255,0.04)', fontSize: '0.65rem' }}
          />
          <input
            accept="image/png, image/jpeg, image/gif"
            style={{ display: 'none' }}
            onChange={handleFileChange}
            type="file"
            id="upload-input"
          />
        </Box>
      )}

      {/* ── STEP 2: Ritaglia ── */}
      {step === 'crop' && imageSrc && (
        <Box>
          {/* Crop area */}
          <Box
            sx={{
              position: 'relative', height: 340,
              borderRadius: '12px', overflow: 'hidden',
              border: '1px solid rgba(255,193,7,0.15)',
              background: '#000',
            }}
          >
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              style={{
                containerStyle: { borderRadius: '12px' },
                cropAreaStyle: { border: '2px solid #FFC107', boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)' },
              }}
            />
          </Box>

          {/* Controlli Zoom */}
          <Box sx={{ mt: 2 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <ZoomOut sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />
              <Slider
                value={zoom}
                min={1} max={3} step={0.05}
                onChange={(_, v) => setZoom(v as number)}
                sx={{
                  color: '#FFC107',
                  '& .MuiSlider-thumb': { width: 16, height: 16 },
                  '& .MuiSlider-rail': { opacity: 0.2 },
                }}
              />
              <ZoomIn sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />
              <Typography variant="caption" sx={{ minWidth: 32, textAlign: 'right', color: 'text.secondary' }}>
                {zoom.toFixed(1)}×
              </Typography>
            </Stack>
          </Box>

          {/* Controlli Rotazione */}
          <Box sx={{ mt: 0.5 }}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <RotateLeft sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />
              <Slider
                value={rotation}
                min={-180} max={180} step={1}
                onChange={(_, v) => setRotation(v as number)}
                sx={{
                  color: '#FFC107',
                  '& .MuiSlider-thumb': { width: 16, height: 16 },
                  '& .MuiSlider-rail': { opacity: 0.2 },
                }}
              />
              <RotateRight sx={{ color: 'text.secondary', fontSize: '1.1rem' }} />
              <Typography variant="caption" sx={{ minWidth: 32, textAlign: 'right', color: 'text.secondary' }}>
                {rotation}°
              </Typography>
            </Stack>
          </Box>

          {/* Azioni */}
          <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ArrowBack />}
              onClick={handleReset}
              size="small"
              sx={{ flex: 1 }}
            >
              Cambia foto
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Crop />}
              onClick={handleApplyCrop}
              size="small"
              sx={{ flex: 2 }}
            >
              Applica ritaglio
            </Button>
          </Stack>
        </Box>
      )}

      {/* ── STEP 3: Conferma & Upload ── */}
      {step === 'upload' && croppedImageUrl && (
        <Box>
          {/* Anteprima */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Box sx={{ position: 'relative' }}>
              <Avatar
                src={croppedImageUrl}
                sx={{
                  width: 160, height: 160,
                  border: '3px solid rgba(255,193,7,0.35)',
                  boxShadow: '0 8px 32px rgba(255,193,7,0.15)',
                }}
              />
              {alert?.severity === 'success' && (
                <CheckCircle
                  sx={{
                    position: 'absolute', bottom: 4, right: 4,
                    color: '#4caf50', fontSize: '2rem',
                    background: '#0d0d14', borderRadius: '50%',
                  }}
                />
              )}
            </Box>
          </Box>

          {/* Info file */}
          {originalFile && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Chip
                label={`${originalFile.name} · ${(originalFile.size / 1024).toFixed(0)} KB`}
                size="small"
                sx={{ color: 'text.secondary', bgcolor: 'rgba(255,255,255,0.04)', fontSize: '0.65rem' }}
              />
            </Box>
          )}

          {/* Progress */}
          {uploading && (
            <Box sx={{ mb: 2 }}>
              <LinearProgressBar progress={progress} />
            </Box>
          )}

          {/* Alert */}
          {alert && (
            <Alert severity={alert.severity} onClose={() => setAlert(null)} sx={{ mb: 2 }}>
              <AlertTitle>{alert.title}</AlertTitle>
              {alert.message}
            </Alert>
          )}

          {/* Azioni */}
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<ArrowBack />}
              onClick={() => setStep('crop')}
              size="small"
              sx={{ flex: 1 }}
              disabled={uploading}
            >
              Modifica
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<CloudUpload />}
              onClick={handleUpload}
              size="small"
              sx={{ flex: 2 }}
              disabled={uploading || alert?.severity === 'success'}
            >
              {uploading ? 'Caricamento...' : 'Carica foto'}
            </Button>
          </Stack>

          {alert?.severity === 'success' && (
            <Button
              fullWidth
              variant="text"
              color="primary"
              onClick={handleReset}
              size="small"
              sx={{ mt: 1.5, fontSize: '0.75rem' }}
            >
              Carica un&apos;altra foto
            </Button>
          )}
        </Box>
      )}

      {/* Alert globale (step select) */}
      {step === 'select' && alert && (
        <Alert severity={alert.severity} onClose={() => setAlert(null)} sx={{ mt: 2 }}>
          <AlertTitle>{alert.title}</AlertTitle>
          {alert.message}
        </Alert>
      )}
    </Box>
  )
}
