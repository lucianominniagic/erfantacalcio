'use client'
import React, { useEffect, useState } from 'react'
import { api } from '~/utils/api'
import Modal from '~/components/modal/Modal'
import { z } from 'zod'

import CheckIcon from '@mui/icons-material/CheckCircle'
import {
  CircularProgress,
  Divider,
  Typography,
  Checkbox,
  FormControlLabel,
  Alert,
  Stack,
  TextField,
  Button,
  Box,
  useTheme,
  useMediaQuery,
  Grid,
} from '@mui/material'
import { type SquadraType } from '~/types/squadre'
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
} from '@mui/x-data-grid'
import { autosizeOptions } from '~/utils/datatable'
import { Edit } from '@mui/icons-material'
import { utenteSchema } from '~/schemas/presidente'

export default function Presidenti() {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))
  const [idSquadra, setIdSquadra] = useState<number>()

  const squadreList = api.squadre.list.useQuery()
  const squadra = api.squadre.get.useQuery(
    { idSquadra: idSquadra! },
    { enabled: !!idSquadra },
  )
  const updateSquadra = api.squadre.update.useMutation({
    onSuccess: async () => await squadreList.refetch(),
  })

  const [errorMessageModal, setErrorMessageModal] = useState('')
  const [messageModal, setMessageModal] = useState('')
  const [data, setData] = useState<SquadraType[]>([])
  const [openModalEdit, setOpenModalEdit] = useState(false)
  const [utenteInModifica, setUtenteInModifica] = useState<SquadraType>({
    id: 0,
    isAdmin: false,
    isLockLevel: false,
    presidente: '',
    email: '',
    squadra: '',
    importoAnnuale: 0,
    importoMulte: 0,
    importoMercato: 0,
    fantamilioni: 0,
  })

  useEffect(() => {
    if (squadreList.data) {
      setData(squadreList.data)
    }
  }, [squadreList.data])

  useEffect(() => {
    if (!squadra.isFetching && squadra.isSuccess && squadra.data) {
      setUtenteInModifica(squadra.data)
      setErrorMessageModal('')
      setMessageModal('')
      setOpenModalEdit(true)
    }
  }, [squadra.data, squadra.isSuccess, squadra.isFetching])

  const pageSize = 8

  const columns: GridColDef[] = [
    { field: 'id', type: 'number', hideable: true },
    {
      field: 'squadra',
      type: 'string',
      renderHeader: () => <strong>Squadra</strong>,
      flex: isXs ? 0 : 1,
    },
    {
      field: 'presidente',
      type: 'string',
      renderHeader: () => <strong>Presidente</strong>,
      flex: isXs ? 0 : 1,
    },
    {
      field: 'email',
      type: 'string',
      renderHeader: () => <strong>Email</strong>,
      flex: isXs ? 0 : 1,
    },
    {
      field: 'isAdmin',
      type: 'boolean',
      renderHeader: () => <strong>Admin</strong>,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        return [
          <GridActionsCellItem
            key={1}
            icon={<Edit color="action" />}
            label="Edit"
            className="textPrimary"
            onClick={() => handleEdit(parseInt(id.toString(), 10))}
            color="inherit"
          />,
        ]
      },
    },
  ]

  const skeletonRows = Array.from({ length: pageSize }, (_, index) => ({
    id: `skeleton-${index}`,
  }))

  const handleEdit = async (_idUtente: number) => {
    setIdSquadra(_idUtente)
  }

  const handleModalClose = () => {
    setOpenModalEdit(false)
    setIdSquadra(undefined)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessageModal('')
    setMessageModal('')
    const responseVal = utenteSchema.safeParse(utenteInModifica)
    if (!responseVal.success) {
      setErrorMessageModal(
        responseVal.error.issues
          .map(
            (issue) => `campo ${issue.path.toLocaleString()}: ${issue.message}`,
          )
          .join(', '),
      )
    } else {
      try {
        await updateSquadra.mutateAsync(utenteInModifica)
        setMessageModal('Salvataggio completato')
      } catch (error) {
        setErrorMessageModal(
          "Si è verificato un errore nel salvataggio dell'utente",
        )
      }
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.currentTarget
    setUtenteInModifica((prevState) => ({
      ...prevState,
      [name]:
        type === 'number' ? +value : type === 'checkbox' ? checked : value,
    }))
  }

  return (
    <>
      {squadreList.isLoading ? (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <CircularProgress color="info" />
        </div>
      ) : (
        <>
          <Typography variant="h5">Squadre / Presidenti</Typography>
          <Box
            sx={{ width: '100%', overflowX: 'auto', contain: 'inline-size' }}
          >
            <DataGrid
              columnHeaderHeight={45}
              rowHeight={40}
              loading={squadreList.isLoading}
              initialState={{
                columns: {
                  columnVisibilityModel: {
                    id: false,
                  },
                },
                pagination: undefined,
                filter: undefined,
                density: 'compact',
              }}
              slotProps={{
                loadingOverlay: {
                  variant: 'skeleton',
                },
              }}
              checkboxSelection={false}
              disableColumnFilter={true}
              disableColumnMenu={true}
              disableColumnSelector={true}
              disableColumnSorting={true}
              disableColumnResize={true}
              hideFooter={true}
              hideFooterPagination={true}
              hideFooterSelectedRowCount={true}
              columns={columns}
              rows={squadreList.isLoading ? skeletonRows : data}
              disableRowSelectionOnClick={true}
              autosizeOptions={autosizeOptions}
              sx={{
                backgroundColor: theme.palette.background.paper,
                '& .MuiDataGrid-columnHeader': {
                  color: theme.palette.primary.light,
                  backgroundColor: theme.palette.primary.dark,
                },
              }}
            />
          </Box>
        </>
      )}

      <Modal
        title="Modifica dati squadra"
        open={openModalEdit}
        onClose={handleModalClose}
      >
        <Divider />
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <Grid container spacing={0}>
            <Grid item xs={12}>
              {errorMessageModal && (
                <Stack sx={{ width: '100%' }} spacing={0}>
                  <Alert
                    icon={<CheckIcon fontSize="inherit" />}
                    severity="error"
                  >
                    {errorMessageModal}
                  </Alert>
                </Stack>
              )}
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="normal"
                size="small"
                variant="outlined"
                required
                sx={{ m: 2 }}
                label="Presidente"
                name="presidente"
                value={utenteInModifica.presidente}
                onChange={handleInputChange}
              />
              <TextField
                margin="normal"
                size="small"
                variant="outlined"
                required
                sx={{ m: 2 }}
                label="Squadra"
                name="squadra"
                value={utenteInModifica.squadra}
                onChange={handleInputChange}
              />
              <TextField
                margin="normal"
                size="small"
                variant="outlined"
                required
                sx={{ m: 2 }}
                label="Email"
                name="email"
                value={utenteInModifica.email}
                autoFocus
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="normal"
                size="small"
                variant="outlined"
                required
                type="number"
                sx={{ m: 2 }}
                label="Importo annuale"
                name="importoAnnuale"
                value={utenteInModifica?.importoAnnuale}
                onChange={handleInputChange}
              />
              <TextField
                margin="normal"
                size="small"
                variant="outlined"
                required
                type="number"
                sx={{ m: 2 }}
                label="Importo multe"
                name="importoMulte"
                value={utenteInModifica?.importoMulte}
                onChange={handleInputChange}
              />
              <TextField
                margin="normal"
                size="small"
                variant="outlined"
                required
                type="number"
                sx={{ m: 2 }}
                label="Importo mercato"
                name="importoMercato"
                value={utenteInModifica?.importoMercato}
                onChange={handleInputChange}
              />
              <TextField
                margin="normal"
                size="small"
                variant="outlined"
                required
                type="number"
                sx={{ m: 2 }}
                label="Fantamilioni"
                name="fantamilioni"
                value={utenteInModifica?.fantamilioni}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                sx={{ ml: 2, mr: 2 }}
                color="error"
                control={
                  <Checkbox
                    onChange={handleInputChange}
                    color="success"
                    name="isAdmin"
                    checked={utenteInModifica?.isAdmin}
                    value={utenteInModifica?.isAdmin}
                  />
                }
                label={<Typography color="primary">Amministratore</Typography>}
              />
            </Grid>
            <Grid item xs={5}>
              <Button
                type="submit"
                fullWidth
                color="info"
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                Aggiorna dati
              </Button>
            </Grid>
            <Grid item xs={2}></Grid>
            <Grid item xs={5}>
              <Button
                type="button"
                onClick={handleModalClose}
                fullWidth
                color="warning"
                variant="outlined"
                sx={{ mt: 3, mb: 2 }}
              >
                Chiudi
              </Button>
            </Grid>
            <Grid item xs={12}>
              {messageModal && (
                <Stack sx={{ width: '100%' }} spacing={0}>
                  <Alert
                    icon={<CheckIcon fontSize="inherit" />}
                    severity="success"
                  >
                    {messageModal}
                  </Alert>
                </Stack>
              )}
            </Grid>
          </Grid>
        </Box>
      </Modal>
    </>
  )
}
