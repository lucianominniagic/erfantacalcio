import { z } from 'zod'
import { adminProcedure } from '~/server/api/trpc'
import {
  getTabellino,
  getGiocatoriVotoInfluente,
  getBonusModulo,
  getBonusSenzaVoto,
  getGolSegnati,
} from '../../../utils/common'
import { Configurazione } from '~/config'
import { getFormazione } from '../services/partiteMapping'

export const getTabellinoProcedure = adminProcedure
  .input(z.object({ idPartita: z.number(), idSquadra: z.number().nullable() }))
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
            const fantapunti = getGiocatoriVotoInfluente(
              giocatoriInfluenti,
            ).reduce((acc, cur) => acc + (cur.votoBonus ?? 0), 0)
            return {
              idPartita: opts.input.idPartita,
              idSquadra: opts.input.idSquadra,
              fantapunti,
              fattoreCasalingo: Configurazione.bonusFattoreCasalingo,
              bonusModulo: getBonusModulo(resultFormazione.modulo),
              giocatoriInfluenti:
                getGiocatoriVotoInfluente(giocatoriInfluenti).length,
              bonusSenzaVoto: getBonusSenzaVoto(
                getGiocatoriVotoInfluente(giocatoriInfluenti).length,
              ),
              golSegnati: getGolSegnati(fantapunti),
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
