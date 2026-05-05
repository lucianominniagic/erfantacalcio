import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('serie_a', { schema: 'public' })
export class SerieA extends BaseEntity {
  @PrimaryGeneratedColumn({ type: 'integer', name: 'id_serie_a' })
  idSerieA!: number

  @Column('smallint', { name: 'giornata' })
  giornata!: number

  @Column('character varying', { name: 'squadra_home', length: 50 })
  squadraHome!: string

  @Column('character varying', { name: 'squadra_away', length: 50 })
  squadraAway!: string
}
