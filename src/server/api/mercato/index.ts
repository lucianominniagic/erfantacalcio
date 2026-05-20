import { createTRPCRouter } from '~/server/api/trpc'
import { createSessioneProcedure } from './procedures/createSessione'
import { listSessioniProcedure } from './procedures/listSessioni'
import { getProposteSessioneProcedure } from './procedures/getProposteSessione'
import { getSessioneAttivaProcedure } from './procedures/getSessioneAttiva'
import { getGiocatoriSvincolatiProcedure } from './procedures/getGiocatoriSvincolati'
import { getMieProposteProcedure } from './procedures/getMieProposte'
import { createPropostaProcedure } from './procedures/createProposta'
import { deletePropostaProcedure } from './procedures/deleteProposta'
import { getSessioniMercatoProcedure } from './procedures/getSessioniMercato'

export const mercatoRouter = createTRPCRouter({
  createSessione: createSessioneProcedure,
  listSessioni: listSessioniProcedure,
  getProposteSessione: getProposteSessioneProcedure,
  getSessioneAttiva: getSessioneAttivaProcedure,
  getGiocatoriSvincolati: getGiocatoriSvincolatiProcedure,
  getMieProposte: getMieProposteProcedure,
  createProposta: createPropostaProcedure,
  deleteProposta: deletePropostaProcedure,
  getSessioniMercato: getSessioniMercatoProcedure,
})
