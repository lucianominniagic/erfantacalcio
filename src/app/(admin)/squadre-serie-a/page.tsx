'use client'
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
    errorMessageModal,
    messageModal,
    isLoading,
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
        errorMessage={errorMessageModal}
        message={messageModal}
        onSubmit={handleSubmit}
        onClose={handleModalClose}
        onInputChange={handleInputChange}
      />
    </>
  )
}
