'use client'
import { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '~/utils/orpc'
import {
  Box,
  Divider,
  Grid,
  Tab,
  Tabs,
  useMediaQuery,
  useTheme,
  Slide,
} from '@mui/material'
import Classifica from '~/components/home/Classifica'
import CalendarioButtonGroup from '~/components/home/CalendarioButtonGroup'
import ChampionsBracket from '~/components/home/ChampionsBracket'
import Squadre from '~/components/home/Squadre'
import EconomiaPreviewCard from '~/components/home/EconomiaPreviewCard'
import StatistichePreviewCard from '~/components/home/StatistichePreviewCard'
import Calendario from '~/components/home/Calendario'
import Modal from '~/components/modal/Modal'
import CardPartite from '~/components/cardPartite/CardPartite'
import { useSession } from 'next-auth/react'
import { z } from 'zod'
import { Configurazione } from '~/config'
import { giornataSchema } from '~/schemas/calendario'

export default function HomePage() {
  const { data: session } = useSession()
  const torneiList = useQuery(
    orpc.tornei.list.queryOptions({
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
  )
  const championsBracket = useQuery(
    orpc.tornei.coppaBracket.queryOptions({
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      input: { nomeTorneo: 'champions' },
    }),
  )
  const coppaPerdentiBracket = useQuery(
    orpc.tornei.coppaBracket.queryOptions({
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      input: { nomeTorneo: 'coppa dei perdenti' },
    }),
  )
  const prossimeGiornate = useQuery(
    orpc.calendario.getProssimeGiornate.queryOptions({
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    }),
  )
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('md'))
  const [openModalCalendario, setOpenModalCalendario] = useState(false)
  const [titleModalCalendario, setTitleModalCalendario] = useState('')
  const [girone, setGirone] = useState<number>()
  const [isCalendarioAttuale, setIsCalendarioAttuale] = useState<boolean>(false)
  const [isChampions, setIsChampions] = useState<boolean>(false)
  const [isCalendarioRecuperi, setIsCalendarioRecuperi] =
    useState<boolean>(false)

  const hasSemifinaliTeams =
    !championsBracket.isLoading &&
    !!championsBracket.data?.semifinaliAndata?.partite.some(
      (p) => p.idHome !== null || p.idAway !== null,
    )
  const hasSemifinaliTeamsCoppaPerdenti =
    !coppaPerdentiBracket.isLoading &&
    !!coppaPerdentiBracket.data?.semifinaliAndata?.partite.some(
      (p) => p.idHome !== null || p.idAway !== null,
    )
  const stagionefinita =
    !prossimeGiornate.isLoading &&
    prossimeGiornate.isSuccess &&
    (prossimeGiornate.data?.length ?? 1) === 0
  const [coppaTab, setCoppaTab] = useState(0)
  const [classificaTab, setClassificaTab] = useState(0)

  const calendarioList =
    girone && !isCalendarioAttuale && !isCalendarioRecuperi
      ? useQuery(
          orpc.calendario.listByGirone.queryOptions({
            input: girone,
            enabled: true,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          }),
        )
      : isCalendarioAttuale
        ? useQuery(
            orpc.calendario.listAttuale.queryOptions({
              enabled: isCalendarioAttuale,
              refetchOnWindowFocus: false,
              refetchOnReconnect: false,
            }),
          )
        : isChampions
          ? useQuery(
              orpc.calendario.listByTorneo.queryOptions({
                input: [2, 3, 4, 5, 6],
                enabled: isChampions,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
              }),
            )
          : useQuery(
              orpc.calendario.listRecuperi.queryOptions({
                enabled: isCalendarioRecuperi,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
              }),
            )
  const [giornata, setGiornata] = useState<z.infer<typeof giornataSchema>[]>()

  useEffect(() => {
    if (
      !calendarioList.isFetching &&
      calendarioList.isSuccess &&
      calendarioList.data
    ) {
      setGiornata(calendarioList.data)
    }
  }, [calendarioList.data, calendarioList.isSuccess, calendarioList.isFetching])

  useEffect(() => {
    if (!championsBracket.isLoading) {
      setCoppaTab(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [championsBracket.isLoading])

  const handleCalendario = (
    girone: number | undefined,
    isAttuale: boolean,
    onlyRecuperi: boolean,
    isChampions: boolean,
  ) => {
    setTitleModalCalendario(
      girone
        ? `Calendario girone ${girone}`
        : isAttuale
          ? `Calendario ultime partite`
          : isChampions
            ? `Calendario Champions`
            : `Calendario partite da recuperare`,
    )
    setGirone(girone)
    setIsCalendarioAttuale(isAttuale)
    setIsCalendarioRecuperi(onlyRecuperi)
    setIsChampions(isChampions)
    setOpenModalCalendario(true)
  }

  const handleModalClose = () => {
    setOpenModalCalendario(false)
  }

  return (
    <>
      <Grid container spacing={0}>
        <Slide direction={'down'} in={true}>
          <Grid item xs={12}>
            <Squadre />
          </Grid>
        </Slide>
        {!torneiList.isLoading && (
          <>
            {new Date() >= Configurazione.dataGiornata1SerieA && (
              <>
                <Grid item xs={12} sm={6} sx={!isXs ? { pt: '15px' } : {}}>
                  <Calendario
                    tipo={'risultati'}
                    prefixTitle="Risultati:"
                    enableTabs={true}
                  ></Calendario>
                  {stagionefinita ? (
                    <Box
                      sx={{
                        pt: '15px',
                        display: 'flex',
                        flexDirection: isXs ? 'column' : 'row',
                        gap: 2,
                      }}
                    >
                      <Box sx={{ flex: 1 }}>
                        <EconomiaPreviewCard />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <StatistichePreviewCard />
                      </Box>
                    </Box>
                  ) : (
                    <>
                      <Calendario
                        tipo={'prossima'}
                        prefixTitle=""
                        enableTabs={true}
                      ></Calendario>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          '& > *': { m: 1 },
                        }}
                      >
                        <CalendarioButtonGroup onSelect={handleCalendario} />
                      </Box>
                    </>
                  )}
                </Grid>
                <Grid
                  item
                  xs={12}
                  sm={6}
                  sx={!isXs ? { pr: '2px', pl: '15px', pt: '15px' } : {}}
                >
                  {(() => {
                    const classificheConHasClassifica = torneiList.data?.filter(
                      (t) => t.hasClassifica,
                    )
                    const classificheCampionato =
                      classificheConHasClassifica?.filter(
                        (t) => t.nome.toLowerCase() === 'campionato',
                      )
                    const classificheChampions =
                      classificheConHasClassifica?.filter(
                        (t) => t.nome.toLowerCase() !== 'campionato',
                      )

                    const renderClassifica = (
                      torneo: NonNullable<
                        typeof classificheConHasClassifica
                      >[0],
                    ) => (
                      <>
                        <br></br>
                        <Classifica
                          key={torneo.idTorneo}
                          nomeTorneo={torneo.nome ?? ''}
                          idTorneo={torneo.idTorneo}
                          gruppo={torneo.gruppoFase ?? ''}
                        />
                      </>
                    )

                    return (
                      <Box>
                        <Tabs
                          value={classificaTab}
                          onChange={(_, v: number) => setClassificaTab(v)}
                        >
                          <Tab label="Campionato" />
                          <Tab label="Champions" />
                        </Tabs>
                        {classificaTab === 0 &&
                          classificheCampionato?.map(renderClassifica)}
                        {classificaTab === 1 &&
                          classificheChampions?.map(renderClassifica)}
                        <br></br>
                        <Tabs
                          value={coppaTab}
                          onChange={(_, v: number) => setCoppaTab(v)}
                        >
                          <Tab
                            label="Fase finale Champions"
                            disabled={!hasSemifinaliTeams}
                          />
                          <Tab
                            label="Coppa Perdenti"
                            disabled={!hasSemifinaliTeamsCoppaPerdenti}
                          />
                        </Tabs>
                        {coppaTab === 0 && (
                          <>
                            <br></br>
                            <ChampionsBracket
                              semifinaliAndata={
                                championsBracket.data?.semifinaliAndata ?? null
                              }
                              semifinaliRitorno={
                                championsBracket.data?.semifinaliRitorno ?? null
                              }
                              finale={championsBracket.data?.finale ?? null}
                            />
                          </>
                        )}
                        {coppaTab === 1 && (
                          <>
                            <br></br>
                            <ChampionsBracket
                              semifinaliAndata={
                                coppaPerdentiBracket.data?.semifinaliAndata ?? null
                              }
                              semifinaliRitorno={
                                coppaPerdentiBracket.data?.semifinaliRitorno ?? null
                              }
                              finale={coppaPerdentiBracket.data?.finale ?? null}
                            />
                          </>
                        )}
                      </Box>
                    )
                  })()}
                </Grid>
              </>
            )}
          </>
        )}
      </Grid>

      <Modal
        title={titleModalCalendario}
        open={openModalCalendario}
        onClose={handleModalClose}
        width={isXs ? '98%' : '70%'}
        height={isXs ? '98%' : '500px'}
      >
        <Divider />
        <Box sx={{ mt: 1, gap: '0px', flexWrap: 'wrap' }}>
          <Grid container spacing={0} sx={{ gap: '0px' }}>
            {giornata?.map((g, index) => (
              <Grid
                item
                xs={12}
                sm={4}
                md={6}
                lg={4}
                key={`card_partite_${index}_${g.idCalendario}`}
                sx={{ ml: '0px' }}
              >
                <CardPartite
                  giornata={[g]}
                  prefixTitle={''}
                  maxWidth={isXs ? '100%' : '300px'}
                  withAvatar={false}
                ></CardPartite>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Modal>
    </>
  )
}
