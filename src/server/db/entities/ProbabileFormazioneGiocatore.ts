import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  type Relation,
  JoinColumn,
  BaseEntity,
} from 'typeorm'
import { ProbabileFormazione } from './ProbabileFormazione'
import { Giocatore } from './Giocatore'

@Entity({ name: 'probabile_formazione_giocatore' })
export class ProbabileFormazioneGiocatore extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_probabile_formazione_giocatore' })
  idProbabileFormazioneGiocatore!: number

  @Column({ name: 'id_probabile_formazione', type: 'int' })
  idProbabileFormazione!: number

  @Column({ name: 'id_giocatore', type: 'int', nullable: true })
  idGiocatore!: number | null

  @Column({ name: 'nome_giocatore', type: 'varchar', length: 100 })
  nomeGiocatore!: string

  @Column({ name: 'squadra', type: 'varchar', length: 50 })
  squadra!: string

  @Column({ name: 'ruolo', type: 'varchar', length: 1 })
  ruolo!: string

  @Column({ name: 'probabilita', type: 'smallint' })
  probabilita!: number

  @Column({ name: 'stato', type: 'varchar', length: 50 })
  stato!: string

  @ManyToOne(
    () => ProbabileFormazione,
    (pf: ProbabileFormazione) => pf.ProbabileFormazioneGiocatori,
    { onDelete: 'CASCADE', onUpdate: 'NO ACTION' },
  )
  @JoinColumn({
    name: 'id_probabile_formazione',
    foreignKeyConstraintName:
      'FK_ProbabileFormazioneGiocatori_ProbabileFormazione',
  })
  ProbabileFormazione!: Relation<ProbabileFormazione>

  @ManyToOne(
    () => Giocatore,
    (g: Giocatore) => g.ProbabileFormazioneGiocatori,
    { onDelete: 'SET NULL', onUpdate: 'NO ACTION', nullable: true },
  )
  @JoinColumn({
    name: 'id_giocatore',
    foreignKeyConstraintName: 'FK_ProbabileFormazioneGiocatori_Giocatori',
  })
  Giocatore?: Relation<Giocatore | null>
}
