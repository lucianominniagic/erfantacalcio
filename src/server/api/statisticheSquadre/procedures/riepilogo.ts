import { publicProcedure } from '~/server/api/trpc'
import { statisticheSquadreInputSchema } from '~/schemas/statisticheSquadre'
import { Partite, Utenti } from '~/server/db/entities'
import {
  type SquadraStats,
  initStats,
  accumulate,
  round2,
} from '~/server/services/statisticheService'

export const riepilogoProcedure = publicProcedure
  .input(statisticheSquadreInputSchema)
  .query(async (opts) => {
    try {
      const idTornei = opts.input.idTornei
      if (idTornei.length === 0) return []

      const utenti = await Utenti.find({
        select: { idUtente: true, nomeSquadra: true, foto: true },
        order: { nomeSquadra: 'asc' },
      })

      const partite = await Partite.createQueryBuilder('p')
        .innerJoin('calendario', 'cal', 'cal.id_calendario = p.id_calendario')
        .where('cal.id_torneo IN (:...idTornei)', { idTornei })
        .andWhere('p.id_squadra_home IS NOT NULL')
        .andWhere('p.id_squadra_away IS NOT NULL')
        .andWhere('p.punteggio_home IS NOT NULL')
        .andWhere('p.punteggio_away IS NOT NULL')
        .select([
          'p.idPartita',
          'p.idSquadraH',
          'p.idSquadraA',
          'p.golH',
          'p.golA',
          'p.punteggioH',
          'p.punteggioA',
        ])
        .addSelect('cal.giornata', 'giornata')
        .getRawAndEntities()

      const statsMap = new Map<number, SquadraStats>()
      utenti.forEach((u) => {
        statsMap.set(u.idUtente, initStats(u.idUtente, u.nomeSquadra, u.foto))
      })

      const nomeBy = (id: number | null | undefined): string =>
        (id != null && statsMap.get(id)?.squadra) || '—'

      partite.entities.forEach((p, idx) => {
        const giornata = Number(partite.raw[idx]?.giornata ?? 0)
        const idH = p.idSquadraH
        const idA = p.idSquadraA
        if (idH == null || idA == null) return
        const punteggioH = Number(p.punteggioH ?? 0)
        const punteggioA = Number(p.punteggioA ?? 0)
        const golH = Number(p.golH ?? 0)
        const golA = Number(p.golA ?? 0)

        const home = statsMap.get(idH)
        const away = statsMap.get(idA)
        if (!home || !away) return

        accumulate(home, true, punteggioH, golH, golA, nomeBy(idA), giornata)
        accumulate(away, false, punteggioA, golA, golH, nomeBy(idH), giornata)
      })

      return Array.from(statsMap.values())
        .filter((s) => s.giocate > 0)
        .map((s) => ({
          id: s.idSquadra,
          idSquadra: s.idSquadra,
          squadra: s.squadra,
          foto: s.foto,
          giocate: s.giocate,
          vittorie: s.vittorie,
          pareggi: s.pareggi,
          sconfitte: s.sconfitte,
          mediaFantapunti: round2(s.fantapuntiTot / s.giocate),
          mediaGolFatti: round2(s.golFatti / s.giocate),
          mediaGolSubiti: round2(s.golSubiti / s.giocate),
          miglioreFantapunti:
            s.miglioreFantapunti != null ? round2(s.miglioreFantapunti) : null,
          miglioreGiornata: s.miglioreGiornata,
          peggioreFantapunti:
            s.peggioreFantapunti != null ? round2(s.peggioreFantapunti) : null,
          peggioreGiornata: s.peggioreGiornata,
          miglioreVittoria: s.miglioreVittoriaLabel,
          peggioreSconfitta: s.peggioreSconfittaLabel,
          cleanSheet: s.cleanSheet,
          partiteSenzaGol: s.partiteSenzaGol,
          percVittorieCasa:
            s.giocateCasa > 0
              ? round2((s.vittorieCasa / s.giocateCasa) * 100)
              : 0,
          percVittorieTrasferta:
            s.giocateTrasferta > 0
              ? round2((s.vittorieTrasferta / s.giocateTrasferta) * 100)
              : 0,
        }))
        .sort((a, b) => b.mediaFantapunti - a.mediaFantapunti)
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
