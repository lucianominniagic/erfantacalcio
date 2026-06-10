'use client'
import { Box, Grid, LinearProgress } from '@mui/material'
import { CloudUpload } from '@mui/icons-material'
import PageHeader from '~/components/PageHeader'
import { useUploadVotiAdmin } from '~/components/uploadVoti/admin/useUploadVotiAdmin'
import UploadVotiForm from '~/components/uploadVoti/admin/UploadVotiForm'

export default function UploadVoti() {
  const {
    selectedIdCalendario,
    calendario,
    infofile,
    uploading,
    progress,
    alert,
    calendarioIsLoading,
    setAlert,
    handleChangeCalendario,
    handleSelezioneFile,
    handleFileChange,
    handleUploadVercel,
  } = useUploadVotiAdmin()

  return (
    <Box>
      <PageHeader
        title="Upload voti"
        subtitle="Carica il file CSV dei voti per la giornata selezionata"
        Icon={CloudUpload}
      />
      <Grid container justifyContent="center" spacing={2}>
        <Grid item xs={12} md={6}>
          {calendarioIsLoading ? (
            <Box sx={{ mb: 2 }}>
              <LinearProgress color="inherit" />
            </Box>
          ) : (
            <UploadVotiForm
              selectedIdCalendario={selectedIdCalendario}
              calendario={calendario}
              infofile={infofile}
              uploading={uploading}
              progress={progress}
              alert={alert}
              onAlertClose={() => setAlert(null)}
              onChangeCalendario={handleChangeCalendario}
              onSelezioneFile={handleSelezioneFile}
              onFileChange={handleFileChange}
              onUpload={handleUploadVercel}
            />
          )}
        </Grid>
      </Grid>
    </Box>
  )
}


