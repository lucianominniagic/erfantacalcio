'use client'
import { Alert, Snackbar } from '@mui/material'
import { Groups } from '@mui/icons-material'
import PageHeader from '~/components/PageHeader'
import { usePresidentiAdmin } from '~/components/presidenti/admin/usePresidentiAdmin'
import PresidentiTable from '~/components/presidenti/admin/PresidentiTable'
import PresidenteFormModal from '~/components/presidenti/admin/PresidenteFormModal'

export default function Presidenti() {
  const {
    data,
    openModalEdit,
    utenteInModifica,
    snackbar,
    isLoading,
    handleCloseSnackbar,
    handleEdit,
    handleModalClose,
    handleSubmit,
    handleInputChange,
  } = usePresidentiAdmin()

  return (
    <>
      <PageHeader title="Squadre / Presidenti" Icon={Groups} />
      <PresidentiTable
        data={data}
        isLoading={isLoading}
        onEdit={handleEdit}
      />
      <PresidenteFormModal
        open={openModalEdit}
        utenteInModifica={utenteInModifica}
        onSubmit={handleSubmit}
        onClose={handleModalClose}
        onInputChange={handleInputChange}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  )
}


