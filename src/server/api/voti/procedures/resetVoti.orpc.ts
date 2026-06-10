import { z } from 'zod'
import { adminProcedure } from '~/server/orpc'
import { Voti } from '~/server/db/entities'

async function eseguiResetVoti(idCalendario: number) {
  try {
    await Voti.update(
      {
        idCalendario: idCalendario,
      },
      {
        voto: 0,
        ammonizione: 0,
        espulsione: 0,
        gol: 0,
        assist: 0,
        autogol: 0,
        altriBonus: 0,
      },
    )
  } catch (error) {
    console.error('Si è verificato un errore', error)
    throw error
  }
}

export const resetVotiORPCProcedure = adminProcedure
  .route({ method: 'POST', path: '/voti/resetVoti', summary: 'Azzera i voti di una giornata (admin)' })
  .input(
    z.object({
      idCalendario: z.number(),
    }),
  )
  .handler(async ({ input }) => {
    try {
      await eseguiResetVoti(input.idCalendario)
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
