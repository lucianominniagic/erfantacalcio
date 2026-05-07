'use client'
import { Stack, Typography } from '@mui/material'
import { PersonSearch } from '@mui/icons-material'
import GenericAutocomplete from '~/components/autocomplete/GenericAutocomplete'
import PageHeader from '~/components/PageHeader'
import { useGiocatoriAdmin } from '~/components/giocatori/admin/useGiocatoriAdmin'
import GiocatoreFormPanel from '~/components/giocatori/admin/GiocatoreFormPanel'
import TrasferimentoFormPanel from '~/components/giocatori/admin/TrasferimentoFormPanel'
import TrasferimentiGrid from '~/components/giocatori/admin/TrasferimentiGrid'

export default function Giocatori() {
  const {
    selectedGiocatoreId,
    selectedGiocatore,
    selectedTrasferimentoId,
    selectedTrasferimentoStagione,
    giocatori,
    giocatoriIsLoading,
    squadre,
    squadreSerieA,
    trasferimenti,
    errorMessageGiocatore,
    messageGiocatore,
    errorMessageTrasferimento,
    messageTrasferimento,
    giocatore,
    trasferimento,
    trasferimentiIsLoading,
    trasferimentiIsSuccess,
    giocatoreNome,
    handleGiocatoreSelected,
    handleCancelGiocatore,
    handleUpsertGiocatore,
    handleDeleteGiocatore,
    handleCancelTrasferimento,
    handleEditTrasferimento,
    handleUpsertTrasferimento,
    handleDeleteTrasferimento,
    handleInputChange,
    handleSelectChange,
    handleSearchInputChange,
  } = useGiocatoriAdmin()

  return (
    <Stack
      direction="column"
      spacing={1}
      justifyContent="space-between"
      paddingTop={2}
      paddingBottom={2}
    >
      <PageHeader title="Gestione giocatori" Icon={PersonSearch} />
      <GenericAutocomplete
        onItemSelected={(id, text) => {
          const numericId = typeof id === 'number' ? id : undefined
          handleGiocatoreSelected(numericId, text)
        }}
        items={giocatori}
        loading={giocatoriIsLoading}
        onInputChange={handleSearchInputChange}
        filterOptions={(x) => x}
        allowCustomInput={false}
      />
      <Stack direction="row" spacing={1} justifyContent="flex-start">
        <Typography variant="h5">IdGiocatore: {selectedGiocatoreId}</Typography>
        <Typography variant="h5">
          IdTrasferimento: {selectedTrasferimentoId}
        </Typography>
      </Stack>
      <GiocatoreFormPanel
        giocatore={giocatore}
        selectedGiocatoreId={selectedGiocatoreId}
        selectedGiocatore={selectedGiocatore}
        errorMessage={errorMessageGiocatore}
        message={messageGiocatore}
        onSubmit={handleUpsertGiocatore}
        onCancel={handleCancelGiocatore}
        onDelete={handleDeleteGiocatore}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
      />
      <TrasferimentoFormPanel
        trasferimento={trasferimento}
        selectedGiocatoreId={selectedGiocatoreId}
        selectedTrasferimentoId={selectedTrasferimentoId}
        selectedTrasferimentoStagione={selectedTrasferimentoStagione}
        squadre={squadre}
        squadreSerieA={squadreSerieA}
        errorMessage={errorMessageTrasferimento}
        message={messageTrasferimento}
        onSubmit={handleUpsertTrasferimento}
        onCancel={handleCancelTrasferimento}
        onDelete={handleDeleteTrasferimento}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
      />
      <TrasferimentiGrid
        trasferimenti={trasferimenti}
        isLoading={trasferimentiIsLoading}
        isSuccess={trasferimentiIsSuccess}
        selectedGiocatoreId={selectedGiocatoreId}
        giocatoreNome={giocatoreNome}
        onEditTrasferimento={handleEditTrasferimento}
      />
    </Stack>
  )
}
