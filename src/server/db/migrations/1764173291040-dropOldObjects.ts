import { MigrationInterface, QueryRunner } from 'typeorm'

export class DropOldObjects1764173291040 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP SEQUENCE IF EXISTS public."AlboTrofei_new_id_seq"`,
    )

    await queryRunner.query(
      `DROP SEQUENCE IF EXISTS public."Calendario_idCalendario_seq"`,
    )
    await queryRunner.query(
      `DROP SEQUENCE IF EXISTS public."Classifiche_id_seq"`,
    )
    await queryRunner.query(
      `DROP SEQUENCE IF EXISTS public."FlowNewSeasosn_id_seq"`,
    )
    await queryRunner.query(
      `DROP SEQUENCE IF EXISTS public."Formazioni_idFormazione_seq"`,
    )
    await queryRunner.query(
      `DROP SEQUENCE IF EXISTS public."Giocatori_idGiocatore_seq"`,
    )
    await queryRunner.query(
      `DROP SEQUENCE IF EXISTS public."Partite_idPartita_seq"`,
    )
    await queryRunner.query(
      `DROP SEQUENCE IF EXISTS public."SerieA_idSerieA_seq"`,
    )
    await queryRunner.query(`DROP SEQUENCE IF EXISTS public."SerieA_id_seq"`)
    await queryRunner.query(
      `DROP SEQUENCE IF EXISTS public."SquadreSerieA_idSquadraSerieA_seq"`,
    )
    await queryRunner.query(`DROP SEQUENCE IF EXISTS public."StatsA_id_seq"`)
    await queryRunner.query(`DROP SEQUENCE IF EXISTS public."StatsC_id_seq"`)
    await queryRunner.query(`DROP SEQUENCE IF EXISTS public."StatsD_id_seq"`)
    await queryRunner.query(`DROP SEQUENCE IF EXISTS public."StatsP_id_seq"`)
    await queryRunner.query(
      `DROP SEQUENCE IF EXISTS public."Tornei_idTorneo_seq"`,
    )
    await queryRunner.query(
      `DROP SEQUENCE IF EXISTS public."Trasferimenti_idTrasferimento_seq"`,
    )
    await queryRunner.query(
      `DROP SEQUENCE IF EXISTS public."Utenti_idUtente_seq"`,
    )
    await queryRunner.query(`DROP SEQUENCE IF EXISTS public."Voti_idVoto_seq"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE SEQUENCE public."AlboTrofei_new_id_seq"
            INCREMENT BY 1
            MINVALUE 1
            MAXVALUE 9223372036854775807
            START WITH 1
            CACHE 1`)

    await queryRunner.query(`CREATE SEQUENCE public."Calendario_idCalendario_seq"
            INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1`)

    await queryRunner.query(`CREATE SEQUENCE public."Classifiche_id_seq"
            INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1`)

    await queryRunner.query(`CREATE SEQUENCE public."FlowNewSeasosn_id_seq"
            INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1`)

    await queryRunner.query(`CREATE SEQUENCE public."Formazioni_idFormazione_seq"
            INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1`)

    await queryRunner.query(`CREATE SEQUENCE public."Giocatori_idGiocatore_seq"
            INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1`)

    await queryRunner.query(`CREATE SEQUENCE public."Partite_idPartita_seq"
            INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1`)

    await queryRunner.query(`CREATE SEQUENCE public."SerieA_idSerieA_seq"
            INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1`)

    await queryRunner.query(`CREATE SEQUENCE public."SerieA_id_seq"
            INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1`)

    await queryRunner.query(`CREATE SEQUENCE public."SquadreSerieA_idSquadraSerieA_seq"
            INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1`)

    await queryRunner.query(`CREATE SEQUENCE public."StatsA_id_seq"
            INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1`)

    await queryRunner.query(`CREATE SEQUENCE public."StatsC_id_seq"
            INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1`)

    await queryRunner.query(`CREATE SEQUENCE public."StatsD_id_seq"
            INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1`)

    await queryRunner.query(`CREATE SEQUENCE public."StatsP_id_seq"
            INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1`)

    await queryRunner.query(`CREATE SEQUENCE public."Tornei_idTorneo_seq"
            INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1`)

    await queryRunner.query(`CREATE SEQUENCE public."Trasferimenti_idTrasferimento_seq"
            INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1`)

    await queryRunner.query(`CREATE SEQUENCE public."Utenti_idUtente_seq"
            INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1`)

    await queryRunner.query(`CREATE SEQUENCE public."Voti_idVoto_seq"
            INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1`)
  }
}
