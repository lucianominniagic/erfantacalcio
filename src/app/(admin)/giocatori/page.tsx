'use client'
import { Button, Stack, Typography } from '@mui/material'
import { PersonSearch } from '@mui/icons-material'
import GenericAutocomplete from '~/components/autocomplete/GenericAutocomplete'
import PageHeader from '~/components/PageHeader'
import { useGiocatoriAdmin } from '~/components/giocatori/admin/useGiocatoriAdmin'
import GiocatoreDialog from '~/components/giocatori/admin/GiocatoreDialog'
import TrasferimentoDialog from '~/components/giocatori/admin/TrasferimentoDialog'
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
    giocatoreDialogOpen,
    trasferimentoDialogOpen,
    handleGiocatoreSelected,
    handleOpenGiocatoreDialog,
    handleCloseGiocatoreDialog,
    handleCancelGiocatore,
    handleUpsertGiocatore,
    handleDeleteGiocatore,
    handleOpenTrasferimentoDialog,
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
      spacing={2}
      justifyContent="space-between"
      paddingTop={2}
      paddingBottom={2}
    >
      <PageHeader title="Gestione giocatori" Icon={PersonSearch} />

      {/* Riga: Autocomplete + pulsanti */}
      <Stack direction="row" spacing={1} alignItems="center">
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

        {selectedGiocatoreId !== undefined && (
          <Button
            variant="outlined"
            onClick={() => handleOpenGiocatoreDialog(false)}
          >
            Modifica anagrafica
          </Button>
        )}

        <Button
          variant="contained"
          onClick={() => handleOpenGiocatoreDialog(true)}
        >
          Nuovo giocatore
        </Button>
      </Stack>

      {/* Griglia trasferimenti — visibile solo se giocatore selezionato */}
      {selectedGiocatoreId !== undefined && (
        <>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">
              Trasferimenti {giocatoreNome ?? selectedGiocatore}
            </Typography>
            <Button
              variant="outlined"
              onClick={() => handleOpenTrasferimentoDialog(true)}
            >
              Nuovo trasferimento
            </Button>
          </Stack>

          <TrasferimentiGrid
            trasferimenti={trasferimenti}
            isLoading={trasferimentiIsLoading}
            isSuccess={trasferimentiIsSuccess}
            selectedGiocatoreId={selectedGiocatoreId}
            giocatoreNome={giocatoreNome}
            onEditTrasferimento={handleEditTrasferimento}
          />
        </>
      )}

      {/* Dialog anagrafica */}
      <GiocatoreDialog
        open={giocatoreDialogOpen}
        giocatore={giocatore}
        selectedGiocatoreId={selectedGiocatoreId}
        errorMessage={errorMessageGiocatore}
        message={messageGiocatore}
        onSubmit={handleUpsertGiocatore}
        onCancel={handleCancelGiocatore}
        onDelete={handleDeleteGiocatore}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
      />

      {/* Dialog trasferimento */}
      <TrasferimentoDialog
        open={trasferimentoDialogOpen}
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
    </Stack>
  )
}
