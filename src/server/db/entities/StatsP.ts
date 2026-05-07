import {
  BaseEntity,
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm'

@Entity('stats_p', { schema: 'public' })
export class StatsP extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'integer',
    name: 'id',
    primaryKeyConstraintName: 'PK_StatsP',
  })
  id!: number

  @Column('numeric', { name: 'media', nullable: true, precision: 38, scale: 6 })
  media?: string | null

  @Column('numeric', {
    name: 'mediabonus',
    nullable: true,
    precision: 38,
    scale: 6,
  })
  mediabonus?: string | null

  @Column('numeric', {
    name: 'golfatti',
    nullable: true,
    precision: 38,
    scale: 6,
  })
  golfatti?: string | null

  @Column('numeric', {
    name: 'golsubiti',
    nullable: true,
    precision: 38,
    scale: 1,
  })
  golsubiti?: string | null

  @Column('numeric', {
    name: 'ammonizioni',
    nullable: true,
    precision: 38,
    scale: 6,
  })
  ammonizioni?: string | null

  @Column('numeric', {
    name: 'espulsioni',
    nullable: true,
    precision: 38,
    scale: 6,
  })
  espulsioni?: string | null

  @Column('numeric', {
    name: 'assist',
    nullable: true,
    precision: 38,
    scale: 1,
  })
  assist?: string | null

  @Column('integer', { name: 'giocate', nullable: true })
  giocate?: number | null

  @Column('character varying', { name: 'ruolo', length: 1 })
  ruolo!: string

  @Column('character varying', { name: 'nome', length: 50 })
  nome!: string

  @Column('character varying', {
    name: 'nomefantagazzetta',
    nullable: true,
    length: 500,
  })
  nomefantagazzetta?: string | null

  @Column('integer', { name: 'idgiocatore' })
  idgiocatore!: number

  @Column('character varying', { name: 'maglia', length: 50 })
  maglia!: string

  @Column('character varying', { name: 'squadra_serie_a', length: 50 })
  squadraSerieA!: string

  @Column('character varying', { name: 'squadra', nullable: true, length: 50 })
  squadra?: string | null

  @Column('integer', { name: 'id_squadra', nullable: true })
  idSquadra?: number | null
}
