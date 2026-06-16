/**
 * Tornei repository — lettura dei tornei disponibili.
 */

import { Tornei } from '~/server/db/entities'

export async function getTornei() {
  return await Tornei.find({
    select: {
      idTorneo: true,
      nome: true,
      gruppoFase: true,
      hasClassifica: true,
    },
  })
}
