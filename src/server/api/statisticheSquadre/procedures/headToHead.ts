import { z } from 'zod'
import { publicProcedure } from '~/server/api/trpc'
import { Partite, Utenti } from '~/server/db/entities'

export interface H2HCell {
  v: number
  n: number
  p: number
  golFatti: number
  golSubiti: number
  partite: number
}

export const headToHeadProcedure = publicProcedure
  .input(z.object({ idTornei: z.array(z.number()) }))
  .query(async (opts) => {
    try {
      const idTornei = opts.input.idTornei
      if (idTornei.length === 0) return { squadre: [], matrice: {} }

      const utenti = await Utenti.find({
        select: { idUtente: true, nomeSquadra: true, foto: true },
        order: { nomeSquadra: 'asc' },
      })

      const partite = await Partite.createQueryBuilder('p')
        .innerJoin('calendario', 'cal', 'cal.id_calendario = p.id_calendario')
        .where('cal.id_torneo IN (:...idTornei)', { idTornei })
        .andWhere('p.id_squadra_home IS NOT NULL')
        .andWhere('p.id_squadra_away IS NOT NULL')
        .andWhere('p.gol_home IS NOT NULL')
        .andWhere('p.gol_away IS NOT NULL')
        .select(['p.idSquadraH', 'p.idSquadraA', 'p.golH', 'p.golA'])
        .getMany()

      const matrice: Record<number, Record<number, H2HCell>> = {}
      const ensure = (a: number, b: number) => {
        if (!matrice[a]) matrice[a] = {}
        const row = matrice[a]!
        if (!row[b]) row[b] = { v: 0, n: 0, p: 0, golFatti: 0, golSubiti: 0, partite: 0 }
        return row[b]!
      }

      partite.forEach((p) => {
        const idH = p.idSquadraH
        const idA = p.idSquadraA
        if (idH == null || idA == null) return
        const golH = Number(p.golH ?? 0)
        const golA = Number(p.golA ?? 0)

        const cellH = ensure(idH, idA)
        const cellA = ensure(idA, idH)
        cellH.partite += 1
        cellA.partite += 1
        cellH.golFatti += golH
        cellH.golSubiti += golA
        cellA.golFatti += golA
        cellA.golSubiti += golH
        if (golH > golA) {
          cellH.v += 1
          cellA.p += 1
        } else if (golH === golA) {
          cellH.n += 1
          cellA.n += 1
        } else {
          cellH.p += 1
          cellA.v += 1
        }
      })

      const squadre = utenti.map((u) => ({
        idSquadra: u.idUtente,
        squadra: u.nomeSquadra,
        foto: u.foto,
      }))

      return { squadre, matrice }
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })

