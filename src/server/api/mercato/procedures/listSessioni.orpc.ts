import { adminProcedure } from '~/server/orpc'
import { SessioneMercato } from '~/server/db/entities'
import { calcolaStato } from '../services/sessioneMercatoRepository'

export const listSessioniORPCProcedure = adminProcedure
  .route({ method: 'GET', path: '/mercato/listSessioni', summary: 'Lista sessioni di mercato (admin)' })
  .handler(async () => {
    const sessioni = await SessioneMercato.find({ order: { id: 'DESC' } })
    const now = new Date()

    return sessioni.map((s) => ({
      id: s.id,
      dataApertura: s.dataApertura,
      dataChiusura: s.dataChiusura,
      maxProposte: s.maxProposte,
      acquistiEffettivi: s.acquistiEffettivi,
      tipoValuta: s.tipoValuta,
      stato: calcolaStato(s, now),
    }))
  })
