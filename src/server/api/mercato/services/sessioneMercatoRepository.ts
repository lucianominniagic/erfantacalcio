/**
 * SessioneMercato repository — stato e query di base per le sessioni di mercato.
 *
 * Centralizza il tipo `StatoSessione`, la derivazione dello stato da date,
 * e la query canonica "trova la sessione attiva adesso".
 *
 * Era disperso in `mercatoService.ts` (privato) e `listSessioni.orpc.ts` (duplicato).
 */

import { LessThanOrEqual, MoreThanOrEqual } from 'typeorm'
import { SessioneMercato } from '~/server/db/entities'

export type StatoSessione = 'futura' | 'attiva' | 'chiusa'

export function calcolaStato(sessione: SessioneMercato, now: Date): StatoSessione {
  if (sessione.dataApertura > now) return 'futura'
  if (sessione.dataChiusura < now) return 'chiusa'
  return 'attiva'
}

/**
 * Restituisce la sessione di mercato attualmente aperta (dataApertura ≤ now ≤ dataChiusura),
 * o `null` se non esiste.
 */
export async function findSessioneAttiva(): Promise<SessioneMercato | null> {
  return SessioneMercato.findOne({
    where: {
      dataApertura: LessThanOrEqual(new Date()),
      dataChiusura: MoreThanOrEqual(new Date()),
    },
    order: { id: 'DESC' },
  })
}
