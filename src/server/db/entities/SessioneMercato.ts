import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  type Relation,
  BaseEntity,
} from 'typeorm'
import { PropostaMercato } from './PropostaMercato'

@Entity({ name: 'sessione_mercato' })
export class SessioneMercato extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_sessione_mercato' })
  id!: number

  @Column({ name: 'data_apertura', type: 'timestamptz' })
  dataApertura!: Date

  @Column({ name: 'data_chiusura', type: 'timestamptz' })
  dataChiusura!: Date

  @Column({ name: 'max_proposte', type: 'smallint' })
  maxProposte!: number

  @Column({ name: 'acquisti_effettivi', type: 'smallint' })
  acquistiEffettivi!: number

  @Column({
    name: 'tipo_valuta',
    type: 'varchar',
    length: 20,
    default: 'fantamilioni',
  })
  tipoValuta!: 'fantamilioni' | 'euro'

  @OneToMany(() => PropostaMercato, (p: PropostaMercato) => p.SessioneMercato)
  ProposteMercato!: Relation<PropostaMercato[]>
}
