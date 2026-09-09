'use client'
import { Alert, Snackbar } from '@mui/material'
import { SportsSoccer } from '@mui/icons-material'
import PageHeader from '~/components/PageHeader'
import { useSquadreSerieAAdmin } from '~/components/squadreSerieA/admin/useSquadreSerieAAdmin'
import SquadreSerieATable from '~/components/squadreSerieA/admin/SquadreSerieATable'
import SquadraSerieAFormModal from '~/components/squadreSerieA/admin/SquadraSerieAFormModal'

export default function SquadreSerieA() {
  const {
    data,
    openModalEdit,
    squadraSerieAInModifica,
    snackbar,
    isLoading,
    handleCloseSnackbar,
    handleEdit,
    handleModalClose,
    handleSubmit,
    handleInputChange,
  } = useSquadreSerieAAdmin()

  return (
    <>
      <PageHeader title="Squadre Serie A" Icon={SportsSoccer} />
      <SquadreSerieATable data={data} isLoading={isLoading} onEdit={handleEdit} />
      <SquadraSerieAFormModal
        open={openModalEdit}
        squadraSerieAInModifica={squadraSerieAInModifica}
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
