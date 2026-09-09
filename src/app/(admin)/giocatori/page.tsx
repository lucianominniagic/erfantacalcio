'use client'
import { Alert, Button, Snackbar, Stack, Typography } from '@mui/material'
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
    snackbar,
    giocatore,
    trasferimento,
    trasferimentiIsLoading,
    trasferimentiIsSuccess,
    giocatoreNome,
    giocatoreDialogOpen,
    trasferimentoDialogOpen,
    handleCloseSnackbar,
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
        onSubmit={handleUpsertTrasferimento}
        onCancel={handleCancelTrasferimento}
        onDelete={handleDeleteTrasferimento}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
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
    </Stack>
  )
}
