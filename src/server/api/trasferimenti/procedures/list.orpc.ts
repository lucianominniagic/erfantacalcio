import { z } from 'zod'
import { publicProcedure } from '~/server/orpc'
import { Configurazione } from '~/config'
import { Trasferimenti } from '~/server/db/entities'

export const listTrasferimentiORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/trasferimenti/list', summary: 'Lista trasferimenti di un giocatore' })
  .input(z.object({ idGiocatore: z.number() }))
  .handler(async ({ input }) => {
    try {
      const query = await Trasferimenti.find({
        select: {
          idTrasferimento: true,
          idGiocatore: false,
          costo: true,
          media: true,
          gol: true,
          assist: true,
          giocate: true,
          dataAcquisto: true,
          dataCessione: true,
          stagione: true,
          nomeSquadra: true,
          nomeSquadraSerieA: true,
          Utente: { nomeSquadra: true },
          Giocatore: { nome: true, ruolo: true, id_pf: true },
          SquadraSerieA: { nome: true, maglia: true },
        },
        relations: {
          Utente: true,
          Giocatore: true,
          SquadraSerieA: true,
        },
        where: { idGiocatore: input.idGiocatore, hasRitirato: false },
        order: { stagione: 'desc', dataAcquisto: 'desc' },
      })

      return query.map((t) => ({
        id: t.idTrasferimento,
        id_pf: t.Giocatore.id_pf,
        idTrasferimento: t.idTrasferimento,
        nome: t.Giocatore.nome,
        ruolo: t.Giocatore.ruolo,
        squadra:
          t.Utente?.nomeSquadra === undefined
            ? t.nomeSquadra
            : t.Utente.nomeSquadra,
        maglia: t.SquadraSerieA?.maglia
          ? `/images/maglie/${t.SquadraSerieA.maglia}`
          : `/images/maglie/${t.nomeSquadraSerieA?.toLowerCase()}.gif`,
        squadraSerieA:
          t.SquadraSerieA?.nome === undefined
            ? t.nomeSquadraSerieA
            : t.SquadraSerieA.nome,
        costo: t.costo,
        media: t.media ?? 0,
        gol: t.gol,
        assist: t.assist,
        giocate: t.giocate,
        dataAcquisto: t.dataAcquisto,
        dataCessione: t.dataCessione,
        stagione: t.stagione,
        isEditVisible: t.stagione === Configurazione.stagione,
      }))
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
