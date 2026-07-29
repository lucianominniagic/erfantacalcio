import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddAstaInChiaroToSessioneMercato1784900000000
  implements MigrationInterface
{
  name = 'AddAstaInChiaroToSessioneMercato1784900000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "sessione_mercato"
      ADD COLUMN "asta_in_chiaro" boolean NOT NULL DEFAULT false
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "sessione_mercato"
      DROP COLUMN "asta_in_chiaro"
    `)
  }
}
