import { z } from 'zod'
import { publicProcedure } from '~/server/api/trpc'
import { Partite, Utenti } from '~/server/db/entities'

interface SquadraStats {
  idSquadra: number
  squadra: string
  foto: string | null
  giocate: number
  vittorie: number
  pareggi: number
  sconfitte: number
  vittorieCasa: number
  giocateCasa: number
  vittorieTrasferta: number
  giocateTrasferta: number
  fantapuntiTot: number
  golFatti: number
  golSubiti: number
  cleanSheet: number
  partiteSenzaGol: number
  miglioreGiornata: number | null
  miglioreFantapunti: number | null
  peggioreGiornata: number | null
  peggioreFantapunti: number | null
  miglioreVittoriaScarto: number
  miglioreVittoriaLabel: string | null
  peggioreSconfittaScarto: number
  peggioreSconfittaLabel: string | null
}

const initStats = (idSquadra: number, squadra: string, foto: string | null): SquadraStats => ({
  idSquadra,
  squadra,
  foto,
  giocate: 0,
  vittorie: 0,
  pareggi: 0,
  sconfitte: 0,
  vittorieCasa: 0,
  giocateCasa: 0,
  vittorieTrasferta: 0,
  giocateTrasferta: 0,
  fantapuntiTot: 0,
  golFatti: 0,
  golSubiti: 0,
  cleanSheet: 0,
  partiteSenzaGol: 0,
  miglioreGiornata: null,
  miglioreFantapunti: null,
  peggioreGiornata: null,
  peggioreFantapunti: null,
  miglioreVittoriaScarto: -Infinity,
  miglioreVittoriaLabel: null,
  peggioreSconfittaScarto: Infinity,
  peggioreSconfittaLabel: null,
})

export const riepilogoProcedure = publicProcedure
  .input(z.object({ idTornei: z.array(z.number()) }))
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

        const accumulate = (
          s: SquadraStats,
          isHome: boolean,
          fantapunti: number,
          golF: number,
          golS: number,
          opponentName: string,
        ) => {
          s.giocate += 1
          s.fantapuntiTot += fantapunti
          s.golFatti += golF
          s.golSubiti += golS
          if (isHome) s.giocateCasa += 1
          else s.giocateTrasferta += 1
          if (golS === 0) s.cleanSheet += 1
          if (golF === 0) s.partiteSenzaGol += 1

          if (s.miglioreFantapunti == null || fantapunti > s.miglioreFantapunti) {
            s.miglioreFantapunti = fantapunti
            s.miglioreGiornata = giornata
          }
          if (s.peggioreFantapunti == null || fantapunti < s.peggioreFantapunti) {
            s.peggioreFantapunti = fantapunti
            s.peggioreGiornata = giornata
          }

          if (golF > golS) {
            s.vittorie += 1
            if (isHome) s.vittorieCasa += 1
            else s.vittorieTrasferta += 1
            const scarto = golF - golS
            if (scarto > s.miglioreVittoriaScarto) {
              s.miglioreVittoriaScarto = scarto
              s.miglioreVittoriaLabel = `${golF}-${golS} vs ${opponentName} (G${giornata})`
            }
          } else if (golF === golS) {
            s.pareggi += 1
          } else {
            s.sconfitte += 1
            const scarto = golF - golS
            if (scarto < s.peggioreSconfittaScarto) {
              s.peggioreSconfittaScarto = scarto
              s.peggioreSconfittaLabel = `${golF}-${golS} vs ${opponentName} (G${giornata})`
            }
          }
        }

        accumulate(home, true, punteggioH, golH, golA, nomeBy(idA))
        accumulate(away, false, punteggioA, golA, golH, nomeBy(idH))
      })

      const round2 = (n: number) => Math.round(n * 100) / 100

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
          miglioreFantapunti: s.miglioreFantapunti != null ? round2(s.miglioreFantapunti) : null,
          miglioreGiornata: s.miglioreGiornata,
          peggioreFantapunti: s.peggioreFantapunti != null ? round2(s.peggioreFantapunti) : null,
          peggioreGiornata: s.peggioreGiornata,
          miglioreVittoria: s.miglioreVittoriaLabel,
          peggioreSconfitta: s.peggioreSconfittaLabel,
          cleanSheet: s.cleanSheet,
          partiteSenzaGol: s.partiteSenzaGol,
          percVittorieCasa: s.giocateCasa > 0 ? round2((s.vittorieCasa / s.giocateCasa) * 100) : 0,
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
