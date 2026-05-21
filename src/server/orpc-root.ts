/**
 * oRPC root router — equivalente di src/server/api/root.ts (tRPC)
 *
 * Aggiungi qui nuovi router oRPC man mano che la migrazione avanza.
 * Ogni entry corrisponde a un dominio (es. classifica, formazione, …).
 *
 * NON usare createTRPCRouter — questo oggetto è un plain TypeScript object.
 */
import { listAlboORPCProcedure } from '~/server/api/albo/procedures/list.orpc'
import { getAlboORPCProcedure } from '~/server/api/albo/procedures/get.orpc'
import { listClassificaORPCProcedure } from '~/server/api/classifica/procedures/list.orpc'
import { getRisultatiStagioneORPCProcedure } from '~/server/api/economia/procedures/getRisultatiStagione.orpc'
import { listSquadreSerieAORPCProcedure } from '~/server/api/squadreSerieA/procedures/list.orpc'
import { getTabelliniORPCProcedure } from '~/server/api/partita/procedures/getTabellini.orpc'
import { getFormazioniORPCProcedure } from '~/server/api/partita/procedures/getFormazioni.orpc'
import { listTorneiORPCProcedure } from '~/server/api/tornei/procedures/list.orpc'
import { championsBracketORPCProcedure } from '~/server/api/tornei/procedures/championsBracket.orpc'
// risultati
import { getGiornataPartiteORPCProcedure } from '~/server/api/risultati/procedures/getGiornataPartite.orpc'
import { getTabellinoORPCProcedure } from '~/server/api/risultati/procedures/getTabellino.orpc'
import { updateRisultatiORPCProcedure } from '~/server/api/risultati/procedures/update.orpc'
// statisticheSquadre
import { riepilogoORPCProcedure } from '~/server/api/statisticheSquadre/procedures/riepilogo.orpc'
import { headToHeadORPCProcedure } from '~/server/api/statisticheSquadre/procedures/headToHead.orpc'
import { topGiocatoriORPCProcedure } from '~/server/api/statisticheSquadre/procedures/topGiocatori.orpc'
// auth
import { requestPasswordResetORPCProcedure } from '~/server/api/auth/procedures/requestPasswordReset.orpc'
import { resetPasswordORPCProcedure } from '~/server/api/auth/procedures/resetPassword.orpc'
// squadre
import { listSquadreORPCProcedure } from '~/server/api/squadre/procedures/list.orpc'
import { getSquadraORPCProcedure } from '~/server/api/squadre/procedures/get.orpc'
import { getMagliaORPCProcedure } from '~/server/api/squadre/procedures/getMaglia.orpc'
import { getRosaORPCProcedure } from '~/server/api/squadre/procedures/getRosa.orpc'
import { updateSquadraORPCProcedure } from '~/server/api/squadre/procedures/update.orpc'
import { updateMagliaORPCProcedure } from '~/server/api/squadre/procedures/updateMaglia.orpc'
// trasferimenti
import { listTrasferimentiORPCProcedure } from '~/server/api/trasferimenti/procedures/list.orpc'
import { statsStagioniORPCProcedure } from '~/server/api/trasferimenti/procedures/statsStagioni.orpc'
import { getTrasferimentoORPCProcedure } from '~/server/api/trasferimenti/procedures/get.orpc'
import { upsertTrasferimentoORPCProcedure } from '~/server/api/trasferimenti/procedures/upsert.orpc'
import { deleteTrasferimentoORPCProcedure } from '~/server/api/trasferimenti/procedures/delete.orpc'
import { chiudiTrasferimentoORPCProcedure } from '~/server/api/trasferimenti/procedures/chiudiTrasferimento.orpc'
// profilo
import { changePasswordORPCProcedure } from '~/server/api/profilo/procedures/changePassword.orpc'
import { uploadFotoORPCProcedure } from '~/server/api/profilo/procedures/uploadFoto.orpc'
import { uploadFotoVercelORPCProcedure } from '~/server/api/profilo/procedures/uploadFotoVercel.orpc'
import { deleteFotoORPCProcedure } from '~/server/api/profilo/procedures/deleteFoto.orpc'
import { updateFotoORPCProcedure } from '~/server/api/profilo/procedures/updateFoto.orpc'
// giocatori
import { createOrUpdatePlayerORPCProcedure } from '~/server/api/giocatori/procedures/createOrUpdatePlayer.orpc'
import { removeGiocatoreORPCProcedure } from '~/server/api/giocatori/procedures/removeGiocatore.orpc'
import { showAllORPCProcedure } from '~/server/api/giocatori/procedures/showAll.orpc'
import { searchByNameORPCProcedure } from '~/server/api/giocatori/procedures/searchByName.orpc'
import { listStatisticheORPCProcedure } from '~/server/api/giocatori/procedures/listStatistiche.orpc'
import { showGiocatoreORPCProcedure } from '~/server/api/giocatori/procedures/show.orpc'
import { listStatisticheSquadraORPCProcedure } from '~/server/api/giocatori/procedures/listStatisticheSquadra.orpc'
import { showStatisticaORPCProcedure } from '~/server/api/giocatori/procedures/showStatistica.orpc'

export const orpcRouter = {
  albo: {
    list: listAlboORPCProcedure,
    get: getAlboORPCProcedure,
  },
  classifica: {
    list: listClassificaORPCProcedure,
  },
  economia: {
    getRisultatiStagione: getRisultatiStagioneORPCProcedure,
  },
  partita: {
    getTabellini: getTabelliniORPCProcedure,
    getFormazioni: getFormazioniORPCProcedure,
  },
  squadreSerieA: {
    list: listSquadreSerieAORPCProcedure,
  },
  tornei: {
    list: listTorneiORPCProcedure,
    championsBracket: championsBracketORPCProcedure,
  },
  risultati: {
    update: updateRisultatiORPCProcedure,
    getGiornataPartite: getGiornataPartiteORPCProcedure,
    getTabellino: getTabellinoORPCProcedure,
  },
  statisticheSquadre: {
    riepilogo: riepilogoORPCProcedure,
    headToHead: headToHeadORPCProcedure,
    topGiocatori: topGiocatoriORPCProcedure,
  },
  auth: {
    requestPasswordReset: requestPasswordResetORPCProcedure,
    resetPassword: resetPasswordORPCProcedure,
  },
  squadre: {
    list: listSquadreORPCProcedure,
    get: getSquadraORPCProcedure,
    getMaglia: getMagliaORPCProcedure,
    getRosa: getRosaORPCProcedure,
    update: updateSquadraORPCProcedure,
    updateMaglia: updateMagliaORPCProcedure,
  },
  trasferimenti: {
    list: listTrasferimentiORPCProcedure,
    statsStagioni: statsStagioniORPCProcedure,
    get: getTrasferimentoORPCProcedure,
    upsert: upsertTrasferimentoORPCProcedure,
    delete: deleteTrasferimentoORPCProcedure,
    chiudiTrasferimento: chiudiTrasferimentoORPCProcedure,
  },
  profilo: {
    changePassword: changePasswordORPCProcedure,
    uploadFoto: uploadFotoORPCProcedure,
    uploadFotoVercel: uploadFotoVercelORPCProcedure,
    deleteFoto: deleteFotoORPCProcedure,
    updateFoto: updateFotoORPCProcedure,
  },
  giocatori: {
    upsert: createOrUpdatePlayerORPCProcedure,
    delete: removeGiocatoreORPCProcedure,
    get: showGiocatoreORPCProcedure,
    listAll: showAllORPCProcedure,
    search: searchByNameORPCProcedure,
    listStatistiche: listStatisticheORPCProcedure,
    listStatisticheSquadra: listStatisticheSquadraORPCProcedure,
    getStatistica: showStatisticaORPCProcedure,
  },
}

/** Tipo del router, utile per il client oRPC type-safe. */
export type ORPCRouter = typeof orpcRouter
