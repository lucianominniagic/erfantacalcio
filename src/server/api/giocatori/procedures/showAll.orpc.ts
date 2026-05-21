import { publicProcedure } from '~/server/orpc'
import { getRuoloEsteso } from '~/utils/helper'
import { Giocatori } from '~/server/db/entities'

export const showAllORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/giocatori/listAll', summary: 'Lista tutti i giocatori' })
  .handler(async () => {
    try {
      const giocatori = await Giocatori.find({
        select: {
          idGiocatore: true,
          nome: true,
          ruolo: true,
        },
        order: { nome: 'asc' },
      })

      if (giocatori) {
        return giocatori.map((giocatore) => ({
          id: giocatore.idGiocatore,
          label: `${giocatore.nome} - ${getRuoloEsteso(giocatore.ruolo)}`,
        }))
      }
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
