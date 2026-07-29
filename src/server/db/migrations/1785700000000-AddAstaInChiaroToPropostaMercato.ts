import { MigrationInterface, QueryRunner } from 'typeorm'

/**
 * Denormalizza `asta_in_chiaro` su `proposta_mercato` e riscrive il partial
 * unique index sulla priorità in modo che si applichi **solo** alle sessioni
 * al buio (dove la priorità è semanticamente significativa).
 *
 * Motivazione:
 *   Nelle sessioni `asta_in_chiaro`, ogni offerta viene inserita con `priorita = 1`
 *   (valore fisso, semanticamente neutro). L'indice precedente
 *   `UQ_proposta_mercato_priorita_active` — definito su
 *   `(id_sessione, id_squadra, priorita) WHERE deleted_at IS NULL` — causava una
 *   unique violation alla seconda offerta della stessa squadra su un giocatore
 *   diverso all'interno della stessa sessione in chiaro, perché entrambe le righe
 *   avrebbero `priorita = 1` e `deleted_at IS NULL`.
 *
 *   Un partial index su `proposta_mercato` non può filtrare per tipo-sessione
 *   senza denormalizzazione, quindi introduciamo la colonna `asta_in_chiaro`
 *   (speculare a `sessione_mercato.asta_in_chiaro`) e restringiamo il vincolo
 *   alle righe con `asta_in_chiaro = false`.
 */
export class AddAstaInChiaroToPropostaMercato1785700000000
  implements MigrationInterface
{
  name = 'AddAstaInChiaroToPropostaMercato1785700000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── 1. Rimuove l'indice esistente ────────────────────────────────────────
    await queryRunner.query(`
      DROP INDEX "UQ_proposta_mercato_priorita_active"
    `)

    // ── 2. Aggiunge la colonna discriminante (nullable per il backfill) ──────
    await queryRunner.query(`
      ALTER TABLE "proposta_mercato"
      ADD COLUMN "asta_in_chiaro" boolean
    `)

    // ── 3. Backfill: copia il valore dalla sessione padre ────────────────────
    await queryRunner.query(`
      UPDATE "proposta_mercato" p
      SET "asta_in_chiaro" = s."asta_in_chiaro"
      FROM "sessione_mercato" s
      WHERE s."id_sessione_mercato" = p."id_sessione"
    `)

    // ── 4. Rende NOT NULL con default false (coerente con SessioneMercato) ───
    await queryRunner.query(`
      ALTER TABLE "proposta_mercato"
      ALTER COLUMN "asta_in_chiaro" SET NOT NULL,
      ALTER COLUMN "asta_in_chiaro" SET DEFAULT false
    `)

    // ── 5. Ricrea l'indice escludendo le righe astaInChiaro ──────────────────
    //    La priorità è univoca solo nelle sessioni al buio; nelle sessioni
    //    in chiaro `priorita = 1` è un placeholder fisso non significativo.
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_proposta_mercato_priorita_active"
      ON "proposta_mercato" ("id_sessione", "id_squadra", "priorita")
      WHERE "deleted_at" IS NULL
        AND "asta_in_chiaro" = false
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ── Ripristina lo stato precedente ───────────────────────────────────────
    await queryRunner.query(`
      DROP INDEX "UQ_proposta_mercato_priorita_active"
    `)

    await queryRunner.query(`
      ALTER TABLE "proposta_mercato"
      DROP COLUMN "asta_in_chiaro"
    `)

    // Ricrea l'indice originale (senza discriminante astaInChiaro).
    // ATTENZIONE: il down fallirà se esistono righe duplicate
    // (stessa sessione, squadra, priorita=1, deleted_at IS NULL) create
    // da sessioni in chiaro. Eliminare tali righe manualmente o accettare
    // che il rollback non sia applicabile con dati in chiaro esistenti.
    await queryRunner.query(`
      CREATE UNIQUE INDEX "UQ_proposta_mercato_priorita_active"
      ON "proposta_mercato" ("id_sessione", "id_squadra", "priorita")
      WHERE "deleted_at" IS NULL
    `)
  }
}
