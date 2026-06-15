import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddAcquistiEffettiviAndPrioritaMercato1781529837014
  implements MigrationInterface
{
  name = 'AddAcquistiEffettiviAndPrioritaMercato1781529837014'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── sessione_mercato.acquisti_effettivi ─────────────────────────────────
    // 1) Aggiungi colonna nullable per consentire il backfill.
    await queryRunner.query(`
      ALTER TABLE "sessione_mercato"
      ADD COLUMN "acquisti_effettivi" smallint
    `)

    // 2) Backfill: sessioni esistenti → acquisti_effettivi = max_proposte
    await queryRunner.query(`
      UPDATE "sessione_mercato"
      SET "acquisti_effettivi" = "max_proposte"
      WHERE "acquisti_effettivi" IS NULL
    `)

    // 3) Rendi NOT NULL e aggiungi CHECK constraint.
    await queryRunner.query(`
      ALTER TABLE "sessione_mercato"
      ALTER COLUMN "acquisti_effettivi" SET NOT NULL
    `)

    await queryRunner.query(`
      ALTER TABLE "sessione_mercato"
      ADD CONSTRAINT "CHK_sessione_mercato_acquisti_effettivi_range"
      CHECK ("acquisti_effettivi" >= 1 AND "acquisti_effettivi" <= "max_proposte")
    `)

    // ── proposta_mercato.priorita ────────────────────────────────────────────
    // 1) Aggiungi colonna nullable per consentire il backfill.
    await queryRunner.query(`
      ALTER TABLE "proposta_mercato"
      ADD COLUMN "priorita" smallint
    `)

    // 2) Backfill: per ogni (id_sessione, id_squadra) numera le proposte
    //    non-deleted in ordine created_at ASC partendo da 1.
    //    Le proposte deleted ricevono comunque un valore (per soddisfare
    //    NOT NULL) — quello che hanno avrebbe avuto al momento dell'insert.
    await queryRunner.query(`
      WITH ranked AS (
        SELECT
          "id_proposta_mercato",
          ROW_NUMBER() OVER (
            PARTITION BY "id_sessione", "id_squadra"
            ORDER BY "created_at" ASC, "id_proposta_mercato" ASC
          ) AS rn
        FROM "proposta_mercato"
        WHERE "deleted_at" IS NULL
      )
      UPDATE "proposta_mercato" p
      SET "priorita" = ranked.rn
      FROM ranked
      WHERE p."id_proposta_mercato" = ranked."id_proposta_mercato"
    `)

    // Le righe deleted: assegna priorità in modo deterministico (ordine inserimento)
    await queryRunner.query(`
      WITH ranked_deleted AS (
        SELECT
          "id_proposta_mercato",
          ROW_NUMBER() OVER (
            PARTITION BY "id_sessione", "id_squadra"
            ORDER BY "created_at" ASC, "id_proposta_mercato" ASC
          ) AS rn
        FROM "proposta_mercato"
        WHERE "deleted_at" IS NOT NULL
      )
      UPDATE "proposta_mercato" p
      SET "priorita" = ranked_deleted.rn
      FROM ranked_deleted
      WHERE p."id_proposta_mercato" = ranked_deleted."id_proposta_mercato"
        AND p."priorita" IS NULL
    `)

    // 3) Rendi NOT NULL.
    await queryRunner.query(`
      ALTER TABLE "proposta_mercato"
      ALTER COLUMN "priorita" SET NOT NULL
    `)

    // 4) Partial unique index: priorità univoca per (sessione, squadra) tra
    //    le proposte non-deleted. Permette riordini sicuri e blocca duplicati
    //    da insert concorrenti.
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_proposta_mercato_priorita_active"
      ON "proposta_mercato" ("id_sessione", "id_squadra", "priorita")
      WHERE "deleted_at" IS NULL
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "UQ_proposta_mercato_priorita_active"`,
    )
    await queryRunner.query(
      `ALTER TABLE "proposta_mercato" DROP COLUMN "priorita"`,
    )
    await queryRunner.query(
      `ALTER TABLE "sessione_mercato" DROP CONSTRAINT "CHK_sessione_mercato_acquisti_effettivi_range"`,
    )
    await queryRunner.query(
      `ALTER TABLE "sessione_mercato" DROP COLUMN "acquisti_effettivi"`,
    )
  }
}
