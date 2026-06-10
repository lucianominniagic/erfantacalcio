import { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveIndexes1764001583214 implements MigrationInterface {
  name = 'RemoveIndexes1764001583214'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IX_Partite_idPartita"`,
    )
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IX_SquadreSerieA_idSquadraSerieA"`,
    )
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IX_Trasferimenti_idTrasferimento"`,
    )
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IX_Giocatori_idGiocatore"`,
    )
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."UNIQUE_GIOCATORI_NOME"`,
    )
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IX_Voti_idVoto"`)
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IX_Formazioni_idFormazione"`,
    )
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IX_Utenti"`)
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IX_Utenti_idUtente"`,
    )
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IX_Tornei_idTorneo"`,
    )
    await queryRunner.query(
      `DROP INDEX IF EXISTS "public"."IX_Calendario_idCalendario"`,
    )
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IX_FlowSeason_id"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IX_StatsP_id"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IX_StatsD_id"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IX_StatsC_id"`)
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."IX_StatsA_id"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_StatsA_id" ON "StatsA" ("id") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_StatsC_id" ON "StatsC" ("id") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_StatsD_id" ON "StatsD" ("id") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_StatsP_id" ON "StatsP" ("id") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_FlowSeason_id" ON "FlowNewSeasosn" ("id") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_Calendario_idCalendario" ON "Calendario" ("idCalendario") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_Tornei_idTorneo" ON "Tornei" ("idTorneo") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_Utenti_idUtente" ON "Utenti" ("idUtente") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_Utenti" ON "Utenti" ("username", "pwd") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_Formazioni_idFormazione" ON "Formazioni" ("idFormazione") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_Voti_idVoto" ON "Voti" ("idVoto") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UNIQUE_GIOCATORI_NOME" ON "Giocatori" ("nome") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_Giocatori_idGiocatore" ON "Giocatori" ("idGiocatore") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_Trasferimenti_idTrasferimento" ON "Trasferimenti" ("idTrasferimento") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_SquadreSerieA_idSquadraSerieA" ON "SquadreSerieA" ("idSquadraSerieA") `,
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IX_Partite_idPartita" ON "Partite" ("idPartita") `,
    )
  }
}
