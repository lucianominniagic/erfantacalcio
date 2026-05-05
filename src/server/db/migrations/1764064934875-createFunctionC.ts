import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateFunctionC1764064934875 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE OR REPLACE FUNCTION public.sp_refreshstats_c(
            p_ruolo character varying,
            p_stagione character varying)
            RETURNS void
            LANGUAGE 'plpgsql'
            COST 100
            VOLATILE PARALLEL UNSAFE
        AS $BODY$
        BEGIN
            TRUNCATE TABLE public."StatsC";

            INSERT INTO public."StatsC" (
                media, "mediabonus", "golfatti", "golsubiti", ammonizioni, espulsioni, assist, giocate, ruolo, nome, "nomefantagazzetta", "idgiocatore", maglia, "squadraSerieA", squadra, "idSquadra"
            )
            SELECT 
                ROUND(AVG(v.voto), 2) AS media,
                ROUND(AVG(v.voto + v.assist + v.ammonizione + v.espulsione + v.gol + v."altriBonus"), 2) AS mediabonus,
                SUM(v.gol / 3) AS golfatti,
                -SUM(v.gol) AS golsubiti,
                SUM(v.ammonizione / -0.5) AS ammonizioni,
                SUM(v.espulsione / -1) AS espulsioni,
                SUM(v.assist) AS assist,
                COUNT(v.voto) AS giocate,
                g.ruolo,
                g.nome,
                g."nomeFantaGazzetta",
                g."idGiocatore",
                s.maglia,
                s.nome AS squadraserieA,
                u."nomeSquadra" AS squadra,
                t."idSquadra" AS idsquadra
            FROM 
                public."v_voti" AS v
            INNER JOIN 
                public."Giocatori" AS g ON v."idGiocatore" = g."idGiocatore"
            INNER JOIN 
                public."Trasferimenti" AS t ON t."idGiocatore" = g."idGiocatore"
            INNER JOIN 
                public."SquadreSerieA" AS s ON s."idSquadraSerieA" = t."idSquadraSerieA"
            LEFT JOIN 
                public."Utenti" AS u ON u."idUtente" = t."idSquadra"
            WHERE 
                v.voto > 0
                AND ((t."dataAcquisto" < NOW() AND t."dataCessione" IS NULL) OR (t."dataCessione" IS NOT NULL AND t."dataAcquisto" < NOW() AND t."dataCessione" > NOW()))
                AND t.stagione = p_stagione
                AND g.ruolo = p_ruolo
            GROUP BY 
                g.ruolo, g.nome, g."nomeFantaGazzetta", g."idGiocatore", s.nome, u."nomeSquadra", s.maglia, t.stagione, t."nomeSquadraSerieA", t."nomeSquadra", t."idSquadra"
            ORDER BY 
                ROUND(AVG(v.voto), 2) DESC,
                ROUND(AVG(v.voto + v.assist + v.ammonizione + v.espulsione + v.gol + v."altriBonus"), 2) DESC,
                COUNT(v.voto) DESC;
        END;
        $BODY$`)

    await queryRunner.query(
      `ALTER FUNCTION public.sp_refreshstats_c(character varying, character varying) OWNER TO "default"`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP FUNCTION IF EXISTS public.sp_refreshstats_c(character varying, character varying)`,
    )
  }
}
