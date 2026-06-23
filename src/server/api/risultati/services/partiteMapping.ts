import { Configurazione } from '~/config'
import { getTabellino } from '~/server/services/tabelliniService'
import { Formazioni, Partite } from '~/server/db/entities'
import { calcolaFantapunti } from '~/server/services/tabelliniService'

export async function getFormazione(idPartita: number, idSquadra: number) {
  const formazioni = await Formazioni.find({
    select: { idFormazione: true, modulo: true },
    where: { idPartita, idSquadra },
  })
  return formazioni.length > 0 ? formazioni[0] : null
}

export function mapPartite(
  partite: Partite[],
  includeTabellini: boolean,
  backOfficeMode: boolean,
) {
  return Promise.all(
    partite.map(async (p) => {
      console.info(`IdPartita: ${p.idPartita}`)

      const formazioneHome = await getFormazione(p.idPartita, p.idSquadraH ?? 0)
      const formazioneAway = await getFormazione(p.idPartita, p.idSquadraA ?? 0)
      const tabellinoHome =
        includeTabellini && formazioneHome?.idFormazione
          ? await getTabellino(formazioneHome?.idFormazione)
          : []
      const tabellinoAway =
        includeTabellini && formazioneAway?.idFormazione
          ? await getTabellino(formazioneAway?.idFormazione)
          : []

      const risultatoHome = includeTabellini
        ? calcolaFantapunti(tabellinoHome, formazioneHome?.modulo ?? '', p.fattoreCasalingo ?? false)
        : null

      const risultatoAway = includeTabellini
        ? calcolaFantapunti(tabellinoAway, formazioneAway?.modulo ?? '', false)
        : null

      return {
        idPartita: p.idPartita,
        escludi: false,
        idFormazioneHome: formazioneHome?.idFormazione,
        idHome: p.idSquadraH,
        isFattoreHome: p.fattoreCasalingo,
        fattoreCasalingo: Configurazione.bonusFattoreCasalingo,
        squadraHome: p.SquadraHome?.nomeSquadra,
        fotoHome: p.SquadraHome?.foto,
        multaHome: p.hasMultaH,
        golHome: p.golH,
        tabellinoHome: tabellinoHome,
        bonusModuloHome: risultatoHome?.bonusModulo ?? 0,
        bonusSenzaVotoHome: risultatoHome?.bonusSenzaVoto ?? 0,
        fantapuntiHome: risultatoHome?.fantapuntiBase ?? 0,
        calcoloGolSegnatiHome: backOfficeMode ? (risultatoHome?.golSegnati ?? 0) : 0,
        totaleFantapuntiHome: risultatoHome?.fantapuntiTotale ?? 0,
        idFormazioneAway: formazioneAway?.idFormazione,
        idAway: p.idSquadraA,
        squadraAway: p.SquadraAway?.nomeSquadra,
        fotoAway: p.SquadraAway?.foto,
        multaAway: p.hasMultaA,
        golAway: p.golA,
        tabellinoAway: tabellinoAway,
        bonusModuloAway: risultatoAway?.bonusModulo ?? 0,
        bonusSenzaVotoAway: risultatoAway?.bonusSenzaVoto ?? 0,
        fantapuntiAway: risultatoAway?.fantapuntiBase ?? 0,
        calcoloGolSegnatiAway: backOfficeMode ? (risultatoAway?.golSegnati ?? 0) : 0,
        totaleFantapuntiAway: risultatoAway?.fantapuntiTotale ?? 0,
      }
    }),
  )
}
