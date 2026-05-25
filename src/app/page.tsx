'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { orpc } from '~/utils/orpc'
import {
  Box,
  Button,
  ButtonGroup,
  Card,
  CardActionArea,
  CardContent,
  Divider,
  Grid,
  Tab,
  Tabs,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  Slide,
} from '@mui/material'
import {
  AccessAlarm,
  EmojiEvents,
  Euro,
  Groups,
  Looks3Outlined,
  Looks4Outlined,
  Looks5Outlined,
  LooksOneOutlined,
  LooksTwoOutlined,
  PendingActions,
} from '@mui/icons-material'
import Classifica from '~/components/home/Classifica'
import ChampionsBracket from '~/components/home/ChampionsBracket'
import Squadre from '~/components/home/Squadre'
import Calendario from '~/components/home/Calendario'
import Modal from '~/components/modal/Modal'
import CardPartite from '~/components/cardPartite/CardPartite'
import { useSession } from 'next-auth/react'
import { z } from 'zod'
import { Configurazione } from '~/config'
import { giornataSchema } from '~/schemas/calendario'

export default function HomePage() {
  const { data: session } = useSession()
  const torneiList = useQuery(orpc.tornei.list.queryOptions({
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  }))
  const championsBracket = useQuery(orpc.tornei.championsBracket.queryOptions({
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  }))
  const prossimeGiornate = useQuery(orpc.calendario.getProssimeGiornate.queryOptions({
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  }))
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
  const stagionefinita =
    !prossimeGiornate.isLoading &&
    prossimeGiornate.isSuccess &&
    (prossimeGiornate.data?.length ?? 1) === 0
  const [championsTab, setChampionsTab] = useState(0)

  const calendarioList =
    girone && !isCalendarioAttuale && !isCalendarioRecuperi
      ? useQuery(orpc.calendario.listByGirone.queryOptions({
          input: girone,
          enabled: true,
          refetchOnWindowFocus: false,
          refetchOnReconnect: false,
        }))
      : isCalendarioAttuale
        ? useQuery(orpc.calendario.listAttuale.queryOptions({
            enabled: isCalendarioAttuale,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
          }))
        : isChampions
          ? useQuery(orpc.calendario.listByTorneo.queryOptions({
              input: [2, 3, 4, 5, 6],
              enabled: isChampions,
              refetchOnWindowFocus: false,
              refetchOnReconnect: false,
            }))
          : useQuery(orpc.calendario.listRecuperi.queryOptions({
              enabled: isCalendarioRecuperi,
              refetchOnWindowFocus: false,
              refetchOnReconnect: false,
            }))
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
      setChampionsTab(hasSemifinaliTeams ? 1 : 0)
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
                      <Card
                        component={Link}
                        href="/economia"
                        sx={{ flex: 1, textDecoration: 'none', color: 'inherit' }}
                      >
                        <CardActionArea sx={{ height: '100%' }}>
                          <CardContent>
                            <Euro sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6">Economia e premi</Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
                      <Card
                        component={Link}
                        href="/statistiche_squadre"
                        sx={{ flex: 1, textDecoration: 'none', color: 'inherit' }}
                      >
                        <CardActionArea sx={{ height: '100%' }}>
                          <CardContent>
                            <Groups sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                            <Typography variant="h6">Statistiche squadre</Typography>
                          </CardContent>
                        </CardActionArea>
                      </Card>
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
                        <ButtonGroup
                          size="small"
                          color="primary"
                          aria-label="Small button group"
                        >
                          <Tooltip title="Calendario partite ultimo periodo">
                            <Button
                              onClick={() =>
                                handleCalendario(undefined, true, false, false)
                              }
                              startIcon={<AccessAlarm color="error" />}
                            ></Button>
                          </Tooltip>
                          <Tooltip title="Calendario girone 1">
                            <Button
                              onClick={() =>
                                handleCalendario(1, false, false, false)
                              }
                              startIcon={<LooksOneOutlined />}
                            ></Button>
                          </Tooltip>
                          <Tooltip title="Calendario girone 2">
                            <Button
                              onClick={() =>
                                handleCalendario(2, false, false, false)
                              }
                              startIcon={<LooksTwoOutlined />}
                            >
                              &nbsp;
                            </Button>
                          </Tooltip>
                          <Tooltip title="Calendario girone 3">
                            <Button
                              onClick={() =>
                                handleCalendario(3, false, false, false)
                              }
                              startIcon={<Looks3Outlined />}
                            >
                              &nbsp;
                            </Button>
                          </Tooltip>
                          <Tooltip title="Calendario girone 4">
                            <Button
                              onClick={() =>
                                handleCalendario(4, false, false, false)
                              }
                              startIcon={<Looks4Outlined />}
                            >
                              &nbsp;
                            </Button>
                          </Tooltip>
                          <Tooltip title="Calendario girone 5">
                            <Button
                              onClick={() =>
                                handleCalendario(5, false, false, false)
                              }
                              startIcon={<Looks5Outlined />}
                            >
                              &nbsp;
                            </Button>
                          </Tooltip>
                          <Tooltip title="Calendario Champions">
                            <Button
                              onClick={() =>
                                handleCalendario(undefined, false, false, true)
                              }
                              startIcon={<EmojiEvents color="success" />}
                            >
                              &nbsp;
                            </Button>
                          </Tooltip>
                          <Tooltip title="Partite da recuperare">
                            <Button
                              onClick={() =>
                                handleCalendario(undefined, false, true, false)
                              }
                              startIcon={<PendingActions color="action" />}
                            ></Button>
                          </Tooltip>
                        </ButtonGroup>
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
                    const classificheCampionato = classificheConHasClassifica?.filter(
                      (t) => t.nome.toLowerCase() === 'campionato',
                    )
                    const classificheChampions = classificheConHasClassifica?.filter(
                      (t) => t.nome.toLowerCase() !== 'campionato',
                    )

                    const renderClassifica = (torneo: NonNullable<typeof classificheConHasClassifica>[0]) => (
                      <>
                        <Classifica
                          key={torneo.idTorneo}
                          nomeTorneo={torneo.nome ?? ''}
                          idTorneo={torneo.idTorneo}
                          gruppo={torneo.gruppoFase ?? ''}
                        />
                        <br></br>
                      </>
                    )

                    return (
                      <>
                        {classificheCampionato?.map(renderClassifica)}
                        <Tabs
                          value={championsTab}
                          onChange={(_, v: number) => setChampionsTab(v)}
                        >
                          <Tab label="Classifica Champions" />
                          <Tab
                            label="Fase finale"
                            disabled={!hasSemifinaliTeams}
                          />
                        </Tabs>
                        {championsTab === 0 && (
                          <><br></br>{classificheChampions?.map(renderClassifica)}</>
                        )}
                        {championsTab === 1 && (
                          <>
                            <ChampionsBracket
                              semifinaliAndata={
                                championsBracket.data?.semifinaliAndata ?? null
                              }
                              semifinaliRitorno={
                                championsBracket.data?.semifinaliRitorno ?? null
                              }
                              finale={championsBracket.data?.finale ?? null}
                            />
                            <br />
                          </>
                        )}
                      </>
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
