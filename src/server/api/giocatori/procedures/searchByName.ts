import { z } from 'zod'
import { ILike } from 'typeorm'
import { publicProcedure } from '../../trpc'
import { getRuoloEsteso } from '~/utils/helper'
import { Giocatori } from '~/server/db/entities'

export const searchByName = publicProcedure
  .input(z.object({ query: z.string().min(2) }))
  .query(async ({ input }) => {
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
