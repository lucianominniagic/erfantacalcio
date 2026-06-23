import { z } from 'zod'
import { eventIterator } from '@orpc/contract'
import { adminProcedure } from '~/server/orpc'
import { importaVotiGiornata } from '../services/importaVotiService'

const importaVotiEventSchema = z.discriminatedUnion('step', [
  z.object({ step: z.literal('upload'), progress: z.number() }),
  z.object({ step: z.literal('reset'), progress: z.number() }),
  z.object({ step: z.literal('read'), progress: z.number() }),
  z.object({ step: z.literal('process'), progress: z.number() }),
  z.object({ step: z.literal('stats'), ruolo: z.string(), progress: z.number() }),
  z.object({ step: z.literal('done'), progress: z.number(), fileUrl: z.string() }),
])

export const importaVotiGiornataORPCProcedure = adminProcedure
  .route({
    method: 'POST',
    path: '/voti/importaVotiGiornata',
    summary: 'Importa voti CSV per una giornata — upload, reset, parse, upsert, refresh stats (SSE streaming)',
  })
  .input(
    z.object({
      idCalendario: z.number(),
      fileName: z.string(),
      fileData: z.string(),
    }),
  )
  .output(eventIterator(importaVotiEventSchema))
  .handler(async function* ({ input }) {
    yield* importaVotiGiornata(input)
  })
