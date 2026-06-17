/**
 * statisticheSquadreRepository — query DB condivise per il dominio statisticheSquadre.
 *
 * Due query separate per le partite perché i filtri di completamento differiscono:
 * - riepilogo usa punteggio (fantapunti disponibili)
 * - headToHead usa gol (risultato finale disponibile)
 */

import { Partite, Utenti } from '~/server/db/entities'

export async function loadUtenti() {
  return Utenti.find({
    select: { idUtente: true, nomeSquadra: true, foto: true },
    order: { nomeSquadra: 'asc' },
  })
}

export async function loadPartiteConPunteggio(idTornei: number[]) {
  return Partite.createQueryBuilder('p')
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
}

export async function loadPartiteConGol(idTornei: number[]) {
  return Partite.createQueryBuilder('p')
    .innerJoin('calendario', 'cal', 'cal.id_calendario = p.id_calendario')
    .where('cal.id_torneo IN (:...idTornei)', { idTornei })
    .andWhere('p.id_squadra_home IS NOT NULL')
    .andWhere('p.id_squadra_away IS NOT NULL')
    .andWhere('p.gol_home IS NOT NULL')
    .andWhere('p.gol_away IS NOT NULL')
    .select(['p.idSquadraH', 'p.idSquadraA', 'p.golH', 'p.golA'])
    .getMany()
}
