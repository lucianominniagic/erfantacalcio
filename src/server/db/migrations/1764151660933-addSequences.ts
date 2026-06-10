import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSequences1764151660933 implements MigrationInterface {
  name = 'AddSequences1764151660933'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IX_Voti_StatsGiocatori2"`)
    await queryRunner.query(`DROP INDEX "public"."IX_Voti_StatsGiocatori"`)
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "albo_trofei_id_seq"`,
    )
    await queryRunner.query(
      `ALTER TABLE "albo_trofei" ALTER COLUMN "id" SET DEFAULT nextval('"albo_trofei_id_seq"')`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "albo_trofei_id_seq" OWNER TO "default"`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "albo_trofei_id_seq" OWNED BY "albo_trofei"."id"`,
    )
    await queryRunner.query(
      `ALTER TABLE "formazione" DROP CONSTRAINT "FK_Formazioni_Partite"`,
    )
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "partita_id_partita_seq"`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" ALTER COLUMN "id_partita" SET DEFAULT nextval('"partita_id_partita_seq"')`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "partita_id_partita_seq" OWNER TO "default"`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "partita_id_partita_seq" OWNED BY "partita"."id_partita"`,
    )
    await queryRunner.query(
      `ALTER TABLE "voto" DROP CONSTRAINT "FK_Formazione_Giocatori"`,
    )
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "formazione_id_formazione_seq"`,
    )
    await queryRunner.query(
      `ALTER TABLE "formazione" ALTER COLUMN "id_formazione" SET DEFAULT nextval('"formazione_id_formazione_seq"')`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "formazione_id_formazione_seq" OWNER TO "default"`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "formazione_id_formazione_seq" OWNED BY "formazione"."id_formazione"`,
    )
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "voto_id_voto_seq"`)
    await queryRunner.query(
      `ALTER TABLE "voto" ALTER COLUMN "id_voto" SET DEFAULT nextval('"voto_id_voto_seq"')`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "voto_id_voto_seq" OWNER TO "default"`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "voto_id_voto_seq" OWNED BY "voto"."id_voto"`,
    )
    await queryRunner.query(
      `ALTER TABLE "voto" DROP CONSTRAINT "FK_Voti_Giocatori"`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" DROP CONSTRAINT "FK_Trasferimenti_Giocatori"`,
    )
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "giocatore_id_giocatore_seq"`,
    )
    await queryRunner.query(
      `ALTER TABLE "giocatore" ALTER COLUMN "id_giocatore" SET DEFAULT nextval('"giocatore_id_giocatore_seq"')`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "giocatore_id_giocatore_seq" OWNER TO "default"`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "giocatore_id_giocatore_seq" OWNED BY "giocatore"."id_giocatore"`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" DROP CONSTRAINT "FK_Trasferimenti_SquadreSerieA"`,
    )
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "squadra_serie_a_id_squadra_serie_a_seq"`,
    )
    await queryRunner.query(
      `ALTER TABLE "squadra_serie_a" ALTER COLUMN "id_squadra_serie_a" SET DEFAULT nextval('"squadra_serie_a_id_squadra_serie_a_seq"')`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "squadra_serie_a_id_squadra_serie_a_seq" OWNER TO "default"`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "squadra_serie_a_id_squadra_serie_a_seq" OWNED BY "squadra_serie_a"."id_squadra_serie_a"`,
    )
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "trasferimento_id_trasferimento_seq"`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" ALTER COLUMN "id_trasferimento" SET DEFAULT nextval('"trasferimento_id_trasferimento_seq"')`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "trasferimento_id_trasferimento_seq" OWNER TO "default"`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "trasferimento_id_trasferimento_seq" OWNED BY "trasferimento"."id_trasferimento"`,
    )
    await queryRunner.query(
      `ALTER TABLE "classifica" DROP CONSTRAINT "FK_Classifiche_Utenti"`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" DROP CONSTRAINT "FK_Trasferimenti_Utenti"`,
    )
    await queryRunner.query(
      `ALTER TABLE "formazione" DROP CONSTRAINT "FK_Formazioni_Utenti"`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" DROP CONSTRAINT "FK_Partite_SquadreCasa"`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" DROP CONSTRAINT "FK_Partite_SquadreTrasferta"`,
    )
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "utente_id_utente_seq"`,
    )
    await queryRunner.query(
      `ALTER TABLE "utente" ALTER COLUMN "id_utente" SET DEFAULT nextval('"utente_id_utente_seq"')`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "utente_id_utente_seq" OWNER TO "default"`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "utente_id_utente_seq" OWNED BY "utente"."id_utente"`,
    )
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "classifica_id_seq"`)
    await queryRunner.query(
      `ALTER TABLE "classifica" ALTER COLUMN "id" SET DEFAULT nextval('"classifica_id_seq"')`,
    )
    await queryRunner.query(
      `ALTER TABLE "classifica" DROP CONSTRAINT "FK_Classifiche_Tornei"`,
    )
    await queryRunner.query(
      `ALTER TABLE "calendario" DROP CONSTRAINT "FK_Calendario_Tornei"`,
    )
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "torneo_id_torneo_seq"`,
    )
    await queryRunner.query(
      `ALTER TABLE "torneo" ALTER COLUMN "id_torneo" SET DEFAULT nextval('"torneo_id_torneo_seq"')`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "torneo_id_torneo_seq" OWNER TO "default"`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "torneo_id_torneo_seq" OWNED BY "torneo"."id_torneo"`,
    )
    await queryRunner.query(
      `ALTER TABLE "voto" DROP CONSTRAINT "FK_Voti_Calendario"`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" DROP CONSTRAINT "FK_Partite_Calendario"`,
    )
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "calendario_id_calendario_seq"`,
    )
    await queryRunner.query(
      `ALTER TABLE "calendario" ALTER COLUMN "id_calendario" SET DEFAULT nextval('"calendario_id_calendario_seq"')`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "calendario_id_calendario_seq" OWNER TO "default"`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "calendario_id_calendario_seq" OWNED BY "calendario"."id_calendario"`,
    )
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "flow_new_season_id_seq"`,
    )
    await queryRunner.query(
      `ALTER TABLE "flow_new_season" ALTER COLUMN "id" SET DEFAULT nextval('"flow_new_season_id_seq"')`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "flow_new_season_id_seq" OWNER TO "default"`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "flow_new_season_id_seq" OWNED BY "flow_new_season"."id"`,
    )
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "stats_p_id_seq"`)
    await queryRunner.query(
      `ALTER TABLE "stats_p" ALTER COLUMN "id" SET DEFAULT nextval('"stats_p_id_seq"')`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "stats_p_id_seq" OWNER TO "default"`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "stats_p_id_seq" OWNED BY "stats_p"."id"`,
    )
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "stats_d_id_seq"`)
    await queryRunner.query(
      `ALTER TABLE "stats_d" ALTER COLUMN "id" SET DEFAULT nextval('"stats_d_id_seq"')`,
    )
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "stats_c_id_seq"`)
    await queryRunner.query(
      `ALTER TABLE "stats_c" ALTER COLUMN "id" SET DEFAULT nextval('"stats_c_id_seq"')`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "stats_c_id_seq" OWNER TO "default"`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "stats_c_id_seq" OWNED BY "stats_c"."id"`,
    )
    await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "stats_a_id_seq"`)
    await queryRunner.query(
      `ALTER TABLE "stats_a" ALTER COLUMN "id" SET DEFAULT nextval('"stats_a_id_seq"')`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "stats_a_id_seq" OWNER TO "default"`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "stats_a_id_seq" OWNED BY "stats_a"."id"`,
    )
    await queryRunner.query(
      `CREATE SEQUENCE IF NOT EXISTS "serie_a_id_serie_a_seq"`,
    )
    await queryRunner.query(
      `ALTER TABLE "serie_a" ALTER COLUMN "id_serie_a" SET DEFAULT nextval('"serie_a_id_serie_a_seq"')`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "serie_a_id_serie_a_seq" OWNER TO "default"`,
    )
    await queryRunner.query(
      `ALTER SEQUENCE "serie_a_id_serie_a_seq" OWNED BY "serie_a"."id_serie_a"`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" ADD CONSTRAINT "FK_Partite_Calendario" FOREIGN KEY ("id_calendario") REFERENCES "calendario"("id_calendario") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" ADD CONSTRAINT "FK_Partite_SquadreCasa" FOREIGN KEY ("id_squadra_home") REFERENCES "utente"("id_utente") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" ADD CONSTRAINT "FK_Partite_SquadreTrasferta" FOREIGN KEY ("id_squadra_away") REFERENCES "utente"("id_utente") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "formazione" ADD CONSTRAINT "FK_Formazioni_Partite" FOREIGN KEY ("id_partita") REFERENCES "partita"("id_partita") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "formazione" ADD CONSTRAINT "FK_Formazioni_Utenti" FOREIGN KEY ("id_squadra") REFERENCES "utente"("id_utente") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "voto" ADD CONSTRAINT "FK_Formazione_Giocatori" FOREIGN KEY ("id_formazione") REFERENCES "formazione"("id_formazione") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "voto" ADD CONSTRAINT "FK_Voti_Calendario" FOREIGN KEY ("id_calendario") REFERENCES "calendario"("id_calendario") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "voto" ADD CONSTRAINT "FK_Voti_Giocatori" FOREIGN KEY ("id_giocatore") REFERENCES "giocatore"("id_giocatore") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" ADD CONSTRAINT "FK_Trasferimenti_Giocatori" FOREIGN KEY ("id_giocatore") REFERENCES "giocatore"("id_giocatore") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" ADD CONSTRAINT "FK_Trasferimenti_SquadreSerieA" FOREIGN KEY ("id_squadra_serie_a") REFERENCES "squadra_serie_a"("id_squadra_serie_a") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" ADD CONSTRAINT "FK_Trasferimenti_Utenti" FOREIGN KEY ("id_squadra") REFERENCES "utente"("id_utente") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "classifica" ADD CONSTRAINT "FK_Classifiche_Tornei" FOREIGN KEY ("id_torneo") REFERENCES "torneo"("id_torneo") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "classifica" ADD CONSTRAINT "FK_Classifiche_Utenti" FOREIGN KEY ("id_squadra") REFERENCES "utente"("id_utente") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "calendario" ADD CONSTRAINT "FK_Calendario_Tornei" FOREIGN KEY ("id_torneo") REFERENCES "torneo"("id_torneo") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "calendario" DROP CONSTRAINT "FK_Calendario_Tornei"`,
    )
    await queryRunner.query(
      `ALTER TABLE "classifica" DROP CONSTRAINT "FK_Classifiche_Utenti"`,
    )
    await queryRunner.query(
      `ALTER TABLE "classifica" DROP CONSTRAINT "FK_Classifiche_Tornei"`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" DROP CONSTRAINT "FK_Trasferimenti_Utenti"`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" DROP CONSTRAINT "FK_Trasferimenti_SquadreSerieA"`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" DROP CONSTRAINT "FK_Trasferimenti_Giocatori"`,
    )
    await queryRunner.query(
      `ALTER TABLE "voto" DROP CONSTRAINT "FK_Voti_Giocatori"`,
    )
    await queryRunner.query(
      `ALTER TABLE "voto" DROP CONSTRAINT "FK_Voti_Calendario"`,
    )
    await queryRunner.query(
      `ALTER TABLE "voto" DROP CONSTRAINT "FK_Formazione_Giocatori"`,
    )
    await queryRunner.query(
      `ALTER TABLE "formazione" DROP CONSTRAINT "FK_Formazioni_Utenti"`,
    )
    await queryRunner.query(
      `ALTER TABLE "formazione" DROP CONSTRAINT "FK_Formazioni_Partite"`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" DROP CONSTRAINT "FK_Partite_SquadreTrasferta"`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" DROP CONSTRAINT "FK_Partite_SquadreCasa"`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" DROP CONSTRAINT "FK_Partite_Calendario"`,
    )
    await queryRunner.query(
      `ALTER TABLE "serie_a" ALTER COLUMN "id_serie_a" DROP DEFAULT`,
    )
    await queryRunner.query(`DROP SEQUENCE "serie_a_id_serie_a_seq"`)
    await queryRunner.query(
      `ALTER TABLE "stats_a" ALTER COLUMN "id" DROP DEFAULT`,
    )
    await queryRunner.query(`DROP SEQUENCE "stats_a_id_seq"`)
    await queryRunner.query(
      `ALTER TABLE "stats_c" ALTER COLUMN "id" DROP DEFAULT`,
    )
    await queryRunner.query(`DROP SEQUENCE "stats_c_id_seq"`)
    await queryRunner.query(
      `ALTER TABLE "stats_d" ALTER COLUMN "id" DROP DEFAULT`,
    )
    await queryRunner.query(`DROP SEQUENCE "stats_d_id_seq"`)
    await queryRunner.query(
      `ALTER TABLE "stats_p" ALTER COLUMN "id" DROP DEFAULT`,
    )
    await queryRunner.query(`DROP SEQUENCE "stats_p_id_seq"`)
    await queryRunner.query(
      `ALTER TABLE "flow_new_season" ALTER COLUMN "id" DROP DEFAULT`,
    )
    await queryRunner.query(`DROP SEQUENCE "flow_new_season_id_seq"`)
    await queryRunner.query(
      `ALTER TABLE "calendario" ALTER COLUMN "id_calendario" DROP DEFAULT`,
    )
    await queryRunner.query(`DROP SEQUENCE "calendario_id_calendario_seq"`)
    await queryRunner.query(
      `ALTER TABLE "partita" ADD CONSTRAINT "FK_Partite_Calendario" FOREIGN KEY ("id_calendario") REFERENCES "calendario"("id_calendario") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "voto" ADD CONSTRAINT "FK_Voti_Calendario" FOREIGN KEY ("id_calendario") REFERENCES "calendario"("id_calendario") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "torneo" ALTER COLUMN "id_torneo" DROP DEFAULT`,
    )
    await queryRunner.query(`DROP SEQUENCE "torneo_id_torneo_seq"`)
    await queryRunner.query(
      `ALTER TABLE "calendario" ADD CONSTRAINT "FK_Calendario_Tornei" FOREIGN KEY ("id_torneo") REFERENCES "torneo"("id_torneo") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "classifica" ADD CONSTRAINT "FK_Classifiche_Tornei" FOREIGN KEY ("id_torneo") REFERENCES "torneo"("id_torneo") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "classifica" ALTER COLUMN "id" DROP DEFAULT`,
    )
    await queryRunner.query(`DROP SEQUENCE "classifica_id_seq"`)
    await queryRunner.query(
      `ALTER TABLE "utente" ALTER COLUMN "id_utente" DROP DEFAULT`,
    )
    await queryRunner.query(`DROP SEQUENCE "utente_id_utente_seq"`)
    await queryRunner.query(
      `ALTER TABLE "partita" ADD CONSTRAINT "FK_Partite_SquadreTrasferta" FOREIGN KEY ("id_squadra_away") REFERENCES "utente"("id_utente") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" ADD CONSTRAINT "FK_Partite_SquadreCasa" FOREIGN KEY ("id_squadra_home") REFERENCES "utente"("id_utente") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "formazione" ADD CONSTRAINT "FK_Formazioni_Utenti" FOREIGN KEY ("id_squadra") REFERENCES "utente"("id_utente") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" ADD CONSTRAINT "FK_Trasferimenti_Utenti" FOREIGN KEY ("id_squadra") REFERENCES "utente"("id_utente") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "classifica" ADD CONSTRAINT "FK_Classifiche_Utenti" FOREIGN KEY ("id_squadra") REFERENCES "utente"("id_utente") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" ALTER COLUMN "id_trasferimento" DROP DEFAULT`,
    )
    await queryRunner.query(
      `DROP SEQUENCE "trasferimento_id_trasferimento_seq"`,
    )
    await queryRunner.query(
      `ALTER TABLE "squadra_serie_a" ALTER COLUMN "id_squadra_serie_a" DROP DEFAULT`,
    )
    await queryRunner.query(
      `DROP SEQUENCE "squadra_serie_a_id_squadra_serie_a_seq"`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" ADD CONSTRAINT "FK_Trasferimenti_SquadreSerieA" FOREIGN KEY ("id_squadra_serie_a") REFERENCES "squadra_serie_a"("id_squadra_serie_a") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "giocatore" ALTER COLUMN "id_giocatore" DROP DEFAULT`,
    )
    await queryRunner.query(`DROP SEQUENCE "giocatore_id_giocatore_seq"`)
    await queryRunner.query(
      `ALTER TABLE "trasferimento" ADD CONSTRAINT "FK_Trasferimenti_Giocatori" FOREIGN KEY ("id_giocatore") REFERENCES "giocatore"("id_giocatore") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "voto" ADD CONSTRAINT "FK_Voti_Giocatori" FOREIGN KEY ("id_giocatore") REFERENCES "giocatore"("id_giocatore") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "voto" ALTER COLUMN "id_voto" DROP DEFAULT`,
    )
    await queryRunner.query(`DROP SEQUENCE "voto_id_voto_seq"`)
    await queryRunner.query(
      `ALTER TABLE "formazione" ALTER COLUMN "id_formazione" DROP DEFAULT`,
    )
    await queryRunner.query(`DROP SEQUENCE "formazione_id_formazione_seq"`)
    await queryRunner.query(
      `ALTER TABLE "voto" ADD CONSTRAINT "FK_Formazione_Giocatori" FOREIGN KEY ("id_formazione") REFERENCES "formazione"("id_formazione") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" ALTER COLUMN "id_partita" DROP DEFAULT`,
    )
    await queryRunner.query(`DROP SEQUENCE "partita_id_partita_seq"`)
    await queryRunner.query(
      `ALTER TABLE "formazione" ADD CONSTRAINT "FK_Formazioni_Partite" FOREIGN KEY ("id_partita") REFERENCES "partita"("id_partita") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "albo_trofei" ALTER COLUMN "id" DROP DEFAULT`,
    )
    await queryRunner.query(`DROP SEQUENCE "albo_trofei_id_seq"`)
    await queryRunner.query(
      `CREATE INDEX "IX_Voti_StatsGiocatori" ON "voto" ("voto") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IX_Voti_StatsGiocatori2" ON "voto" ("id_giocatore") `,
    )
  }
}
