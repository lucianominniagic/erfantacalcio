import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterUtentePwdLength1777985479899 implements MigrationInterface {
    name = 'AlterUtentePwdLength1777985479899'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "utente" ALTER COLUMN "pwd" TYPE character varying(100)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "utente" ALTER COLUMN "pwd" TYPE character varying(50)`);
    }

}
