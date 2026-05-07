'use client'
import { Avatar, Grid, Typography } from '@mui/material'
import { Configurazione } from '~/config'
import { magliaType, toShirtTemplate } from '../selectColors'
import { ShirtSVG } from '../selectColors/shirtSVG'
import { GenericCard } from '~/components/cards'
import { TabellinoVotiList } from './TabellinoVotiList'
import type { Tabellino } from './tabellinoHelpers'

interface TabellinoCardProps {
  tabellino?: Tabellino
  squadra?: string | null
  foto?: string | null
  maglia?: magliaType | null
  multa?: boolean
  onStatGiocatore: (idGiocatore: number) => void
}

export function TabellinoCard({
  tabellino,
  squadra,
  foto,
  maglia,
  multa,
  onStatGiocatore,
}: TabellinoCardProps) {
  if (!tabellino) return null

  return (
    <GenericCard
      title={
        <Grid container spacing={0}>
          <Grid item xs={11}>
            {squadra}
          </Grid>
          <Grid item xs={1} display={'flex'} justifyContent={'flex-end'}>
            <Typography variant={'h4'} sx={{ m: '1px' }}>
              <b>{tabellino.golSegnati}</b>
            </Typography>
          </Grid>
        </Grid>
      }
      titleVariant="h5"
      subtitle={`Modulo: ${tabellino.modulo} ${
        multa ? `multa di ${Configurazione.importoMulta} €` : ''
      }`}
      avatar={
        <Avatar
          alt={squadra ?? ''}
          src={foto ?? ''}
          sx={{ display: { xs: 'none', sm: 'block' }, mr: '5px' }}
        />
      }
    >
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
        <Grid item xs={12} sm={8}>
          <Typography variant={'h6'} sx={{ m: '5px' }}>
            <b>Titolari</b>
          </Typography>
        </Grid>
        <Grid item sm={4} sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Typography variant={'h6'} sx={{ m: '5px' }}>
            <b>Panchina</b>
          </Typography>
        </Grid>

        <TabellinoVotiList voti={tabellino.Voti} onStatGiocatore={onStatGiocatore} />

        <Grid item xs={12} sm={4} display={'flex'}>
          <Typography variant={'h6'} sx={{ m: '5px' }}>
            Fantapunti: <b>{tabellino.fantapuntiTotale}</b>
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant={'h6'} sx={{ m: '5px' }}>
            {tabellino.fattoreCasalingo > 0 ? (
              <>
                Fattore casalingo: <b>+{tabellino.fattoreCasalingo}</b>
              </>
            ) : (
              <>&nbsp;</>
            )}
          </Typography>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Typography variant={'h6'} sx={{ m: '5px' }}>
            {tabellino.bonusSenzaVoto > 0 && (
              <>
                Senza voto: <b>+{tabellino.bonusSenzaVoto}</b>
              </>
            )}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant={'h6'} sx={{ m: '5px' }}>
            {tabellino.bonusModulo > 0 && (
              <>
                Bonus modulo: <b>+{tabellino.bonusModulo}</b>
              </>
            )}
          </Typography>
        </Grid>
      </Grid>
    </GenericCard>
  )
}
