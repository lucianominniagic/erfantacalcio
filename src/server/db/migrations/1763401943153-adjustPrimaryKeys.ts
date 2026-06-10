import { MigrationInterface, QueryRunner } from 'typeorm'

export class AdjustPrimaryKeys1763401943153 implements MigrationInterface {
  name = 'AdjustPrimaryKeys1763401943153'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IX_StatsP_id"`)
    await queryRunner.query(`DROP INDEX "public"."PK_StatsP"`)
    await queryRunner.query(`DROP INDEX "public"."IX_StatsA_id"`)
    await queryRunner.query(`DROP INDEX "public"."PK_StatsA"`)
    await queryRunner.query(`DROP INDEX "public"."IX_StatsD_id"`)
    await queryRunner.query(`DROP INDEX "public"."PK_StatsD"`)
    await queryRunner.query(`DROP INDEX "public"."IX_StatsC_id"`)
    await queryRunner.query(`DROP INDEX "public"."PK_StatsC"`)
    await queryRunner.query(`DROP INDEX "public"."IX_FlowSeason_id"`)
    await queryRunner.query(`DROP INDEX "public"."PK_FlowNewSeason"`)
    await queryRunner.query(`DROP INDEX "public"."PK_AlboTrofei_new"`)
    await queryRunner.query(
      `ALTER TABLE "StatsP" ADD CONSTRAINT "PK_StatsP" PRIMARY KEY ("id")`,
    )
    await queryRunner.query(
      `ALTER TABLE "StatsA" ADD CONSTRAINT "PK_StatsA" PRIMARY KEY ("id")`,
    )
    await queryRunner.query(
      `ALTER TABLE "StatsD" ADD CONSTRAINT "PK_StatsD" PRIMARY KEY ("id")`,
    )
    await queryRunner.query(
      `ALTER TABLE "StatsC" ADD CONSTRAINT "PK_StatsC" PRIMARY KEY ("id")`,
    )
    await queryRunner.query(
      `ALTER TABLE "FlowNewSeasosn" ADD CONSTRAINT "PK_FlowNewSeason" PRIMARY KEY ("id")`,
    )
    await queryRunner.query(
      `ALTER TABLE "AlboTrofei_new" ADD CONSTRAINT "PK_AlboTrofei_new" PRIMARY KEY ("id")`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "AlboTrofei_new" DROP CONSTRAINT "PK_AlboTrofei_new"`,
    )
    await queryRunner.query(
      `ALTER TABLE "FlowNewSeasosn" DROP CONSTRAINT "PK_FlowNewSeason"`,
    )
    await queryRunner.query(`ALTER TABLE "StatsC" DROP CONSTRAINT "PK_StatsC"`)
    await queryRunner.query(`ALTER TABLE "StatsD" DROP CONSTRAINT "PK_StatsD"`)
    await queryRunner.query(`ALTER TABLE "StatsA" DROP CONSTRAINT "PK_StatsA"`)
    await queryRunner.query(`ALTER TABLE "StatsP" DROP CONSTRAINT "PK_StatsP"`)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "PK_AlboTrofei_new" ON "AlboTrofei_new" ("id") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "PK_FlowNewSeason" ON "FlowNewSeasosn" ("id") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_FlowSeason_id" ON "FlowNewSeasosn" ("id") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "PK_StatsC" ON "StatsC" ("id") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_StatsC_id" ON "StatsC" ("id") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "PK_StatsD" ON "StatsD" ("id") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_StatsD_id" ON "StatsD" ("id") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "PK_StatsA" ON "StatsA" ("id") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_StatsA_id" ON "StatsA" ("id") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "PK_StatsP" ON "StatsP" ("id") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_StatsP_id" ON "StatsP" ("id") `,
    )
  }
}
