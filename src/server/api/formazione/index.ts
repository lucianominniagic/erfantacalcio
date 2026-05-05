import { createTRPCRouter } from '~/server/api/trpc'

import { giornateDaGiocare } from './procedures/giornateDaGiocare'
import { show } from './procedures/show'
import { create } from './procedures/create'
import { confirmPrecedente } from './procedures/confirmPrecedente'

export const formazioneRouter = createTRPCRouter({
  getGiornateDaGiocare: giornateDaGiocare,
  get: show,
  create: create,
  confirmPrecedente: confirmPrecedente,
})
