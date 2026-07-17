import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  type Relation,
  BaseEntity,
} from 'typeorm'
import { ProbabileFormazioneGiocatore } from './ProbabileFormazioneGiocatore'

@Entity({ name: 'probabile_formazione' })
export class ProbabileFormazione extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_probabile_formazione' })
  idProbabileFormazione!: number

  @Column({ name: 'giornata_serie_a', type: 'smallint' })
  giornataSerieA!: number

  @Column({ name: 'partita', type: 'varchar', length: 100 })
  partita!: string

  @Column({ name: 'fetched_at', type: 'timestamptz' })
  fetchedAt!: Date

  @OneToMany(
    () => ProbabileFormazioneGiocatore,
    (pfg: ProbabileFormazioneGiocatore) => pfg.ProbabileFormazione,
  )
  ProbabileFormazioneGiocatori!: Relation<ProbabileFormazioneGiocatore[]>
}
