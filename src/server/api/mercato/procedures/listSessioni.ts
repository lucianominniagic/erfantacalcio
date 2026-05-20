import { adminProcedure } from '~/server/api/trpc'
import { SessioneMercato } from '~/server/db/entities'

type StatoSessione = 'futura' | 'attiva' | 'chiusa'

function calcolaStato(sessione: SessioneMercato, now: Date): StatoSessione {
  if (sessione.dataApertura > now) return 'futura'
  if (sessione.dataChiusura < now) return 'chiusa'
  return 'attiva'
}

export const listSessioniProcedure = adminProcedure.query(async () => {
  const sessioni = await SessioneMercato.find({ order: { id: 'DESC' } }
  )
  const now = new Date()

  return sessioni.map((s) => ({
    id: s.id,
    dataApertura: s.dataApertura,
    dataChiusura: s.dataChiusura,
    maxProposte: s.maxProposte,
    tipoValuta: s.tipoValuta,
    stato: calcolaStato(s, now),
  }))
})
