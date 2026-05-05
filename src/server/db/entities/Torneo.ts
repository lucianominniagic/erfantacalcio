import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  type Relation,
  BaseEntity,
} from 'typeorm'
import { Calendario } from './Calendario'
import { Classifica } from './Classifica'

@Entity({ name: 'torneo' })
export class Torneo extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_torneo' })
  idTorneo!: number

  @Column({ name: 'nome', type: 'varchar', length: 50 })
  nome!: string

  @Column({ name: 'gruppo_fase', type: 'varchar', length: 50, nullable: true })
  gruppoFase!: string | null

  @Column({ name: 'has_classifica', type: 'boolean' })
  hasClassifica!: boolean

  @OneToMany(() => Calendario, (c: Calendario) => c.Torneo)
  Calendari!: Relation<Calendario[]>

  @OneToMany(() => Classifica, (c: Classifica) => c.Torneo)
  Classifiche!: Relation<Classifica[]>
}
