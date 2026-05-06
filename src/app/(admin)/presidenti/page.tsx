'use client'
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
    errorMessageModal,
    messageModal,
    isLoading,
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
        errorMessage={errorMessageModal}
        message={messageModal}
        onSubmit={handleSubmit}
        onClose={handleModalClose}
        onInputChange={handleInputChange}
      />
    </>
  )
}


