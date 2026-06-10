import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  type Relation,
  BaseEntity,
} from 'typeorm'
import { Trasferimento } from './Trasferimento'

@Entity({ name: 'squadra_serie_a' })
export class SquadraSerieA extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_squadra_serie_a' })
  idSquadraSerieA!: number

  @Column({ name: 'nome', type: 'varchar', length: 50 })
  nome!: string

  @Column({ name: 'maglia', type: 'varchar', length: 50 })
  maglia!: string

  @OneToMany(() => Trasferimento, (t: Trasferimento) => t.SquadraSerieA)
  Trasferimenti!: Relation<Trasferimento[]>
}
