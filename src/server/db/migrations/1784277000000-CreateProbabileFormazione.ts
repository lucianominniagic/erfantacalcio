import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateProbabileFormazione1784277000000 implements MigrationInterface {
  name = 'CreateProbabileFormazione1784277000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── probabile_formazione ──────────────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "probabile_formazione" (
        "id_probabile_formazione" serial NOT NULL,
        "giornata_serie_a"        smallint NOT NULL,
        "partita"                 varchar(100) NOT NULL,
        "fetched_at"              timestamptz NOT NULL,
        CONSTRAINT "PK_probabile_formazione"
          PRIMARY KEY ("id_probabile_formazione")
      )
    `)

    // ── probabile_formazione_giocatore ────────────────────────────────────────
    await queryRunner.query(`
      CREATE TABLE "probabile_formazione_giocatore" (
        "id_probabile_formazione_giocatore" serial NOT NULL,
        "id_probabile_formazione"           int NOT NULL,
        "id_giocatore"                      int,
        "nome_giocatore"                    varchar(100) NOT NULL,
        "squadra"                           varchar(50) NOT NULL,
        "ruolo"                             varchar(1) NOT NULL,
        "probabilita"                       smallint NOT NULL,
        "stato"                             varchar(50) NOT NULL,
        CONSTRAINT "PK_probabile_formazione_giocatore"
          PRIMARY KEY ("id_probabile_formazione_giocatore")
      )
    `)

    // ── foreign keys ──────────────────────────────────────────────────────────
    await queryRunner.query(`
      ALTER TABLE "probabile_formazione_giocatore"
        ADD CONSTRAINT "FK_ProbabileFormazioneGiocatori_ProbabileFormazione"
        FOREIGN KEY ("id_probabile_formazione")
        REFERENCES "probabile_formazione" ("id_probabile_formazione")
        ON DELETE CASCADE ON UPDATE NO ACTION
    `)

    await queryRunner.query(`
      ALTER TABLE "probabile_formazione_giocatore"
        ADD CONSTRAINT "FK_ProbabileFormazioneGiocatori_Giocatori"
        FOREIGN KEY ("id_giocatore")
        REFERENCES "giocatore" ("id_giocatore")
        ON DELETE SET NULL ON UPDATE NO ACTION
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "probabile_formazione_giocatore"
        DROP CONSTRAINT "FK_ProbabileFormazioneGiocatori_Giocatori"
    `)
    await queryRunner.query(`
      ALTER TABLE "probabile_formazione_giocatore"
        DROP CONSTRAINT "FK_ProbabileFormazioneGiocatori_ProbabileFormazione"
    `)
    await queryRunner.query(`DROP TABLE "probabile_formazione_giocatore"`)
    await queryRunner.query(`DROP TABLE "probabile_formazione"`)
  }
}
