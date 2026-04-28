'use client'
import { useState, useEffect } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Box,
  Stack,
  CardHeader,
  Select,
  MenuItem,
  type SelectChangeEvent,
  LinearProgress,
  CircularProgress,
  FormControl,
  InputLabel,
  Paper,
} from '@mui/material'
import { api } from '~/utils/api'
import { getDescrizioneGiornata, getIdNextGiornata } from '~/utils/helper'
import CardPartiteAdmin from '~/components/cardPartite/CardPartiteAdmin'
import { type GiornataAdminType } from '~/types/risultati'
import { z } from 'zod'
import { calendarioSchema } from '~/schemas/calendario'

export default function Risultati() {
  //#region select calendario
  const [selectedIdCalendario, setSelectedIdCalendario] = useState<number>()
  const [calendario, setCalendario] = useState<
    z.infer<typeof calendarioSchema>[]
  >([])
  const [selectedGiornata, setSelectedGiornata] = useState<GiornataAdminType>()
  const calendarioList = api.calendario.list.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })
  const partiteList = api.risultati.getGiornataPartite.useQuery(
    {
      idCalendario: selectedIdCalendario!,
      includeTabellini: true,
      backOfficeMode: true,
    },
    { enabled: !!selectedIdCalendario },
  )

  useEffect(() => {
    if (calendarioList.data) {
      setCalendario(calendarioList.data)
      const idCalendario = getIdNextGiornata(calendarioList.data)
      setSelectedIdCalendario(idCalendario)
    }
  }, [calendarioList.data])

  useEffect(() => {
    if (!partiteList.isFetching && partiteList.isSuccess && partiteList.data) {
      setSelectedGiornata(partiteList.data)
      console.log('partiteList: ', partiteList.data)
    }
  }, [partiteList.data, partiteList.isSuccess, partiteList.isFetching])

  const handleChangeCalendario = async (event: SelectChangeEvent) => {
    setSelectedIdCalendario(parseInt(event.target.value))
  }

  //#endregion

  return (
    <Grid container justifyContent="center" spacing={0} border={0}>
      <Grid item xs={12} md={6}>
        {calendarioList.isLoading ? (
          <Box
            sx={{
              width: '90%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <LinearProgress color="inherit" />
          </Box>
        ) : (
          <Card sx={{ maxWidth: 600, p: 0 }}>
            <CardHeader
              title="Aggiornamento risultati"
              subheader="aggiornamento risultati partite, seleziona la giornata da caricare"
              titleTypographyProps={{ variant: 'h4' }}
            />
            <CardContent>
              <Box sx={{ p: 1 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  justifyContent="space-between"
                >
                  <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                    <InputLabel id="select-label-calendario">
                      Calendario
                    </InputLabel>
                    <Select
                      size="small"
                      variant="outlined"
                      labelId="select-label-calendario"
                      label="Calendario"
                      sx={{ m: 0 }}
                      name="cbCalendario"
                      value={selectedIdCalendario?.toLocaleString() ?? ''}
                      onChange={handleChangeCalendario}
                    >
                      {calendario.map((item) => (
                        <MenuItem
                          key={item.id}
                          value={item.id}
                          
                        >
                          {getDescrizioneGiornata(
                            item.giornataSerieA,
                            item.nome,
                            item.giornata,
                            item.gruppoFase,
                          )}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>
              </Box>
              {selectedIdCalendario !== selectedGiornata?.idCalendario ? (
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
                  {selectedGiornata && (
                    <CardPartiteAdmin
                      giornata={selectedGiornata}
                    ></CardPartiteAdmin>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        )}
      </Grid>
    </Grid>
  )
}
