/**
 * Procedura oRPC per la classifica — versione parallela al file tRPC.
 *
 * NON modificare `list.ts` (file tRPC originale).
 * Questo file esiste solo come pilota della migrazione a oRPC.
 *
 * La logica di business è identica a quella in `list.ts`; l'unica
 * differenza è l'uso di `publicProcedure` da `~/server/orpc` al posto
 * di quello tRPC, e la firma `.handler()` invece di `.query()`.
 */
import { z } from 'zod'

import { publicProcedure } from '~/server/orpc'
import { getFantapunti } from '../services/getFantapunti'
import { Classifiche } from '~/server/db/entities'

export const listClassificaORPCProcedure = publicProcedure
  .input(z.object({ idTorneo: z.number() }))
  .handler(async ({ input }) => {
    const idTorneo = +input.idTorneo
    try {
      const fantaPunti = await getFantapunti(idTorneo)
      const result = await Classifiche.find({
        select: {
          idSquadra: true,
          punti: true,
          vinteCasa: true,
          vinteTrasferta: true,
          pareggiCasa: true,
          pareggiTrasferta: true,
          perseCasa: true,
          perseTrasferta: true,
          golFatti: true,
          golSubiti: true,
          differenzaReti: true,
          giocate: true,
          Utente: { nomeSquadra: true, foto: true, maglia: true },
        },
        where: { idTorneo },
        relations: { Utente: true },
        order: { punti: 'desc', golFatti: 'desc', golSubiti: 'asc' },
      })
      return result.map((c) => ({
        id: c.idSquadra,
        idSquadra: c.idSquadra,
        squadra: c.Utente.nomeSquadra,
        foto: c.Utente.foto,
        punti: c.punti,
        vinte: c.vinteCasa + c.vinteTrasferta,
        pareggi: c.pareggiCasa + c.pareggiTrasferta,
        perse: c.perseCasa + c.perseTrasferta,
        golFatti: c.golFatti,
        golSubiti: c.golSubiti,
        differenzaReti: c.differenzaReti,
        giocate: c.giocate,
        fantapunti: fantaPunti[c.idSquadra] ?? 0,
      }))
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
