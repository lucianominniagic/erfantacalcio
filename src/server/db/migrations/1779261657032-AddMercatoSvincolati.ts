import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMercatoSvincolati1779261657032 implements MigrationInterface {
    name = 'AddMercatoSvincolati1779261657032'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "sessione_mercato" (
                "id_sessione_mercato" SERIAL NOT NULL,
                "data_apertura" TIMESTAMP WITH TIME ZONE NOT NULL,
                "data_chiusura" TIMESTAMP WITH TIME ZONE NOT NULL,
                "max_proposte" smallint NOT NULL,
                "tipo_valuta" character varying(20) NOT NULL DEFAULT 'fantamilioni',
                CONSTRAINT "PK_sessione_mercato" PRIMARY KEY ("id_sessione_mercato")
            )
        `);

        await queryRunner.query(`
            CREATE TABLE "proposta_mercato" (
                "id_proposta_mercato" SERIAL NOT NULL,
                "id_sessione" integer NOT NULL,
                "id_squadra" integer NOT NULL,
                "id_giocatore" integer NOT NULL,
                "prezzo_offerto" numeric(9,2) NOT NULL,
                "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "deleted_at" TIMESTAMP WITH TIME ZONE,
                CONSTRAINT "PK_proposta_mercato" PRIMARY KEY ("id_proposta_mercato")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "proposta_mercato"
                ADD CONSTRAINT "FK_PropostaMercato_SessioneMercato"
                FOREIGN KEY ("id_sessione")
                REFERENCES "sessione_mercato"("id_sessione_mercato")
                ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "proposta_mercato"
                ADD CONSTRAINT "FK_PropostaMercato_Utenti"
                FOREIGN KEY ("id_squadra")
                REFERENCES "utente"("id_utente")
                ON DELETE RESTRICT ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "proposta_mercato"
                ADD CONSTRAINT "FK_PropostaMercato_Giocatori"
                FOREIGN KEY ("id_giocatore")
                REFERENCES "giocatore"("id_giocatore")
                ON DELETE RESTRICT ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "proposta_mercato" DROP CONSTRAINT "FK_PropostaMercato_Giocatori"`);
        await queryRunner.query(`ALTER TABLE "proposta_mercato" DROP CONSTRAINT "FK_PropostaMercato_Utenti"`);
        await queryRunner.query(`ALTER TABLE "proposta_mercato" DROP CONSTRAINT "FK_PropostaMercato_SessioneMercato"`);
        await queryRunner.query(`DROP TABLE "proposta_mercato"`);
        await queryRunner.query(`DROP TABLE "sessione_mercato"`);
    }
}
