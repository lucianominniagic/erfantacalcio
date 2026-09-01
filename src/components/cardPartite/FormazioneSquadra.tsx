'use client'
import {
  Avatar,
  Grid,
  Tooltip,
  Typography,
} from '@mui/material'
import Image from 'next/image'
import { Fragment } from 'react'
import { formatDateFromIso } from '~/utils/dateUtils'
import { Configurazione } from '~/config'
import { toShirtTemplate } from '../selectColors'
import { ShirtSVG } from '../selectColors/shirtSVG'
import { GenericCard } from '~/components/cards'
import type { MagliaType } from '~/schemas/maglia'
import { magliaRichiedeSfondoBianco } from '~/utils/maglia'

interface FormazioneVoto {
  titolare: boolean
  riserva: number | null
  Giocatore: {
    idGiocatore: number
    nome: string
    ruolo: string
    Trasferimenti: {
      SquadraSerieA?: {
        nome?: string
        maglia?: string
      } | null
    }[]
  }
}

interface FormazioneData {
  dataOra: Date
  modulo: string
  Voti: FormazioneVoto[]
}

interface FormazioneSquadraProps {
  squadra?: string | null
  foto?: string | null
  maglia?: MagliaType | null
  formazione?: FormazioneData | null
  onStatGiocatore: (idGiocatore: number) => void
}

export function FormazioneSquadra({
  squadra,
  foto,
  maglia,
  formazione,
  onStatGiocatore,
}: FormazioneSquadraProps) {
  return (
    <GenericCard
      title={squadra}
      titleVariant="h4"
      subtitle={
        formazione
          ? formatDateFromIso(formazione.dataOra.toString(), 'DD-MM-YYYY HH:mm')
          : `Formazione non rilasciata, multa di ${Configurazione.importoMulta} €`
      }
      avatar={
        <Avatar
          alt={squadra ?? ''}
          src={foto ?? ''}
          sx={{ display: { xs: 'none', sm: 'block' }, mr: '5px' }}
        />
      }
    >
      {formazione && (
        <Grid container spacing={0}>
          {maglia && (
            <Grid item xs={12} justifyContent={'center'} display={'flex'}>
              <ShirtSVG
                template={toShirtTemplate(maglia.selectedTemplate)}
                mainColor={maglia.mainColor}
                secondaryColor={maglia.secondaryColor}
                thirdColor={maglia.thirdColor}
                textColor={maglia.textColor}
                size={100}
                number={maglia.shirtNumber}
              />
            </Grid>
          )}
          <Grid item xs={12} sm={7}>
            <Typography variant={'h6'} sx={{ m: '3px' }}>
              <b>Modulo: {formazione.modulo}</b>
            </Typography>
          </Grid>
          <Grid item sm={5} sx={{ display: { xs: 'none', sm: 'block' } }}>
            <Typography variant={'h6'}>
              <b>Panchina</b>
            </Typography>
          </Grid>

          {/* Titolari */}
          <Grid item xs={12} sm={7}>
            <Grid container spacing={0}>
              {formazione.Voti.filter((g) => g.titolare).map((g) => (
                <Fragment key={g.Giocatore.idGiocatore}>
                  <Grid item xs={2} sm={1}>
                    <Tooltip title={g.Giocatore.Trasferimenti[0]?.SquadraSerieA?.nome}>
                      <Image
                        src={`/images/maglie/${
                          g.Giocatore.Trasferimenti[0]?.SquadraSerieA?.maglia ?? 'NoSerieA.gif'
                        }`}
                        width={26}
                        height={22}
                        alt={g.Giocatore.nome}
                        style={{
                          backgroundColor: magliaRichiedeSfondoBianco(
                            g.Giocatore.Trasferimenti[0]?.SquadraSerieA?.maglia,
                          )
                            ? '#fff'
                            : undefined,
                        }}
                      />
                    </Tooltip>
                  </Grid>
                  <Grid item xs={2} sm={1}>
                    <Typography variant="body2">{g.Giocatore.ruolo}</Typography>
                  </Grid>
                  <Grid item xs={8} sm={10}>
                    <Typography
                      variant="body2"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => onStatGiocatore(g.Giocatore.idGiocatore)}
                    >
                      {g.Giocatore.nome}
                    </Typography>
                  </Grid>
                </Fragment>
              ))}
            </Grid>
          </Grid>

          {/* Panchina label mobile */}
          <Grid item xs={12} sx={{ display: { xs: 'block', sm: 'none' } }}>
            <Typography variant={'h6'}>
              <b>Panchina</b>
            </Typography>
          </Grid>

          {/* Riserve */}
          <Grid item xs={12} sm={5}>
            <Grid container spacing={0}>
              {formazione.Voti.filter((g) => !g.titolare).map((g) => (
                <Fragment key={g.Giocatore.idGiocatore}>
                  <Grid item xs={2} sm={2}>
                    <Tooltip title={g.Giocatore.Trasferimenti[0]?.SquadraSerieA?.nome}>
                      <Image
                        src={`/images/maglie/${
                          g.Giocatore.Trasferimenti[0]?.SquadraSerieA?.maglia ?? 'NoSerieA.gif'
                        }`}
                        width={26}
                        height={22}
                        alt={g.Giocatore.nome}
                        style={{
                          backgroundColor: magliaRichiedeSfondoBianco(
                            g.Giocatore.Trasferimenti[0]?.SquadraSerieA?.maglia,
                          )
                            ? '#fff'
                            : undefined,
                        }}
                      />
                    </Tooltip>
                  </Grid>
                  <Grid item xs={2} sm={2}>
                    <Typography variant="body2">
                      {g.Giocatore.ruolo} ({g.riserva})
                    </Typography>
                  </Grid>
                  <Grid item xs={8} sm={8}>
                    <Typography
                      variant="body2"
                      sx={{ cursor: 'pointer' }}
                      onClick={() => onStatGiocatore(g.Giocatore.idGiocatore)}
                    >
                      {g.Giocatore.nome}
                    </Typography>
                  </Grid>
                </Fragment>
              ))}
            </Grid>
          </Grid>
        </Grid>
      )}
    </GenericCard>
  )
}
