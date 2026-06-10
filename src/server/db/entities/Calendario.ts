import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  type Relation,
  JoinColumn,
  BaseEntity,
} from 'typeorm'
import { Torneo } from './Torneo'
import { Partita } from './Partita'
import { Voto } from './Voto'

@Entity({ name: 'calendario' })
export class Calendario extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_calendario' })
  idCalendario!: number

  @Column({ name: 'giornata', type: 'smallint' })
  giornata!: number

  @Column({ name: 'id_torneo', type: 'int' })
  idTorneo!: number

  @Column({ name: 'giornata_serie_a', type: 'smallint' })
  giornataSerieA!: number

  @Column({ name: 'ordine', type: 'smallint' })
  ordine!: number

  @Column({ name: 'has_sovrapposta', type: 'boolean', default: false })
  hasSovrapposta!: boolean

  @Column({ name: 'has_giocata', type: 'boolean', default: false })
  hasGiocata!: boolean

  @Column({ name: 'has_da_recuperare', type: 'boolean', default: false })
  hasDaRecuperare!: boolean

  @Column({
    name: 'data',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    nullable: true,
  })
  data!: Date | null

  @Column({ name: 'girone', type: 'smallint', nullable: true })
  girone!: number | null

  @Column({ name: 'data_fine', type: 'timestamptz', nullable: true })
  dataFine!: Date | null

  @ManyToOne(() => Torneo, (t: Torneo) => t.Calendari, {
    onUpdate: 'NO ACTION',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_torneo',
    foreignKeyConstraintName: 'FK_Calendario_Tornei',
  })
  Torneo!: Relation<Torneo>

  @OneToMany(() => Partita, (p: Partita) => p.Calendario)
  Partite!: Relation<Partita[]>

  @OneToMany(() => Voto, (v: Voto) => v.Calendario)
  Voti!: Relation<Voto[]>
}
