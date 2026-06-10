import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  type Relation,
  BaseEntity,
} from 'typeorm'
import { Trasferimento } from './Trasferimento'
import { Voto } from './Voto'
import { PropostaMercato } from './PropostaMercato'

@Entity({ name: 'giocatore' })
export class Giocatore extends BaseEntity {
  @PrimaryGeneratedColumn({ name: 'id_giocatore' })
  idGiocatore!: number

  @Column({ name: 'ruolo', type: 'varchar', length: 1 })
  ruolo!: string

  @Column({ name: 'nome', type: 'varchar', length: 50, unique: true })
  nome!: string

  @Column({
    name: 'nome_fanta_gazzetta',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  nomeFantaGazzetta!: string | null

  @Column({ name: 'id_pf', type: 'int', nullable: true })
  id_pf!: number | null

  @OneToMany(() => Trasferimento, (t: Trasferimento) => t.Giocatore)
  Trasferimenti!: Relation<Trasferimento[]>

  @OneToMany(() => Voto, (v: Voto) => v.Giocatore)
  Voti!: Relation<Voto[]>

  @OneToMany(() => PropostaMercato, (p: PropostaMercato) => p.Giocatore)
  ProposteMercato!: Relation<PropostaMercato[]>
}
