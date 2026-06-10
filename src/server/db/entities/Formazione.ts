import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  Unique,
  type Relation,
  JoinColumn,
  BaseEntity,
} from 'typeorm'
import { Partita } from './Partita'
import { Utente } from './Utente'
import { Voto } from './Voto'

@Entity({ name: 'formazione' })
@Unique('UNIQUE_Formazioni_ids', ['idSquadra', 'idPartita'])
export class Formazione extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_formazione' })
  idFormazione!: number

  @Column({ name: 'id_squadra', type: 'int' })
  idSquadra!: number

  @Column({ name: 'id_partita', type: 'int' })
  idPartita!: number

  @Column({
    name: 'data_ora',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  dataOra!: Date

  @Column({ name: 'modulo', type: 'varchar', length: 5 })
  modulo!: string

  @Column({ name: 'has_bloccata', type: 'boolean', default: false })
  hasBloccata!: boolean

  @ManyToOne(() => Partita, (p: Partita) => p.Formazioni, {
    onUpdate: 'NO ACTION',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_partita',
    foreignKeyConstraintName: 'FK_Formazioni_Partite',
  })
  Partita!: Relation<Partita>

  @ManyToOne(() => Utente, (u: Utente) => u.Formazioni, {
    onUpdate: 'NO ACTION',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_squadra',
    foreignKeyConstraintName: 'FK_Formazioni_Utenti',
  })
  Utente!: Relation<Utente>

  @OneToMany(() => Voto, (v: Voto) => v.Formazione)
  Voti!: Relation<Voto[]>
}
