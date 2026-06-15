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
// formazione
import { giornateDaGiocareORPCProcedure } from '~/server/api/formazione/procedures/giornateDaGiocare.orpc'
import { showFormazioneORPCProcedure } from '~/server/api/formazione/procedures/show.orpc'
import { createFormazioneORPCProcedure } from '~/server/api/formazione/procedures/create.orpc'
import { confirmPrecedenteORPCProcedure } from '~/server/api/formazione/procedures/confirmPrecedente.orpc'
// nuovastagione
import { getFaseAvvioORPCProcedure } from '~/server/api/nuovastagione/procedures/getFaseAvvio.orpc'
import { chiudiStagioneORPCProcedure } from '~/server/api/nuovastagione/procedures/chiudiStagione.orpc'
import { preparaStagioneORPCProcedure } from '~/server/api/nuovastagione/procedures/preparaStagione.orpc'
import { preparaIdSquadreORPCProcedure } from '~/server/api/nuovastagione/procedures/preparaIdSquadre.orpc'
import { creaPartiteORPCProcedure } from '~/server/api/nuovastagione/procedures/creaPartite.orpc'
import { creaClassificheORPCProcedure } from '~/server/api/nuovastagione/procedures/creaClassifiche.orpc'
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
// calendario
import { listCalendarioORPCProcedure } from '~/server/api/calendario/procedures/list.orpc'
import { getOneCalendarioORPCProcedure } from '~/server/api/calendario/procedures/getOne.orpc'
import { updateCalendarioORPCProcedure } from '~/server/api/calendario/procedures/update.orpc'
import { getProssimeGiornateORPCProcedure } from '~/server/api/calendario/procedures/getProssimeGiornate.orpc'
import { getUltimiRisultatiORPCProcedure } from '~/server/api/calendario/procedures/getUltimiRisultati.orpc'
import { listByGironeORPCProcedure } from '~/server/api/calendario/procedures/listByGirone.orpc'
import { listRecuperiORPCProcedure } from '~/server/api/calendario/procedures/listRecuperi.orpc'
import { listByTorneoORPCProcedure } from '~/server/api/calendario/procedures/listByTorneo.orpc'
import { getByGiornataAndTorneoORPCProcedure } from '~/server/api/calendario/procedures/getByGiornataAndTorneo.orpc'
import { getByIdCalendarioORPCProcedure } from '~/server/api/calendario/procedures/getByIdCalendario.orpc'
import { listAttualeORPCProcedure } from '~/server/api/calendario/procedures/listAttuale.orpc'
import { listPartiteBySquadraORPCProcedure } from '~/server/api/calendario/procedures/listPartiteBySquadra.orpc'
// mercato
import { listSessioniORPCProcedure } from '~/server/api/mercato/procedures/listSessioni.orpc'
import { getSessioniMercatoORPCProcedure } from '~/server/api/mercato/procedures/getSessioniMercato.orpc'
import { getSessioneAttivaORPCProcedure } from '~/server/api/mercato/procedures/getSessioneAttiva.orpc'
import { getProposteSessioneORPCProcedure } from '~/server/api/mercato/procedures/getProposteSessione.orpc'
import { getMieProposteORPCProcedure } from '~/server/api/mercato/procedures/getMieProposte.orpc'
import { getGiocatoriSvincolatiORPCProcedure } from '~/server/api/mercato/procedures/getGiocatoriSvincolati.orpc'
import { deletePropostaORPCProcedure } from '~/server/api/mercato/procedures/deleteProposta.orpc'
import { createSessioneORPCProcedure } from '~/server/api/mercato/procedures/createSessione.orpc'
import { createPropostaORPCProcedure } from '~/server/api/mercato/procedures/createProposta.orpc'
import { riordinaProposteORPCProcedure } from '~/server/api/mercato/procedures/riordinaProposte.orpc'
import { aggiudicaSessioneORPCProcedure } from '~/server/api/mercato/procedures/aggiudicaSessione.orpc'
import { getEsitoUltimaSessioneChiusaORPCProcedure } from '~/server/api/mercato/procedures/getEsitoUltimaSessioneChiusa.orpc'
// voti
import { listVotiORPCProcedure } from '~/server/api/voti/procedures/list.orpc'
import { getVotoORPCProcedure } from '~/server/api/voti/procedures/get.orpc'
import { getStatisticaVotiORPCProcedure } from '~/server/api/voti/procedures/getStatisticaVoti.orpc'
import { updateVotoORPCProcedure } from '~/server/api/voti/procedures/update.orpc'
import { uploadVercelORPCProcedure } from '~/server/api/voti/procedures/uploadVercel.orpc'
import { resetVotiORPCProcedure } from '~/server/api/voti/procedures/resetVoti.orpc'
import { readVotiORPCProcedure } from '~/server/api/voti/procedures/readVoti.orpc'
import { processVotiORPCProcedure } from '~/server/api/voti/procedures/processVoti.orpc'
import { refreshStatsORPCProcedure } from '~/server/api/voti/procedures/refreshStats.orpc'

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
  formazione: {
    getGiornateDaGiocare: giornateDaGiocareORPCProcedure,
    get: showFormazioneORPCProcedure,
    create: createFormazioneORPCProcedure,
    confirmPrecedente: confirmPrecedenteORPCProcedure,
  },
  nuovastagione: {
    getFaseAvvio: getFaseAvvioORPCProcedure,
    chiudiStagione: chiudiStagioneORPCProcedure,
    preparaStagione: preparaStagioneORPCProcedure,
    preparaIdSquadre: preparaIdSquadreORPCProcedure,
    creaPartite: creaPartiteORPCProcedure,
    creaClassifiche: creaClassificheORPCProcedure,
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
  calendario: {
    list: listCalendarioORPCProcedure,
    getOne: getOneCalendarioORPCProcedure,
    update: updateCalendarioORPCProcedure,
    getProssimeGiornate: getProssimeGiornateORPCProcedure,
    getUltimiRisultati: getUltimiRisultatiORPCProcedure,
    listByGirone: listByGironeORPCProcedure,
    listRecuperi: listRecuperiORPCProcedure,
    listByTorneo: listByTorneoORPCProcedure,
    getByGiornataAndTorneo: getByGiornataAndTorneoORPCProcedure,
    getByIdCalendario: getByIdCalendarioORPCProcedure,
    listAttuale: listAttualeORPCProcedure,
    listPartiteBySquadra: listPartiteBySquadraORPCProcedure,
  },
  mercato: {
    listSessioni: listSessioniORPCProcedure,
    getSessioniMercato: getSessioniMercatoORPCProcedure,
    getSessioneAttiva: getSessioneAttivaORPCProcedure,
    getProposteSessione: getProposteSessioneORPCProcedure,
    getMieProposte: getMieProposteORPCProcedure,
    getGiocatoriSvincolati: getGiocatoriSvincolatiORPCProcedure,
    deleteProposta: deletePropostaORPCProcedure,
    createSessione: createSessioneORPCProcedure,
    createProposta: createPropostaORPCProcedure,
    riordinaProposte: riordinaProposteORPCProcedure,
    aggiudicaSessione: aggiudicaSessioneORPCProcedure,
    getEsitoUltimaSessioneChiusa: getEsitoUltimaSessioneChiusaORPCProcedure,
  },
  voti: {
    list: listVotiORPCProcedure,
    get: getVotoORPCProcedure,
    getStatisticaVoti: getStatisticaVotiORPCProcedure,
    update: updateVotoORPCProcedure,
    uploadVercel: uploadVercelORPCProcedure,
    resetVoti: resetVotiORPCProcedure,
    readVoti: readVotiORPCProcedure,
    processVoti: processVotiORPCProcedure,
    refreshStats: refreshStatsORPCProcedure,
  },
}

/** Tipo del router, utile per il client oRPC type-safe. */
export type ORPCRouter = typeof orpcRouter
