import { createTRPCRouter } from '~/server/api/trpc'
import { createOrUpdatePlayer } from './procedures/createOrUpdatePlayer'
import { removeGiocatore } from './procedures/removeGiocatore'
import { showAll } from './procedures/showAll'
import { searchByName } from './procedures/searchByName'
import { listStatistiche } from './procedures/listStatistiche'
import { show } from './procedures/show'
import { listStatisticheSquadra } from './procedures/listStatisticheSquadra'
import { showStatistica } from './procedures/showStatistica'

export const giocatoriRouter = createTRPCRouter({
  upsert: createOrUpdatePlayer,
  delete: removeGiocatore,
  get: show,
  listAll: showAll,
  search: searchByName,
  listStatistiche: listStatistiche,
  listStatisticheSquadra: listStatisticheSquadra,
  getStatistica: showStatistica,
})
