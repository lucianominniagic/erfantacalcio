import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  type Relation,
  JoinColumn,
  BaseEntity,
} from 'typeorm'
import { Giocatore } from './Giocatore'
import { SquadraSerieA } from './SquadraSerieA'
import { Utente } from './Utente'

@Entity({ name: 'trasferimento' })
export class Trasferimento extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_trasferimento' })
  idTrasferimento!: number

  @Column({ name: 'id_giocatore', type: 'int' })
  idGiocatore!: number

  @Column({ name: 'id_squadra_serie_a', type: 'int', nullable: true })
  idSquadraSerieA!: number | null

  @Column({
    name: 'data_acquisto',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  dataAcquisto!: Date

  @Column({ name: 'data_cessione', type: 'timestamptz', nullable: true })
  dataCessione!: Date | null

  @Column({ name: 'id_squadra', type: 'int', nullable: true })
  idSquadra!: number | null

  @Column({ name: 'costo', type: 'smallint' })
  costo!: number

  @Column({ name: 'stagione', type: 'varchar', length: 9 })
  stagione!: string

  @Column({ name: 'has_ritirato', type: 'boolean', default: false })
  hasRitirato!: boolean

  @Column({
    name: 'nome_squadra_serie_a',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  nomeSquadraSerieA!: string | null

  @Column({ name: 'nome_squadra', type: 'varchar', length: 50, nullable: true })
  nomeSquadra!: string | null

  @Column({
    name: 'media',
    type: 'decimal',
    precision: 9,
    scale: 2,
    nullable: true,
  })
  media!: number | null

  @Column({ name: 'gol', type: 'smallint', nullable: true })
  gol!: number | null

  @Column({ name: 'assist', type: 'smallint', nullable: true })
  assist!: number | null

  @Column({ name: 'giocate', type: 'smallint', nullable: true })
  giocate!: number | null

  @ManyToOne(() => Giocatore, (g: Giocatore) => g.Trasferimenti, {
    onDelete: 'RESTRICT',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({
    name: 'id_giocatore',
    foreignKeyConstraintName: 'FK_Trasferimenti_Giocatori',
  })
  Giocatore!: Relation<Giocatore>

  @ManyToOne(() => SquadraSerieA, (s: SquadraSerieA) => s.Trasferimenti, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
    nullable: true,
  })
  @JoinColumn({
    name: 'id_squadra_serie_a',
    foreignKeyConstraintName: 'FK_Trasferimenti_SquadreSerieA',
  })
  SquadraSerieA?: Relation<SquadraSerieA | null>

  @ManyToOne(() => Utente, (u: Utente) => u.Trasferimenti, {
    onDelete: 'NO ACTION',
    onUpdate: 'NO ACTION',
    nullable: true,
  })
  @JoinColumn({
    name: 'id_squadra',
    foreignKeyConstraintName: 'FK_Trasferimenti_Utenti',
  })
  Utente?: Relation<Utente | null>
}
