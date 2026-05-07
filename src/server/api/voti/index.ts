import { createTRPCRouter } from '~/server/api/trpc'
import _ from 'lodash'
import { processVotiProcedure } from './procedures/processVoti'
import { showVotoProcedure } from './procedures/show'
import { listVotiProcedure } from './procedures/list'
import { showStatisticaVotiProcedure } from './procedures/showStatisticaVoti'
import { updateVotoProcedure } from './procedures/updateVoto'
import { uploadVotiProcedure } from './procedures/uploadVoti'
import { uploadVotiVercelProcedure } from './procedures/uploadVotiVercel'
import { resetVotiProcedure } from './procedures/resetVoti'
import { readVotiProcedure } from './procedures/readVoti'
import { refreshStatsProcedure } from './procedures/refreshStats'

export const votiRouter = createTRPCRouter({
  get: showVotoProcedure,
  list: listVotiProcedure,
  getStatisticaVoti: showStatisticaVotiProcedure,
  update: updateVotoProcedure,
  upload: uploadVotiProcedure,
  uploadVercel: uploadVotiVercelProcedure,
  resetVoti: resetVotiProcedure,
  readVoti: readVotiProcedure,
  processVoti: processVotiProcedure,
  refreshStats: refreshStatsProcedure,
})
