import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  type Relation,
  BaseEntity,
} from 'typeorm'
import { Formazione } from './Formazione'
import { Calendario } from './Calendario'
import { Utente } from './Utente'

@Entity({ name: 'partita' })
export class Partita extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_partita' })
  idPartita!: number

  @Column({ name: 'id_calendario', type: 'int' })
  idCalendario!: number

  @Column({ name: 'id_squadra_home', type: 'int', nullable: true })
  idSquadraH!: number | null

  @Column({ name: 'id_squadra_away', type: 'int', nullable: true })
  idSquadraA!: number | null

  @Column({ name: 'punti_home', type: 'smallint', nullable: true })
  puntiH!: number | null

  @Column({ name: 'punti_away', type: 'smallint', nullable: true })
  puntiA!: number | null

  @Column({ name: 'gol_home', type: 'smallint', nullable: true })
  golH!: number | null

  @Column({ name: 'gol_away', type: 'smallint', nullable: true })
  golA!: number | null

  @Column({ name: 'has_multa_home', type: 'boolean', default: false })
  hasMultaH!: boolean

  @Column({ name: 'has_multa_away', type: 'boolean', default: false })
  hasMultaA!: boolean

  @Column({
    name: 'punteggio_home',
    type: 'decimal',
    precision: 9,
    scale: 2,
    nullable: true,
  })
  punteggioH!: number | null

  @Column({
    name: 'punteggio_away',
    type: 'decimal',
    precision: 9,
    scale: 2,
    nullable: true,
  })
  punteggioA!: number | null

  @Column({ name: 'fattore_casalingo', type: 'boolean', default: false })
  fattoreCasalingo!: boolean

  @OneToMany(() => Formazione, (f: Formazione) => f.Partita)
  Formazioni!: Relation<Formazione[]>

  @ManyToOne(() => Calendario, (c: Calendario) => c.Partite, {
    onUpdate: 'NO ACTION',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_calendario',
    foreignKeyConstraintName: 'FK_Partite_Calendario',
  })
  Calendario!: Relation<Calendario>

  @ManyToOne(() => Utente, (u: Utente) => u.PartiteHome, {
    onUpdate: 'NO ACTION',
    onDelete: 'NO ACTION',
  })
  @JoinColumn({
    name: 'id_squadra_home',
    foreignKeyConstraintName: 'FK_Partite_SquadreCasa',
  })
  SquadraHome!: Relation<Utente | null>

  @ManyToOne(() => Utente, (u: Utente) => u.PartiteAway, {
    onUpdate: 'NO ACTION',
    onDelete: 'NO ACTION',
  })
  @JoinColumn({
    name: 'id_squadra_away',
    foreignKeyConstraintName: 'FK_Partite_SquadreTrasferta',
  })
  SquadraAway!: Relation<Utente | null>
}
