import { MigrationInterface, QueryRunner } from 'typeorm'

export class AlterFunctionC1764173078808 implements MigrationInterface {
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
            TRUNCATE TABLE public."stats_c";
            
            INSERT INTO public."stats_c" (
                media, "mediabonus", "golfatti", "golsubiti", ammonizioni, espulsioni, assist, giocate, ruolo, nome, "nomefantagazzetta", "idgiocatore", maglia, "squadra_serie_a", squadra, "id_squadra"
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
                g."nome_fanta_gazzetta",
                g."id_giocatore",
                s.maglia,
                s.nome AS squadraserieA,
                u."nome_squadra" AS squadra,
                t."id_squadra" AS idsquadra
            FROM 
                public."v_voti" AS v
            INNER JOIN 
                public."giocatore" AS g ON v."idGiocatore" = g."id_giocatore"
            INNER JOIN 
                public."trasferimento" AS t ON t."id_giocatore" = g."id_giocatore"
            INNER JOIN 
                public."squadra_serie_a" AS s ON s."id_squadra_serie_a" = t."id_squadra_serie_a"
            LEFT JOIN 
                public."utente" AS u ON u."id_utente" = t."id_squadra"
            WHERE 
                v.voto > 0
                AND ((t."data_acquisto" < NOW() AND t."data_cessione" IS NULL) OR (t."data_cessione" IS NOT NULL AND t."data_acquisto" < NOW() AND t."data_cessione" > NOW()))
                AND t.stagione = p_stagione
                AND g.ruolo = p_ruolo
            GROUP BY 
                g.ruolo, g.nome, g."nome_fanta_gazzetta", g."id_giocatore", s.nome, u."nome_squadra", s.maglia, t.stagione, t."nome_squadra_serie_a", t."nome_squadra", t."id_squadra"
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
