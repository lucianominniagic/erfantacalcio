import { protectedProcedure } from '~/server/orpc'
import { getProssimaGiornata, getProssimaGiornataSerieA } from '~/server/utils/common'

export const giornateDaGiocareORPCProcedure = protectedProcedure
  .route({ method: 'GET', path: '/formazione/getGiornateDaGiocare', summary: 'Giornate da giocare per la squadra utente' })
  .handler(async ({ context }) => {
    try {
      const idSquadraUtente = context.session.user.idSquadra
      const giornataSerieA = await getProssimaGiornataSerieA(false, 'asc')
      const prossimeGiornate = await getProssimaGiornata(giornataSerieA, true)
      const giornateFiltrate = prossimeGiornate.filter((giornata) =>
        giornata.partite.some(
          (partita) =>
            partita.idHome === idSquadraUtente ||
            partita.idAway === idSquadraUtente,
        ),
      )
      return giornateFiltrate
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
