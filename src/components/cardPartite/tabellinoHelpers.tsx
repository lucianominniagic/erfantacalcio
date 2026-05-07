import { Theme } from '@mui/material'
import { Typography } from '@mui/material'
import React from 'react'

export interface Tabellino {
  dataOra: Date
  modulo: string
  idSquadra: number
  fattoreCasalingo: number
  bonusModulo: number
  bonusSenzaVoto: number
  fantapunti: number
  golSegnati: number
  fantapuntiTotale: number
  Voti: {
    nomeSquadraSerieA?: string
    magliaSquadraSerieA?: string
    nome: string
    idGiocatore: number
    ruolo: string
    riserva: number | null
    titolare: boolean
    voto: number
    gol: number
    assist: number
    autogol: number
    altriBonus: number
    ammonizione: number
    espulsione: number
    votoBonus: number
    isSostituito: boolean
    isVotoInfluente: boolean
  }[]
}

export function getColorByRuolo(ruolo: string, theme: Theme): string | undefined {
  return theme.palette.ruolo[ruolo as keyof typeof theme.palette.ruolo]
}

export function getVotoBonus(
  voto: number,
  gol: number,
  assist: number,
  autogol: number,
  altriBonus: number,
) {
  return (
    <Typography variant="body2">
      {voto !== 0 ? voto : ''}
      {gol > 0 ? `+${gol}` : ''}
      {gol < 0 ? `${gol}` : ''}
      {assist > 0 ? `+${assist}` : ''}
      {autogol < 0 ? `+${autogol}` : ''}
      {altriBonus !== 0 ? `+${altriBonus}` : ''}
    </Typography>
  )
}
