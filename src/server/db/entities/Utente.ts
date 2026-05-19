import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  type Relation,
  BaseEntity,
} from 'typeorm'
import { Trasferimento } from './Trasferimento'
import { Classifica } from './Classifica'
import { Formazione } from './Formazione'
import { Partita } from './Partita'

@Entity({ name: 'utente' })
export class Utente extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_utente' })
  idUtente!: number

  @Column({ name: 'username', type: 'varchar', length: 50 })
  username!: string

  @Column({ name: 'pwd', type: 'varchar', length: 100 })
  pwd!: string

  @Column({ name: 'admin_level', type: 'boolean', default: false })
  adminLevel!: boolean

  @Column({ name: 'presidente', type: 'varchar', length: 50 })
  presidente!: string

  @Column({ name: 'mail', type: 'varchar', length: 50 })
  mail!: string

  @Column({ name: 'nome_squadra', type: 'varchar', length: 50 })
  nomeSquadra!: string

  @Column({ name: 'foto', type: 'varchar', length: 500, nullable: true })
  foto!: string | null

  @Column({
    name: 'importo_base',
    type: 'decimal',
    precision: 9,
    scale: 2,
    default: 100,
  })
  importoBase!: number

  @Column({
    name: 'importo_multe',
    type: 'decimal',
    precision: 9,
    scale: 2,
    default: 0,
  })
  importoMulte!: number

  @Column({
    name: 'importo_mercato',
    type: 'decimal',
    precision: 9,
    scale: 2,
    default: 0,
  })
  importoMercato!: number

  @Column({
    name: 'fanta_milioni',
    type: 'decimal',
    precision: 9,
    scale: 2,
    default: 600,
  })
  fantaMilioni!: number

  @Column({ name: 'campionato', type: 'smallint', default: 0 })
  Campionato!: number

  @Column({ name: 'champions', type: 'smallint', default: 0 })
  Champions!: number

  @Column({ name: 'secondo', type: 'smallint', default: 0 })
  Secondo!: number

  @Column({ name: 'terzo', type: 'smallint', default: 0 })
  Terzo!: number

  @Column({ name: 'lock_level', type: 'boolean', default: false })
  lockLevel!: boolean

  @Column({ name: 'maglia', type: 'varchar', length: 500, nullable: true })
  maglia!: string | null

  @Column({ name: 'reset_token', type: 'varchar', length: 100, nullable: true })
  resetToken!: string | null

  @Column({ name: 'reset_token_expires_at', type: 'timestamp', nullable: true })
  resetTokenExpiresAt!: Date | null

  @OneToMany(() => Classifica, (c: Classifica) => c.Utente)
  Classifiche!: Relation<Classifica[]>

  @OneToMany(() => Formazione, (f: Formazione) => f.Utente)
  Formazioni!: Relation<Formazione[]>

  @OneToMany(() => Partita, (p: Partita) => p.SquadraHome)
  PartiteHome!: Relation<Partita[]>

  @OneToMany(() => Partita, (p: Partita) => p.SquadraAway)
  PartiteAway!: Relation<Partita[]>

  @OneToMany(() => Trasferimento, (t: Trasferimento) => t.Utente)
  Trasferimenti!: Relation<Trasferimento[]>
}
