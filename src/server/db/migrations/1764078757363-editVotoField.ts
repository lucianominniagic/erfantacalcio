import { MigrationInterface, QueryRunner } from 'typeorm'

export class EditVotoField1764078757363 implements MigrationInterface {
  name = 'EditVotoField1764078757363'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "Voti" SET "voto" = 0 WHERE "voto" IS NULL`)
    await queryRunner.query(
      `ALTER TABLE "Voti" ALTER COLUMN "voto" SET NOT NULL`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Voti" ALTER COLUMN "voto" DROP NOT NULL`,
    )
  }
}
