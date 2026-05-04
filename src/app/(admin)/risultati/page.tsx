'use client'
import { useState, useEffect } from 'react'
import {
  Grid,
  Card,
  CardContent,
  Box,
  Stack,
  Select,
  MenuItem,
  type SelectChangeEvent,
  FormControl,
  InputLabel,
} from '@mui/material'
import { api } from '~/utils/api'
import { getDescrizioneGiornata, getIdNextGiornata } from '~/utils/helper'
import CardPartiteAdmin from '~/components/cardPartite/CardPartiteAdmin'
import { type GiornataAdminType } from '~/types/risultati'
import { z } from 'zod'
import { calendarioSchema } from '~/schemas/calendario'
import SportsSoccer from '@mui/icons-material/SportsSoccer'
import PageHeader from '~/components/PageHeader'
import LoadingSpinner from '~/components/LinearProgressBar/LoadingSpinner'

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
    }
  }, [partiteList.data, partiteList.isSuccess, partiteList.isFetching])

  const handleChangeCalendario = async (event: SelectChangeEvent) => {
    setSelectedIdCalendario(parseInt(event.target.value))
  }

  //#endregion

  return (
    <Box>
      <PageHeader
        title="Aggiornamento risultati"
        subtitle="seleziona la giornata da caricare"
        Icon={SportsSoccer}
      />
      <Grid container justifyContent="center" spacing={2}>
        <Grid item xs={12} md={6}>
          {calendarioList.isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <LoadingSpinner />
            </Box>
          ) : (
            <Card elevation={2}>
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
                          <MenuItem key={item.id} value={item.id}>
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
                  <Box sx={{ display: 'flex', justifyContent: 'center', pt: 4 }}>
                    <LoadingSpinner />
                  </Box>
                ) : (
                  <>
                    {selectedGiornata && (
                      <CardPartiteAdmin giornata={selectedGiornata} />
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  )
}
