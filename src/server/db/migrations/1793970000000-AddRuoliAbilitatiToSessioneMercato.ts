import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddRuoliAbilitatiToSessioneMercato1793970000000 implements MigrationInterface {
  name = 'AddRuoliAbilitatiToSessioneMercato1793970000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "sessione_mercato"
      ADD COLUMN "ruoli_abilitati" character varying(1)[] NOT NULL DEFAULT '{}'
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "sessione_mercato"
      DROP COLUMN "ruoli_abilitati"
    `)
  }
}
