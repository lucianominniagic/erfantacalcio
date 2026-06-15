import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  type Relation,
  JoinColumn,
  BaseEntity,
} from 'typeorm'
import { SessioneMercato } from './SessioneMercato'
import { Utente } from './Utente'
import { Giocatore } from './Giocatore'

@Entity({ name: 'proposta_mercato' })
export class PropostaMercato extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_proposta_mercato' })
  id!: number

  @Column({ name: 'id_sessione', type: 'int' })
  idSessione!: number

  @Column({ name: 'id_squadra', type: 'int' })
  idSquadra!: number

  @Column({ name: 'id_giocatore', type: 'int' })
  idGiocatore!: number

  @Column({ name: 'prezzo_offerto', type: 'decimal', precision: 9, scale: 2 })
  prezzoOfferto!: number

  @Column({ name: 'priorita', type: 'smallint' })
  priorita!: number

  @Column({
    name: 'created_at',
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date

  @Column({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null

  @ManyToOne(
    () => SessioneMercato,
    (s: SessioneMercato) => s.ProposteMercato,
    { onDelete: 'CASCADE', onUpdate: 'NO ACTION' },
  )
  @JoinColumn({
    name: 'id_sessione',
    foreignKeyConstraintName: 'FK_PropostaMercato_SessioneMercato',
  })
  SessioneMercato!: Relation<SessioneMercato>

  @ManyToOne(() => Utente, (u: Utente) => u.ProposteMercato, {
    onDelete: 'RESTRICT',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({
    name: 'id_squadra',
    foreignKeyConstraintName: 'FK_PropostaMercato_Utenti',
  })
  Utente!: Relation<Utente>

  @ManyToOne(() => Giocatore, (g: Giocatore) => g.ProposteMercato, {
    onDelete: 'RESTRICT',
    onUpdate: 'NO ACTION',
  })
  @JoinColumn({
    name: 'id_giocatore',
    foreignKeyConstraintName: 'FK_PropostaMercato_Giocatori',
  })
  Giocatore!: Relation<Giocatore>
}
