import { createTRPCRouter } from '~/server/api/trpc'

import { squadreRouter } from './squadre'
import { calendarioRouter } from './calendario'
import { formazioneRouter } from './formazione'
import { profiloRouter } from './profilo'
import { squadreSerieARouter } from './squadreSerieA'
import { torneiRouter } from './tornei'
import { giocatoriRouter } from './giocatori'
import { votiRouter } from './voti'
import { nuovastagioneRouter } from './nuovastagione'
import { trasferimentiRouter } from './trasferimenti'
import { risultatiRouter } from './risultati'
import { partitaRouter } from './partita'
import { alboRouter } from './albo'
import { classificaRouter } from './classifica'
import { statisticheSquadreRouter } from './statisticheSquadre'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  albo: alboRouter,
  calendario: calendarioRouter,
  classifica: classificaRouter,
  formazione: formazioneRouter,
  partita: partitaRouter,
  giocatori: giocatoriRouter,
  profilo: profiloRouter,
  squadre: squadreRouter,
  squadreSerieA: squadreSerieARouter,
  tornei: torneiRouter,
  voti: votiRouter,
  nuovaStagione: nuovastagioneRouter,
  trasferimenti: trasferimentiRouter,
  risultati: risultatiRouter,
  statisticheSquadre: statisticheSquadreRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
