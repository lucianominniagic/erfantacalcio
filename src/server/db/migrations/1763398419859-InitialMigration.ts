import { MigrationInterface, QueryRunner } from 'typeorm'

export class InitialMigration1763398419859 implements MigrationInterface {
  name = 'InitialMigration1763398419859'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "StatsA" ("id" SERIAL NOT NULL, "media" numeric(38,6), "mediabonus" numeric(38,6), "golfatti" numeric(38,6), "golsubiti" numeric(38,1), "ammonizioni" numeric(38,6), "espulsioni" numeric(38,6), "assist" numeric(38,1), "giocate" integer, "ruolo" character varying(1) NOT NULL, "nome" character varying(50) NOT NULL, "nomefantagazzetta" character varying(500), "idgiocatore" integer NOT NULL, "maglia" character varying(50) NOT NULL, "squadraSerieA" character varying(50) NOT NULL, "squadra" character varying(50), "idSquadra" integer, CONSTRAINT "PK_f9e462ec3f87dd23adff0177655" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_StatsA_id" ON "StatsA" ("id") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "PK_StatsA" ON "StatsA" ("id") `,
    )
    await queryRunner.query(
      `CREATE TABLE "StatsP" ("id" SERIAL NOT NULL, "media" numeric(38,6), "mediabonus" numeric(38,6), "golfatti" numeric(38,6), "golsubiti" numeric(38,1), "ammonizioni" numeric(38,6), "espulsioni" numeric(38,6), "assist" numeric(38,1), "giocate" integer, "ruolo" character varying(1) NOT NULL, "nome" character varying(50) NOT NULL, "nomefantagazzetta" character varying(500), "idgiocatore" integer NOT NULL, "maglia" character varying(50) NOT NULL, "squadraSerieA" character varying(50) NOT NULL, "squadra" character varying(50), "idSquadra" integer, CONSTRAINT "PK_bbf65fc3c37bad5d9bf26deff22" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "PK_StatsP" ON "StatsP" ("id") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_StatsP_id" ON "StatsP" ("id") `,
    )
    await queryRunner.query(
      `CREATE TABLE "StatsD" ("id" SERIAL NOT NULL, "media" numeric(38,6), "mediabonus" numeric(38,6), "golfatti" numeric(38,6), "golsubiti" numeric(38,1), "ammonizioni" numeric(38,6), "espulsioni" numeric(38,6), "assist" numeric(38,1), "giocate" integer, "ruolo" character varying(1) NOT NULL, "nome" character varying(50) NOT NULL, "nomefantagazzetta" character varying(500), "idgiocatore" integer NOT NULL, "maglia" character varying(50) NOT NULL, "squadraSerieA" character varying(50) NOT NULL, "squadra" character varying(50), "idSquadra" integer, CONSTRAINT "PK_11f0d0cb5f2f564060806efe6c7" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_StatsD_id" ON "StatsD" ("id") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "PK_StatsD" ON "StatsD" ("id") `,
    )
    await queryRunner.query(
      `CREATE TABLE "SerieA" ("idSerieA" SERIAL NOT NULL, "giornata" smallint NOT NULL, "squadraHome" character varying(50) NOT NULL, "squadraAway" character varying(50) NOT NULL, CONSTRAINT "PK_da1f29dd09abe1527aeedc019bc" PRIMARY KEY ("idSerieA"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "StatsC" ("id" SERIAL NOT NULL, "media" numeric(38,6), "mediabonus" numeric(38,6), "golfatti" numeric(38,6), "golsubiti" numeric(38,1), "ammonizioni" numeric(38,6), "espulsioni" numeric(38,6), "assist" numeric(38,1), "giocate" integer, "ruolo" character varying(1) NOT NULL, "nome" character varying(50) NOT NULL, "nomefantagazzetta" character varying(500), "idgiocatore" integer NOT NULL, "maglia" character varying(50) NOT NULL, "squadraSerieA" character varying(50) NOT NULL, "squadra" character varying(50), "idSquadra" integer, CONSTRAINT "PK_3753aafe7a641c7a72d04cb66e9" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "PK_StatsC" ON "StatsC" ("id") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_StatsC_id" ON "StatsC" ("id") `,
    )
    await queryRunner.query(
      `CREATE TABLE "migrations" ("id" SERIAL NOT NULL, "timestamp" bigint NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_8c82d7f526340ab734260ea46be" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "FlowNewSeasosn" ("id" SERIAL NOT NULL, "idFase" integer NOT NULL, "active" boolean NOT NULL DEFAULT false, "data" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_366c610b3202a82bdb1773b1437" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_FlowSeason_id" ON "FlowNewSeasosn" ("id") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "PK_FlowNewSeason" ON "FlowNewSeasosn" ("id") `,
    )
    await queryRunner.query(
      `CREATE TABLE "SquadreSerieA" ("idSquadraSerieA" SERIAL NOT NULL, "nome" character varying(50) NOT NULL, "maglia" character varying(50) NOT NULL, CONSTRAINT "PK_d8b0df905e1ffa082a68885404b" PRIMARY KEY ("idSquadraSerieA"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "Trasferimenti" ("idTrasferimento" SERIAL NOT NULL, "idGiocatore" integer NOT NULL, "idSquadraSerieA" integer, "dataAcquisto" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "dataCessione" TIMESTAMP WITH TIME ZONE, "idSquadra" integer, "costo" smallint NOT NULL, "stagione" character varying(9) NOT NULL, "hasRitirato" boolean NOT NULL DEFAULT false, "nomeSquadraSerieA" character varying(50), "nomeSquadra" character varying(50), "media" numeric(9,2), "gol" smallint, "assist" smallint, "giocate" smallint, CONSTRAINT "PK_b1beba873cf1bda71504affe372" PRIMARY KEY ("idTrasferimento"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "Giocatori" ("idGiocatore" SERIAL NOT NULL, "ruolo" character varying(1) NOT NULL, "nome" character varying(50) NOT NULL, "nomeFantaGazzetta" character varying(500), "id_pf" integer, CONSTRAINT "UQ_45ace405cb62d43dbe932411207" UNIQUE ("nome"), CONSTRAINT "PK_cd90b34bfa07aa04bd0b374fbfe" PRIMARY KEY ("idGiocatore"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "Voti" ("idVoto" SERIAL NOT NULL, "idGiocatore" integer NOT NULL, "idCalendario" integer NOT NULL, "idFormazione" integer, "voto" numeric(5,2), "ammonizione" numeric(5,1) NOT NULL DEFAULT '0', "espulsione" numeric(5,1) NOT NULL DEFAULT '0', "gol" numeric(5,1) DEFAULT '0', "assist" numeric(5,1) DEFAULT '0', "autogol" numeric(5,1) DEFAULT '0', "altriBonus" numeric(5,1) DEFAULT '0', "titolare" boolean NOT NULL DEFAULT false, "riserva" smallint, CONSTRAINT "UQ_Voti_Calendario_Giocatore" UNIQUE ("idCalendario", "idGiocatore"), CONSTRAINT "PK_12fb5a69107bc812bb7b84b1e48" PRIMARY KEY ("idVoto"))`,
    )
    await queryRunner.query(
      `CREATE INDEX "IX_Voti_StatsGiocatori2" ON "Voti" ("idGiocatore") `,
    )
    await queryRunner.query(
      `CREATE INDEX "IX_Voti_StatsGiocatori" ON "Voti" ("voto") `,
    )
    await queryRunner.query(
      `CREATE TABLE "Formazioni" ("idFormazione" SERIAL NOT NULL, "idSquadra" integer NOT NULL, "idPartita" integer NOT NULL, "dataOra" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "modulo" character varying(5) NOT NULL, "hasBloccata" boolean NOT NULL DEFAULT false, CONSTRAINT "UNIQUE_Formazioni_ids" UNIQUE ("idSquadra", "idPartita"), CONSTRAINT "PK_ca480ec668771fb13ccddecca7c" PRIMARY KEY ("idFormazione"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "Partite" ("idPartita" SERIAL NOT NULL, "idCalendario" integer NOT NULL, "idSquadraH" integer, "idSquadraA" integer, "puntiH" smallint, "puntiA" smallint, "golH" smallint, "golA" smallint, "hasMultaH" boolean NOT NULL DEFAULT false, "hasMultaA" boolean NOT NULL DEFAULT false, "punteggioH" numeric(9,2), "punteggioA" numeric(9,2), "fattoreCasalingo" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_9bdab76fe32db75f2c8be0b69a6" PRIMARY KEY ("idPartita"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "Calendario" ("idCalendario" SERIAL NOT NULL, "giornata" smallint NOT NULL, "idTorneo" integer NOT NULL, "giornataSerieA" smallint NOT NULL, "ordine" smallint NOT NULL, "hasSovrapposta" boolean NOT NULL DEFAULT false, "hasGiocata" boolean NOT NULL DEFAULT false, "hasDaRecuperare" boolean NOT NULL DEFAULT false, "data" TIMESTAMP WITH TIME ZONE DEFAULT now(), "girone" smallint, "dataFine" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_5e1749d894870c71f32171d2c4a" PRIMARY KEY ("idCalendario"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "Tornei" ("idTorneo" SERIAL NOT NULL, "nome" character varying(50) NOT NULL, "gruppoFase" character varying(50), "hasClassifica" boolean NOT NULL, CONSTRAINT "PK_6309e3b7b750fe8c5744333d4e2" PRIMARY KEY ("idTorneo"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "Classifiche" ("id" SERIAL NOT NULL, "idSquadra" integer NOT NULL, "idTorneo" integer NOT NULL, "punti" smallint NOT NULL, "vinteCasa" smallint NOT NULL, "pareggiCasa" smallint NOT NULL, "perseCasa" smallint NOT NULL, "vinteTrasferta" smallint NOT NULL, "pareggiTrasferta" smallint NOT NULL, "perseTrasferta" smallint NOT NULL, "golFatti" smallint NOT NULL, "golSubiti" smallint NOT NULL, "differenzaReti" integer NOT NULL, "giocate" smallint NOT NULL, CONSTRAINT "PK_6b8420122055a6e2b334f73e7ad" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "Utenti" ("idUtente" SERIAL NOT NULL, "username" character varying(50) NOT NULL, "pwd" character varying(50) NOT NULL, "adminLevel" boolean NOT NULL DEFAULT false, "presidente" character varying(50) NOT NULL, "mail" character varying(50) NOT NULL, "nomeSquadra" character varying(50) NOT NULL, "foto" character varying(500), "importoBase" numeric(9,2) NOT NULL DEFAULT '100', "importoMulte" numeric(9,2) NOT NULL DEFAULT '0', "importoMercato" numeric(9,2) NOT NULL DEFAULT '0', "fantaMilioni" numeric(9,2) NOT NULL DEFAULT '600', "Campionato" smallint NOT NULL DEFAULT '0', "Champions" smallint NOT NULL DEFAULT '0', "Secondo" smallint NOT NULL DEFAULT '0', "Terzo" smallint NOT NULL DEFAULT '0', "lockLevel" boolean NOT NULL DEFAULT false, "maglia" character varying(500), CONSTRAINT "PK_299c577407b8354a4211cff2ea0" PRIMARY KEY ("idUtente"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "AlboTrofei_new" ("id" SERIAL NOT NULL, "stagione" character varying(9) NOT NULL, "campionato" character varying(50) NOT NULL, "champions" character varying(50) NOT NULL, "secondo" character varying(50) NOT NULL, "terzo" character varying(50) NOT NULL, CONSTRAINT "PK_3f340311ffdc976e7f9791c2c02" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "PK_AlboTrofei_new" ON "AlboTrofei_new" ("id") `,
    )
    await queryRunner.query(
      `ALTER TABLE "Trasferimenti" ADD CONSTRAINT "FK_Trasferimenti_Giocatori" FOREIGN KEY ("idGiocatore") REFERENCES "Giocatori"("idGiocatore") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "Trasferimenti" ADD CONSTRAINT "FK_Trasferimenti_SquadreSerieA" FOREIGN KEY ("idSquadraSerieA") REFERENCES "SquadreSerieA"("idSquadraSerieA") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "Trasferimenti" ADD CONSTRAINT "FK_Trasferimenti_Utenti" FOREIGN KEY ("idSquadra") REFERENCES "Utenti"("idUtente") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "Voti" ADD CONSTRAINT "FK_Formazione_Giocatori" FOREIGN KEY ("idFormazione") REFERENCES "Formazioni"("idFormazione") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "Voti" ADD CONSTRAINT "FK_Voti_Calendario" FOREIGN KEY ("idCalendario") REFERENCES "Calendario"("idCalendario") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "Voti" ADD CONSTRAINT "FK_Voti_Giocatori" FOREIGN KEY ("idGiocatore") REFERENCES "Giocatori"("idGiocatore") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "Formazioni" ADD CONSTRAINT "FK_Formazioni_Partite" FOREIGN KEY ("idPartita") REFERENCES "Partite"("idPartita") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "Formazioni" ADD CONSTRAINT "FK_Formazioni_Utenti" FOREIGN KEY ("idSquadra") REFERENCES "Utenti"("idUtente") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "Partite" ADD CONSTRAINT "FK_Partite_Calendario" FOREIGN KEY ("idCalendario") REFERENCES "Calendario"("idCalendario") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "Partite" ADD CONSTRAINT "FK_Partite_SquadreCasa" FOREIGN KEY ("idSquadraH") REFERENCES "Utenti"("idUtente") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "Partite" ADD CONSTRAINT "FK_Partite_SquadreTrasferta" FOREIGN KEY ("idSquadraA") REFERENCES "Utenti"("idUtente") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "Calendario" ADD CONSTRAINT "FK_Calendario_Tornei" FOREIGN KEY ("idTorneo") REFERENCES "Tornei"("idTorneo") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "Classifiche" ADD CONSTRAINT "FK_Classifiche_Tornei" FOREIGN KEY ("idTorneo") REFERENCES "Tornei"("idTorneo") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "Classifiche" ADD CONSTRAINT "FK_Classifiche_Utenti" FOREIGN KEY ("idSquadra") REFERENCES "Utenti"("idUtente") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Classifiche" DROP CONSTRAINT "FK_Classifiche_Utenti"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Classifiche" DROP CONSTRAINT "FK_Classifiche_Tornei"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Calendario" DROP CONSTRAINT "FK_Calendario_Tornei"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Partite" DROP CONSTRAINT "FK_Partite_SquadreTrasferta"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Partite" DROP CONSTRAINT "FK_Partite_SquadreCasa"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Partite" DROP CONSTRAINT "FK_Partite_Calendario"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Formazioni" DROP CONSTRAINT "FK_Formazioni_Utenti"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Formazioni" DROP CONSTRAINT "FK_Formazioni_Partite"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Voti" DROP CONSTRAINT "FK_Voti_Giocatori"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Voti" DROP CONSTRAINT "FK_Voti_Calendario"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Voti" DROP CONSTRAINT "FK_Formazione_Giocatori"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Trasferimenti" DROP CONSTRAINT "FK_Trasferimenti_Utenti"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Trasferimenti" DROP CONSTRAINT "FK_Trasferimenti_SquadreSerieA"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Trasferimenti" DROP CONSTRAINT "FK_Trasferimenti_Giocatori"`,
    )
    await queryRunner.query(`DROP INDEX "public"."PK_AlboTrofei_new"`)
    await queryRunner.query(`DROP TABLE "AlboTrofei_new"`)
    await queryRunner.query(`DROP TABLE "Utenti"`)
    await queryRunner.query(`DROP TABLE "Classifiche"`)
    await queryRunner.query(`DROP TABLE "Tornei"`)
    await queryRunner.query(`DROP TABLE "Calendario"`)
    await queryRunner.query(`DROP TABLE "Partite"`)
    await queryRunner.query(`DROP TABLE "Formazioni"`)
    await queryRunner.query(`DROP INDEX "public"."IX_Voti_StatsGiocatori"`)
    await queryRunner.query(`DROP INDEX "public"."IX_Voti_StatsGiocatori2"`)
    await queryRunner.query(`DROP TABLE "Voti"`)
    await queryRunner.query(`DROP TABLE "Giocatori"`)
    await queryRunner.query(`DROP TABLE "Trasferimenti"`)
    await queryRunner.query(`DROP TABLE "SquadreSerieA"`)
    await queryRunner.query(`DROP INDEX "public"."PK_FlowNewSeason"`)
    await queryRunner.query(`DROP INDEX "public"."IX_FlowSeason_id"`)
    await queryRunner.query(`DROP TABLE "FlowNewSeasosn"`)
    await queryRunner.query(`DROP TABLE "migrations"`)
    await queryRunner.query(`DROP INDEX "public"."IX_StatsC_id"`)
    await queryRunner.query(`DROP INDEX "public"."PK_StatsC"`)
    await queryRunner.query(`DROP TABLE "StatsC"`)
    await queryRunner.query(`DROP TABLE "SerieA"`)
    await queryRunner.query(`DROP INDEX "public"."PK_StatsD"`)
    await queryRunner.query(`DROP INDEX "public"."IX_StatsD_id"`)
    await queryRunner.query(`DROP TABLE "StatsD"`)
    await queryRunner.query(`DROP INDEX "public"."IX_StatsP_id"`)
    await queryRunner.query(`DROP INDEX "public"."PK_StatsP"`)
    await queryRunner.query(`DROP TABLE "StatsP"`)
    await queryRunner.query(`DROP INDEX "public"."PK_StatsA"`)
    await queryRunner.query(`DROP INDEX "public"."IX_StatsA_id"`)
    await queryRunner.query(`DROP TABLE "StatsA"`)
  }
}
