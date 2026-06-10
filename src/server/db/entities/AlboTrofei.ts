import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity('albo_trofei', { schema: 'public' })
export class AlboTrofei extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'integer',
    name: 'id',
    primaryKeyConstraintName: 'PK_AlboTrofei_new',
  })
  id!: number

  @Column('character varying', { name: 'stagione', length: 9 })
  stagione!: string

  @Column('character varying', { name: 'campionato', length: 50 })
  campionato!: string

  @Column('character varying', { name: 'champions', length: 50 })
  champions!: string

  @Column('character varying', { name: 'secondo', length: 50 })
  secondo!: string

  @Column('character varying', { name: 'terzo', length: 50 })
  terzo!: string
}
