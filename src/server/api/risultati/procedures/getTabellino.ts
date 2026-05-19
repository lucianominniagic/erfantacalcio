import { adminProcedure } from '~/server/api/trpc'
import { tabellinoInputSchema } from '~/schemas/risultati'
import { getTabellino } from '../../../utils/common'
import { Configurazione } from '~/config'
import { getFormazione } from '../services/partiteMapping'
import { calcolaFantapunti } from '~/server/services/tabelliniService'

export const getTabellinoProcedure = adminProcedure
  .input(tabellinoInputSchema)
  .query(async (opts) => {
    try {
      if (opts.input.idSquadra) {
        const resultFormazione = await getFormazione(
          opts.input.idPartita,
          opts.input.idSquadra,
        )
        if (resultFormazione) {
          const giocatoriInfluenti = await getTabellino(
            resultFormazione.idFormazione,
          )
          if (giocatoriInfluenti) {
            const risultato = calcolaFantapunti(
              giocatoriInfluenti,
              resultFormazione.modulo,
              false, // questa procedura non conosce home/away — fattoreCasalingo gestito lato frontend
            )
            return {
              idPartita: opts.input.idPartita,
              idSquadra: opts.input.idSquadra,
              fantapunti: risultato.fantapuntiBase,
              fattoreCasalingo: Configurazione.bonusFattoreCasalingo, // costante per il frontend
              bonusModulo: risultato.bonusModulo,
              giocatoriInfluenti: risultato.giocatoriInfluentiCount,
              bonusSenzaVoto: risultato.bonusSenzaVoto,
              golSegnati: risultato.golSegnati,
            }
          }
        } else {
          const msg = `Nessuna formazione per la partita: ${opts.input.idPartita} e l'idsquadra: ${opts.input.idSquadra}`
          console.info(msg)
          return msg
        }
      } else {
        const msg = `Nessuna squadra assegnata alla partita: ${opts.input.idPartita}`
        console.warn(msg)
        return msg
      }
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
