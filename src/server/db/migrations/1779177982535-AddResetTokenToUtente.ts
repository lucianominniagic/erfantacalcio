import { MigrationInterface, QueryRunner } from "typeorm";

export class AddResetTokenToUtente1779177982535 implements MigrationInterface {
    name = 'AddResetTokenToUtente1779177982535'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "utente" ADD "reset_token" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "utente" ADD "reset_token_expires_at" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "utente" DROP COLUMN "reset_token_expires_at"`);
        await queryRunner.query(`ALTER TABLE "utente" DROP COLUMN "reset_token"`);
    }

}
