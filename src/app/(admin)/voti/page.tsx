'use client'
import { Stack } from '@mui/material'
import { GradingOutlined } from '@mui/icons-material'
import GenericAutocomplete from '~/components/autocomplete/GenericAutocomplete'
import PageHeader from '~/components/PageHeader'
import { useVotiAdmin } from '~/components/voti/admin/useVotiAdmin'
import VotiList from '~/components/voti/admin/VotiList'
import VotoEditModal from '~/components/voti/admin/VotoEditModal'

export default function Voti() {
  const {
    openModalEdit,
    selectedGiocatoreId,
    giocatori,
    voti,
    voto,
    errorMessageVoto,
    messageVoto,
    votiIsLoading,
    votiIsSuccess,
    setVoto,
    handleGiocatoreSelected,
    handleEditVoto,
    handleUpdateVoto,
    handleModalClose,
  } = useVotiAdmin()

  return (
    <>
      <Stack direction="column" spacing={1} justifyContent="space-between">
        <PageHeader title="Gestione voti" Icon={GradingOutlined} />
        <GenericAutocomplete
          onItemSelected={(id) => {
            const numericId = typeof id === 'number' ? id : undefined
            handleGiocatoreSelected(numericId)
          }}
          items={giocatori ?? []}
        />
        <VotiList
          voti={voti}
          isLoading={votiIsLoading}
          isSuccess={votiIsSuccess}
          selectedGiocatoreId={selectedGiocatoreId}
          onEditVoto={handleEditVoto}
        />
      </Stack>

      <VotoEditModal
        open={openModalEdit}
        voto={voto}
        errorMessage={errorMessageVoto}
        message={messageVoto}
        onSubmit={handleUpdateVoto}
        onClose={handleModalClose}
        onVotoChange={setVoto}
      />
    </>
  )
}


