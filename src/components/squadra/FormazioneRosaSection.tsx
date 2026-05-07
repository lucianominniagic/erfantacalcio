'use client'
import {
  Analytics,
  SportsSoccer,
  ThumbDownTwoTone,
  ThumbsUpDownTwoTone,
  ThumbUpAltTwoTone,
} from '@mui/icons-material'
import {
  Box,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  Typography,
} from '@mui/material'
import React from 'react'
import { type z } from 'zod'
import { type giornataSchema } from '~/schemas/calendario'
import { type GiocatoreFormazioneType } from '~/types/squadre'
import { getShortName } from '~/utils/helper'
import { getMatch } from './utils'

interface FormaData {
  media: number | null
  giocate: number
}

interface Props {
  roles: string[]
  title: string
  rosa: GiocatoreFormazioneType[]
  campo: GiocatoreFormazioneType[]
  panca: GiocatoreFormazioneType[]
  filterIcons: React.ReactNode[]
  giornate: z.infer<typeof giornataSchema>[]
  handleClickPlayer: (player: GiocatoreFormazioneType) => void
  setIdGiocatoreStat: (id: number) => void
  setOpenModalCalendario: (open: boolean) => void
  formaMap: Map<number, FormaData>
}

export function FormazioneRosaSection({
  roles,
  title,
  rosa,
  campo,
  panca,
  filterIcons,
  giornate,
  handleClickPlayer,
  setIdGiocatoreStat,
  setOpenModalCalendario,
  formaMap,
}: Props) {
  const mergedPlayers = [
    ...rosa
      .filter((p) => roles.includes(p.ruolo))
      .map((p) => ({ ...p, status: 'rosa' as const })),
    ...campo
      .filter((p) => roles.includes(p.ruolo))
      .map((p) => ({ ...p, status: 'campo' as const })),
    ...panca
      .filter((p) => roles.includes(p.ruolo))
      .map((p) => ({ ...p, status: 'panca' as const })),
  ]

  const renderFormaIcon = (idGiocatore: number) => {
    const forma = formaMap.get(idGiocatore)
    if (!forma) return null

    const { media, giocate } = forma

    if (giocate < 2 || media === null) {
      return (
        <Tooltip title="Dati insufficienti">
          <span>
            <IconButton disabled size="small" />
          </span>
        </Tooltip>
      )
    }

    if (media < 6) {
      return (
        <Tooltip title={`Forma: ${media}`}>
          <IconButton size="small">
            <ThumbDownTwoTone color="error" />
          </IconButton>
        </Tooltip>
      )
    }

    if (media <= 6.5) {
      return (
        <Tooltip title={`Forma: ${media}`}>
          <IconButton size="small">
            <ThumbsUpDownTwoTone color="warning" />
          </IconButton>
        </Tooltip>
      )
    }

    return (
      <Tooltip title={`Forma: ${media}`}>
        <IconButton size="small">
          <ThumbUpAltTwoTone color="success" />
        </IconButton>
      </Tooltip>
    )
  }

  const renderStatusIcon = (
    player: GiocatoreFormazioneType & { status: 'rosa' | 'campo' | 'panca' },
  ) => {
    if (player.status === 'campo') {
      return (
        <Tooltip title="Titolare">
          <IconButton>
            <SportsSoccer color="success" />
          </IconButton>
        </Tooltip>
      )
    }
    if (player.status === 'panca') {
      return (
        <Tooltip title={`Riserva ${player.riserva}`}>
          <IconButton>{filterIcons[(player.riserva ?? 7) - 1]}</IconButton>
        </Tooltip>
      )
    }
    return null
  }

  return (
    <Grid item xs={12} md={6}>
      <Box>
        <Typography variant="h5">{title}</Typography>
        <List sx={{ bgcolor: 'background.paper' }}>
          {mergedPlayers.map((player) => (
            <Grid container spacing={0} key={player.idGiocatore}>
              <Grid item xs={9}>
                <div onClick={() => handleClickPlayer(player)}>
                  <ListItem
                    sx={{
                      cursor: 'pointer',
                      zIndex: 2,
                      paddingTop: '0px',
                      paddingBottom: '0px',
                      paddingLeft: '0px',
                    }}
                  >
                    <img
                      src={player.urlCampioncinoSmall}
                      width={42}
                      height={42}
                      alt={player.nomeSquadraSerieA ?? ''}
                      title={player.nomeSquadraSerieA ?? ''}
                    />
                    <ListItemText
                      primary={getShortName(player.nome)}
                      secondary={`(${player.nomeSquadraSerieA
                        ?.toUpperCase()
                        .substring(0, 3)}) - ${getMatch(giornate[0], player, false)}`}
                    />
                  </ListItem>
                </div>
              </Grid>
              <Grid item xs={3} display="flex" justifyContent="flex-end">
                {renderStatusIcon(player)}
                  <IconButton
                    onClick={() => {
                      setIdGiocatoreStat(player.idGiocatore)
                      setOpenModalCalendario(true)
                    }}
                  >
                    {renderFormaIcon(player.idGiocatore)}
                  </IconButton>
              </Grid>
            </Grid>
          ))}
        </List>
      </Box>
    </Grid>
  )
}
