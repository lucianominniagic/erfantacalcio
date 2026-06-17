import { z } from 'zod'
import { ILike } from 'typeorm'
import { publicProcedure } from '~/server/orpc'
import { getRuoloEsteso } from '~/utils/formazione'
import { Giocatori } from '~/server/db/entities'

export const searchByNameORPCProcedure = publicProcedure
  .route({ method: 'GET', path: '/giocatori/search', summary: 'Ricerca giocatori per nome' })
  .input(z.object({ query: z.string().min(2) }))
  .handler(async ({ input }) => {
    try {
      const giocatori = await Giocatori.find({
        select: { idGiocatore: true, nome: true, ruolo: true },
        where: { nome: ILike(`%${input.query}%`) },
        order: { nome: 'asc' },
        take: 20,
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
