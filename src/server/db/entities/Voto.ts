import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  Unique,
  Index,
  type Relation,
  JoinColumn,
  BaseEntity,
} from 'typeorm'
import { Formazione } from './Formazione'
import { Calendario } from './Calendario'
import { Giocatore } from './Giocatore'

@Entity({ name: 'voto' })
@Unique('UQ_Voti_Calendario_Giocatore', ['idCalendario', 'idGiocatore'])
export class Voto extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_voto' })
  idVoto!: number

  @Column({ name: 'id_giocatore', type: 'int' })
  idGiocatore!: number

  @Column({ name: 'id_calendario', type: 'int' })
  idCalendario!: number

  @Column({ name: 'id_formazione', type: 'int', nullable: true })
  idFormazione!: number | null

  @Column({
    name: 'voto',
    type: 'decimal',
    precision: 5,
    scale: 2,
  })
  voto!: number

  @Column({
    name: 'ammonizione',
    type: 'decimal',
    precision: 5,
    scale: 1,
    default: 0,
  })
  ammonizione!: number

  @Column({
    name: 'espulsione',
    type: 'decimal',
    precision: 5,
    scale: 1,
    default: 0,
  })
  espulsione!: number

  @Column({
    name: 'gol',
    type: 'decimal',
    precision: 5,
    scale: 1,
    default: 0,
    nullable: true,
  })
  gol!: number | null

  @Column({
    name: 'assist',
    type: 'decimal',
    precision: 5,
    scale: 1,
    default: 0,
    nullable: true,
  })
  assist!: number | null

  @Column({
    name: 'autogol',
    type: 'decimal',
    precision: 5,
    scale: 1,
    default: 0,
    nullable: true,
  })
  autogol!: number | null

  @Column({
    name: 'altri_bonus',
    type: 'decimal',
    precision: 5,
    scale: 1,
    default: 0,
    nullable: true,
  })
  altriBonus!: number | null

  @Column({ name: 'titolare', type: 'boolean', default: false })
  titolare!: boolean

  @Column({ name: 'riserva', type: 'smallint', nullable: true })
  riserva!: number | null

  @ManyToOne(() => Formazione, (f: Formazione) => f.Voti, {
    nullable: true,
    onUpdate: 'NO ACTION',
    onDelete: 'NO ACTION',
  })
  @JoinColumn({
    name: 'id_formazione',
    foreignKeyConstraintName: 'FK_Formazione_Giocatori',
  })
  Formazione?: Relation<Formazione | null>

  @ManyToOne(() => Calendario, (c: Calendario) => c.Voti, {
    onUpdate: 'NO ACTION',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_calendario',
    foreignKeyConstraintName: 'FK_Voti_Calendario',
  })
  Calendario!: Relation<Calendario>

  @ManyToOne(() => Giocatore, (g: Giocatore) => g.Voti, {
    onUpdate: 'NO ACTION',
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'id_giocatore',
    foreignKeyConstraintName: 'FK_Voti_Giocatori',
  })
  Giocatore!: Relation<Giocatore>
}
