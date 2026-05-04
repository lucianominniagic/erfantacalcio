'use client'
import {
  Box,
  Button,
  Card,
  CardActions,
  CardMedia,
  Chip,
  Grid,
  Typography,
  useTheme,
} from '@mui/material'
import { Download } from '@mui/icons-material'
import { alpha } from '@mui/material/styles'
import { useState } from 'react'
import { Configurazione } from '~/config'

// ── Types & config ────────────────────────────────────────────────────────────

type FileType = 'xlsx' | 'csv' | 'pdf'

const FILE_TYPE_CONFIG: Record<FileType, { label: string; color: string }> = {
  xlsx: { label: 'XLSX', color: '#16a34a' },
  csv: { label: 'CSV', color: '#2563eb' },
  pdf: { label: 'PDF', color: '#dc2626' },
}

// ── DocumentCard sub-component ────────────────────────────────────────────────

interface DocumentCardProps {
  title: string
  image: string
  href: string
  fileType: FileType
}

function DocumentCard({ title, image, href, fileType }: DocumentCardProps) {
  const theme = useTheme()
  const [hovered, setHovered] = useState(false)
  const { label, color } = FILE_TYPE_CONFIG[fileType]

  return (
    <Card
      elevation={2}
      sx={{ borderRadius: 2, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Image with hover overlay */}
      <Box
        sx={{ position: 'relative', cursor: 'pointer' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => { window.location.href = href }}
      >
        <CardMedia
          component="img"
          image={image}
          alt={title}
          sx={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
        />
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            backgroundColor: alpha(theme.palette.common.black, hovered ? 0.5 : 0),
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 0.5,
            transition: 'background-color 0.2s ease',
          }}
        >
          <Download
            sx={{
              color: '#fff',
              fontSize: '2rem',
              opacity: hovered ? 1 : 0,
              transform: hovered ? 'translateY(0)' : 'translateY(6px)',
              transition: 'opacity 0.2s ease, transform 0.2s ease',
            }}
          />
          <Typography
            sx={{
              color: '#fff',
              fontSize: '0.75rem',
              fontWeight: 600,
              opacity: hovered ? 1 : 0,
              transition: 'opacity 0.2s ease',
            }}
          >
            Scarica
          </Typography>
        </Box>
      </Box>

      {/* Title + chip */}
      <Box sx={{ px: 1.5, pt: 1, pb: 0 }}>
        <Chip
          label={label}
          size="small"
          sx={{
            backgroundColor: alpha(color, 0.12),
            color,
            fontWeight: 700,
            fontSize: '0.65rem',
            height: 20,
            mb: 0.75,
          }}
        />
        <Typography sx={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.3 }}>
          {title}
        </Typography>
      </Box>

      {/* Download button */}
      <CardActions sx={{ mt: 'auto', px: 1.5, pb: 1.5, pt: 1 }}>
        <Button
          size="small"
          variant="outlined"
          startIcon={<Download sx={{ fontSize: '0.9rem !important' }} />}
          href={href}
          fullWidth
          sx={{
            borderColor: alpha(color, 0.4),
            color,
            fontSize: '0.75rem',
            '&:hover': { borderColor: color, backgroundColor: alpha(color, 0.06) },
          }}
        >
          Scarica
        </Button>
      </CardActions>
    </Card>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DocumentiPage() {
  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Documenti
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6} sm={3}>
          <DocumentCard
            title="Quotazioni Gazzetta"
            image="/images/giocatori.jpg"
            href="/docs/QuotazioniExcel.xlsx"
            fileType="xlsx"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <DocumentCard
            title="Quotazioni Gazzetta"
            image="/images/giocatori.jpg"
            href="/docs/QuotazioniExcel.csv"
            fileType="csv"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <DocumentCard
            title={`Rose ${Configurazione.stagionePrecedente}`}
            image="/images/giocatori2.png"
            href={`/docs/rose_${Configurazione.stagionePrecedente}.csv`}
            fileType="csv"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <DocumentCard
            title="Regolamento"
            image="/images/regolamento.jpg"
            href="/docs/Regolamento_erFantacalcio.pdf"
            fileType="pdf"
          />
        </Grid>
      </Grid>
    </Box>
  )
}
