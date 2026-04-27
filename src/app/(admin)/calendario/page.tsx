'use client'
import React, { useEffect, useState } from 'react'
import { api } from '~/utils/api'
import Modal from '~/components/modal/Modal'
import { z } from 'zod'

//import material ui
import CheckIcon from '@mui/icons-material/CheckCircle'
import {
  CircularProgress,
  Grid,
  Divider,
  Alert,
  Stack,
  TextField,
  Button,
  Box,
  Select,
  MenuItem,
  type SelectChangeEvent,
  FormControl,
  InputLabel,
  FormControlLabel,
  Checkbox,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { MobileDateTimePicker } from '@mui/x-date-pickers/MobileDateTimePicker'
import dayjs from 'dayjs'
import 'dayjs/locale/it'
import {
  DataGrid,
  GridActionsCellItem,
  type GridColDef,
} from '@mui/x-data-grid'
import { autosizeOptions } from '~/utils/datatable'
import { Edit } from '@mui/icons-material'
import { calendarioSchema } from '~/schemas/calendario'


export default function Calendario() {
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))

  const [idCalendario, setIdCalendario] = useState<number>()
  const calendarioList = api.calendario.list.useQuery()
  const oneCalendario = api.calendario.getOne.useQuery(
    { idCalendario: idCalendario! },
    { enabled: !!idCalendario },
  )
  const torneiList = api.tornei.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
  })
  const updateCalendario = api.calendario.update.useMutation({
    onSuccess: async () => await calendarioList.refetch(),
  })

  const [errorMessageModal, setErrorMessageModal] = useState('')
  const [messageModal, setMessageModal] = useState('')
  const [data, setData] = useState<z.infer<typeof calendarioSchema>[]>([])
  const [openModalEdit, setOpenModalEdit] = useState(false)
  const [calendarioInModifica, setCalendarioInModifica] = useState<z.infer<typeof calendarioSchema>>({
    id: 0,
    idTorneo: 1,
    nome: '',
    gruppoFase: null,
    giornata: 0,
    giornataSerieA: 0,
    isGiocata: false,
    isSovrapposta: false,
    isRecupero: false,
    data: '',
    dataFine: '',
    girone: null,
    isSelected: false,
  }) 

  useEffect(() => {
    if (calendarioList.data) {
      setData(calendarioList.data)
    }
  }, [calendarioList.data])

  useEffect(() => {
    if (
      !oneCalendario.isFetching &&
      oneCalendario.isSuccess &&
      oneCalendario.data
    ) {
      setCalendarioInModifica(oneCalendario.data)
      setErrorMessageModal('')
      setMessageModal('')
      setOpenModalEdit(true)
    }
  }, [oneCalendario.data, oneCalendario.isSuccess, oneCalendario.isFetching])

  const pageSize = 8

  const columns: GridColDef[] = [
    { field: 'id', type: 'number', hideable: true },
    {
      field: 'nome',
      type: 'string',
      renderHeader: () => <strong>Nome</strong>,
      flex: isXs ? 0 : 1,
    },
    {
      field: 'giornataSerieA',
      type: 'number',
      renderHeader: () => <strong>Giornata Serie A</strong>,
      flex: isXs ? 0 : 1,
    },
    {
      field: 'girone',
      type: 'number',
      renderHeader: () => <strong>Girone</strong>,
      flex: isXs ? 0 : 1,
    },
    {
      field: 'gruppoFase',
      type: 'string',
      renderHeader: () => <strong>Gruppo fase</strong>,
      flex: isXs ? 0 : 1,
    },
    {
      field: 'data',
      type: 'date',
      valueFormatter: (value) => {
        if (value) {
          return dayjs(value).format('DD/MM/YYYY HH:mm')
        }
        return ''
      },
      renderHeader: () => <strong>Data</strong>,
      flex: isXs ? 0 : 1,
    },
    {
      field: 'giornata',
      type: 'number',
      renderHeader: () => <strong>Giornata</strong>,
      flex: isXs ? 0 : 1,
    },
    {
      field: 'isSovrapposta',
      type: 'boolean',
      renderHeader: () => <strong>Sovrapposta</strong>,
    },
    {
      field: 'isRecupero',
      type: 'boolean',
      renderHeader: () => <strong>Recupero</strong>,
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

  //#region edit

  const handleEdit = async (_idCalendario: number) => {
    setIdCalendario(_idCalendario)
  }

  const handleModalClose = () => {
    setOpenModalEdit(false)
    setIdCalendario(undefined)
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrorMessageModal('')
    setMessageModal('')
    const responseVal = calendarioSchema.safeParse(calendarioInModifica)
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
        await updateCalendario.mutateAsync(calendarioInModifica)
        setMessageModal('Salvataggio completato')
        handleModalClose()
      } catch (error) {
        setErrorMessageModal(
          'Si è verificato un errore nel salvataggio del calendario',
        )
      }
    }
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = event.currentTarget
    console.log(event.currentTarget)
    setCalendarioInModifica((prevState) => ({
      ...prevState,
      [name]:
        type === 'number'
          ? +value
          : type === 'checkbox'
            ? checked
            : type === 'datetime-local'
              ? dayjs(value).toISOString()
              : value,
    }))
  }

  const handleSelectChange = (event: SelectChangeEvent) => {
    setCalendarioInModifica((prevState) => ({
      ...prevState,
      [event.target.name]: event.target.value,
    }))
  }

  //#endregion

  return (
    <>
      {calendarioList.isLoading ? (
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
          <Typography variant="h5">Gestione calendario</Typography>
          <Box
            sx={{ width: '100%', overflowX: 'auto', contain: 'inline-size' }}
          >
            <DataGrid
              columnHeaderHeight={45}
              rowHeight={40}
              loading={calendarioList.isLoading}
              initialState={{
                columns: {
                  columnVisibilityModel: {
                    id: false,
                  },
                },
                pagination: {
                  paginationModel: {
                    pageSize: 25,
                  },
                },
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
              disableColumnSorting={false}
              disableColumnResize={true}
              hideFooter={false}
              hideFooterPagination={false}
              pageSizeOptions={[5, 10, 20]}
              paginationMode="client"
              pagination={true}
              hideFooterSelectedRowCount={true}
              columns={columns}
              rows={calendarioList.isLoading ? skeletonRows : data}
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
          <br></br>
          <br></br>
          <br></br>
        </>
      )}

      <Modal
        title="Modifica dati calendario"
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
              <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                <InputLabel id="select-label-torneo">Nome torneo</InputLabel>
                <Select
                  size="small"
                  variant="outlined"
                  labelId="select-label-torneo"
                  label="Nome torneo"
                  margin="dense"
                  required
                  sx={{ m: 2 }}
                  name="idTorneo"
                  onChange={handleSelectChange}
                  value={
                    torneiList && torneiList.data
                      ? calendarioInModifica.idTorneo.toString()
                      : ''
                  }
                >
                  {torneiList?.data?.map((item) => (
                    <MenuItem
                      key={`torneiSlc_${item.idTorneo}`}
                      value={item.idTorneo}
                    >
                      {item.nome} {item.gruppoFase}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                margin="normal"
                size="small"
                variant="outlined"
                required
                type="number"
                sx={{ m: 2 }}
                label="Giornata"
                name="giornata"
                value={calendarioInModifica.giornata}
                onChange={handleInputChange}
              />
              <TextField
                margin="normal"
                size="small"
                variant="outlined"
                required
                type="number"
                sx={{ m: 2 }}
                label="Giornata serie A"
                name="giornataSerieA"
                value={calendarioInModifica.giornataSerieA}
                autoFocus
                onChange={handleInputChange}
              />
              <TextField
                margin="normal"
                size="small"
                variant="outlined"
                type="number"
                sx={{ m: 2 }}
                label="Girone"
                name="girone"
                value={calendarioInModifica.girone}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <LocalizationProvider
                dateAdapter={AdapterDayjs}
                adapterLocale="it"
              >
                <MobileDateTimePicker
                  value={dayjs(calendarioInModifica.data)}
                  onChange={(newValue) =>
                    setCalendarioInModifica({
                      ...calendarioInModifica,
                      data: newValue?.toISOString() ?? new Date().toISOString(),
                    })
                  }
                />
              </LocalizationProvider>

              <FormControlLabel
                sx={{ ml: 2, mr: 2 }}
                color="error"
                control={
                  <Checkbox
                    onChange={handleInputChange}
                    color="success"
                    name="isRecupero"
                    checked={calendarioInModifica.isRecupero}
                    value={calendarioInModifica.isRecupero}
                  />
                }
                label={<Typography color="primary">Da recuperare</Typography>}
              />
              <FormControlLabel
                sx={{ ml: 2, mr: 2 }}
                color="error"
                control={
                  <Checkbox
                    onChange={handleInputChange}
                    color="success"
                    name="isSovrapposta"
                    checked={calendarioInModifica.isSovrapposta}
                    value={calendarioInModifica.isSovrapposta}
                  />
                }
                label={<Typography color="primary">Sovrapposta</Typography>}
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
