import { adminProcedure } from '~/server/orpc'
import { tabellinoInputSchema } from '~/schemas/risultati'
import { getTabellino } from '../../../utils/common'
import { Configurazione } from '~/config'
import { getFormazione } from '../services/partiteMapping'
import { calcolaFantapunti } from '~/server/services/tabelliniService'

export const getTabellinoORPCProcedure = adminProcedure
  .route({ method: 'GET', path: '/risultati/getTabellino', summary: 'Tabellino di una squadra per partita' })
  .input(tabellinoInputSchema)
  .handler(async ({ input }) => {
    try {
      if (input.idSquadra) {
        const resultFormazione = await getFormazione(
          input.idPartita,
          input.idSquadra,
        )
        if (resultFormazione) {
          const giocatoriInfluenti = await getTabellino(
            resultFormazione.idFormazione,
          )
          if (giocatoriInfluenti) {
            const risultato = calcolaFantapunti(
              giocatoriInfluenti,
              resultFormazione.modulo,
              false,
            )
            return {
              idPartita: input.idPartita,
              idSquadra: input.idSquadra,
              fantapunti: risultato.fantapuntiBase,
              fattoreCasalingo: Configurazione.bonusFattoreCasalingo,
              bonusModulo: risultato.bonusModulo,
              giocatoriInfluenti: risultato.giocatoriInfluentiCount,
              bonusSenzaVoto: risultato.bonusSenzaVoto,
              golSegnati: risultato.golSegnati,
            }
          }
        } else {
          const msg = `Nessuna formazione per la partita: ${input.idPartita} e l'idsquadra: ${input.idSquadra}`
          console.info(msg)
          return msg
        }
      } else {
        const msg = `Nessuna squadra assegnata alla partita: ${input.idPartita}`
        console.warn(msg)
        return msg
      }
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
