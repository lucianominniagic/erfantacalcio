import { TRPCError } from '@trpc/server'
import { adminProcedure } from '~/server/api/trpc'
import { createSessioneSchema } from '~/schemas/mercato'
import { SessioneMercato } from '~/server/db/entities'

export const createSessioneProcedure = adminProcedure
  .input(createSessioneSchema)
  .mutation(async ({ input }) => {
    const now = new Date()

    // Verifica: nessuna sessione attiva sovrapposta
    const esistente = await SessioneMercato.find({
      order: { id: 'DESC' },
    })

    if (esistente) {
      const start = esistente.dataApertura
      const end = esistente.dataChiusura
      const inputStart = new Date(input.dataApertura)
      const inputEnd = new Date(input.dataChiusura)

      // Sovrapposizione: sessione esistente futura o attiva
      const isAttiva = start <= now && end >= now
      const isFutura = start > now

      if (isAttiva || isFutura) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Esiste già una sessione attiva o futura',
        })
      }

      // Controllo sovrapposizione date
      if (inputStart <= end && inputEnd >= start) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Le date si sovrappongono a una sessione esistente',
        })
      }
    }

    const sessione = SessioneMercato.create({
      dataApertura: new Date(input.dataApertura),
      dataChiusura: new Date(input.dataChiusura),
      maxProposte: input.maxProposte,
      tipoValuta: input.tipoValuta,
    })

    return await SessioneMercato.save(sessione)
  })
