import { MigrationInterface, QueryRunner } from 'typeorm'

export class RenameAllDb1764079170654 implements MigrationInterface {
  name = 'RenameAllDb1764079170654'

  public async up(queryRunner: QueryRunner): Promise<void> {
    //albo trofei
    await queryRunner.query(
      `ALTER TABLE "AlboTrofei_new" RENAME TO "albo_trofei"`,
    )

    //stats_p
    await queryRunner.query(`ALTER TABLE "StatsP" RENAME TO "stats_p"`)
    await queryRunner.query(
      `ALTER TABLE "stats_p" RENAME COLUMN "squadraSerieA" TO "squadra_serie_a"`,
    )
    await queryRunner.query(
      `ALTER TABLE "stats_p" RENAME COLUMN "idSquadra" TO "id_squadra"`,
    )

    //stats_d
    await queryRunner.query(`ALTER TABLE "StatsD" RENAME TO "stats_d"`)
    await queryRunner.query(
      `ALTER TABLE "stats_d" RENAME COLUMN "squadraSerieA" TO "squadra_serie_a"`,
    )
    await queryRunner.query(
      `ALTER TABLE "stats_d" RENAME COLUMN "idSquadra" TO "id_squadra"`,
    )

    //stats_c
    await queryRunner.query(`ALTER TABLE "StatsC" RENAME TO "stats_c"`)
    await queryRunner.query(
      `ALTER TABLE "stats_c" RENAME COLUMN "squadraSerieA" TO "squadra_serie_a"`,
    )
    await queryRunner.query(
      `ALTER TABLE "stats_c" RENAME COLUMN "idSquadra" TO "id_squadra"`,
    )

    //stats_a
    await queryRunner.query(`ALTER TABLE "StatsA" RENAME TO "stats_a"`)
    await queryRunner.query(
      `ALTER TABLE "stats_a" RENAME COLUMN "squadraSerieA" TO "squadra_serie_a"`,
    )
    await queryRunner.query(
      `ALTER TABLE "stats_a" RENAME COLUMN "idSquadra" TO "id_squadra"`,
    )

    //flow_new_season
    await queryRunner.query(
      `ALTER TABLE "FlowNewSeasosn" RENAME TO "flow_new_season"`,
    )
    await queryRunner.query(
      `ALTER TABLE "flow_new_season" RENAME COLUMN "idFase" TO "id_fase"`,
    )

    //torneo
    await queryRunner.query(`ALTER TABLE "Tornei" RENAME TO "torneo"`)
    await queryRunner.query(
      `ALTER TABLE "torneo" RENAME COLUMN "idTorneo" TO "id_torneo"`,
    )
    await queryRunner.query(
      `ALTER TABLE "torneo" RENAME COLUMN "gruppoFase" TO "gruppo_fase"`,
    )
    await queryRunner.query(
      `ALTER TABLE "torneo" RENAME COLUMN "hasClassifica" TO "has_classifica"`,
    )

    //classifica
    await queryRunner.query(`ALTER TABLE "Classifiche" RENAME TO "classifica"`)
    await queryRunner.query(
      `ALTER TABLE "classifica" RENAME COLUMN "idSquadra" TO "id_squadra"`,
    )
    await queryRunner.query(
      `ALTER TABLE "classifica" RENAME COLUMN "idTorneo" TO "id_torneo"`,
    )
    await queryRunner.query(
      `ALTER TABLE "classifica" RENAME COLUMN "vinteCasa" TO "vinte_casa"`,
    )
    await queryRunner.query(
      `ALTER TABLE "classifica" RENAME COLUMN "pareggiCasa" TO "pareggi_casa"`,
    )
    await queryRunner.query(
      `ALTER TABLE "classifica" RENAME COLUMN "perseCasa" TO "perse_casa"`,
    )
    await queryRunner.query(
      `ALTER TABLE "classifica" RENAME COLUMN "vinteTrasferta" TO "vinte_trasferta"`,
    )
    await queryRunner.query(
      `ALTER TABLE "classifica" RENAME COLUMN "pareggiTrasferta" TO "pareggi_trasferta"`,
    )
    await queryRunner.query(
      `ALTER TABLE "classifica" RENAME COLUMN "perseTrasferta" TO "perse_trasferta"`,
    )
    await queryRunner.query(
      `ALTER TABLE "classifica" RENAME COLUMN "golFatti" TO "gol_fatti"`,
    )
    await queryRunner.query(
      `ALTER TABLE "classifica" RENAME COLUMN "golSubiti" TO "gol_subiti"`,
    )
    await queryRunner.query(
      `ALTER TABLE "classifica" RENAME COLUMN "differenzaReti" TO "differenza_reti"`,
    )

    //utente
    await queryRunner.query(`ALTER TABLE "Utenti" RENAME TO "utente"`)
    await queryRunner.query(
      `ALTER TABLE "utente" RENAME COLUMN "idUtente" TO "id_utente"`,
    )
    await queryRunner.query(
      `ALTER TABLE "utente" RENAME COLUMN "adminLevel" TO "admin_level"`,
    )
    await queryRunner.query(
      `ALTER TABLE "utente" RENAME COLUMN "nomeSquadra" TO "nome_squadra"`,
    )
    await queryRunner.query(
      `ALTER TABLE "utente" RENAME COLUMN "importoBase" TO "importo_base"`,
    )
    await queryRunner.query(
      `ALTER TABLE "utente" RENAME COLUMN "importoMulte" TO "importo_multe"`,
    )
    await queryRunner.query(
      `ALTER TABLE "utente" RENAME COLUMN "importoMercato" TO "importo_mercato"`,
    )
    await queryRunner.query(
      `ALTER TABLE "utente" RENAME COLUMN "fantaMilioni" TO "fanta_milioni"`,
    )
    await queryRunner.query(
      `ALTER TABLE "utente" RENAME COLUMN "Campionato" TO "campionato"`,
    )
    await queryRunner.query(
      `ALTER TABLE "utente" RENAME COLUMN "Champions" TO "champions"`,
    )
    await queryRunner.query(
      `ALTER TABLE "utente" RENAME COLUMN "Secondo" TO "secondo"`,
    )
    await queryRunner.query(
      `ALTER TABLE "utente" RENAME COLUMN "Terzo" TO "terzo"`,
    )
    await queryRunner.query(
      `ALTER TABLE "utente" RENAME COLUMN "lockLevel" TO "lock_level"`,
    )

    //trasferimento
    await queryRunner.query(
      `ALTER TABLE "Trasferimenti" RENAME TO "trasferimento"`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" RENAME COLUMN "idTrasferimento" TO "id_trasferimento"`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" RENAME COLUMN "idGiocatore" TO "id_giocatore"`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" RENAME COLUMN "idSquadraSerieA" TO "id_squadra_serie_a"`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" RENAME COLUMN "dataAcquisto" TO "data_acquisto"`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" RENAME COLUMN "dataCessione" TO "data_cessione"`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" RENAME COLUMN "idSquadra" TO "id_squadra"`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" RENAME COLUMN "hasRitirato" TO "has_ritirato"`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" RENAME COLUMN "nomeSquadraSerieA" TO "nome_squadra_serie_a"`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" RENAME COLUMN "nomeSquadra" TO "nome_squadra"`,
    )

    //serie a
    await queryRunner.query(`ALTER TABLE "SerieA" RENAME TO "serie_a"`)
    await queryRunner.query(
      `ALTER TABLE "serie_a" RENAME COLUMN "idSerieA" TO "id_serie_a"`,
    )
    await queryRunner.query(
      `ALTER TABLE "serie_a" RENAME COLUMN "squadraHome" TO "squadra_home"`,
    )
    await queryRunner.query(
      `ALTER TABLE "serie_a" RENAME COLUMN "squadraAway" TO "squadra_away"`,
    )

    //squadre serie a
    await queryRunner.query(
      `ALTER TABLE "SquadreSerieA" RENAME TO "squadra_serie_a"`,
    )
    await queryRunner.query(
      `ALTER TABLE "squadra_serie_a" RENAME COLUMN "idSquadraSerieA" TO "id_squadra_serie_a"`,
    )

    //giocatore
    await queryRunner.query(`ALTER TABLE "Giocatori" RENAME TO "giocatore"`)
    await queryRunner.query(
      `ALTER TABLE "giocatore" RENAME COLUMN "idGiocatore" TO "id_giocatore"`,
    )
    await queryRunner.query(
      `ALTER TABLE "giocatore" RENAME COLUMN "nomeFantaGazzetta" TO "nome_fanta_gazzetta"`,
    )

    //voto
    await queryRunner.query(`ALTER TABLE "Voti" RENAME TO "voto"`)
    await queryRunner.query(
      `ALTER TABLE "voto" RENAME COLUMN "idVoto" TO "id_voto"`,
    )
    await queryRunner.query(
      `ALTER TABLE "voto" RENAME COLUMN "idGiocatore" TO "id_giocatore"`,
    )
    await queryRunner.query(
      `ALTER TABLE "voto" RENAME COLUMN "idCalendario" TO "id_calendario"`,
    )
    await queryRunner.query(
      `ALTER TABLE "voto" RENAME COLUMN "idFormazione" TO "id_formazione"`,
    )
    await queryRunner.query(
      `ALTER TABLE "voto" RENAME COLUMN "altriBonus" TO "altri_bonus"`,
    )

    //formazione
    await queryRunner.query(`ALTER TABLE "Formazioni" RENAME TO "formazione"`)
    await queryRunner.query(
      `ALTER TABLE "formazione" RENAME COLUMN "idFormazione" TO "id_formazione"`,
    )
    await queryRunner.query(
      `ALTER TABLE "formazione" RENAME COLUMN "idSquadra" TO "id_squadra"`,
    )
    await queryRunner.query(
      `ALTER TABLE "formazione" RENAME COLUMN "idPartita" TO "id_partita"`,
    )
    await queryRunner.query(
      `ALTER TABLE "formazione" RENAME COLUMN "dataOra" TO "data_ora"`,
    )
    await queryRunner.query(
      `ALTER TABLE "formazione" RENAME COLUMN "hasBloccata" TO "has_bloccata"`,
    )

    //partita
    await queryRunner.query(`ALTER TABLE "Partite" RENAME TO "partita"`)
    await queryRunner.query(
      `ALTER TABLE "partita" RENAME COLUMN "idPartita" TO "id_partita"`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" RENAME COLUMN "idCalendario" TO "id_calendario"`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" RENAME COLUMN "idSquadraH" TO "id_squadra_home"`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" RENAME COLUMN "idSquadraA" TO "id_squadra_away"`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" RENAME COLUMN "puntiH" TO "punti_home"`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" RENAME COLUMN "puntiA" TO "punti_away"`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" RENAME COLUMN "golH" TO "gol_home"`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" RENAME COLUMN "golA" TO "gol_away"`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" RENAME COLUMN "hasMultaH" TO "has_multa_home"`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" RENAME COLUMN "hasMultaA" TO "has_multa_away"`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" RENAME COLUMN "punteggioH" TO "punteggio_home"`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" RENAME COLUMN "punteggioA" TO "punteggio_away"`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" RENAME COLUMN "fattoreCasalingo" TO "fattore_casalingo"`,
    )

    //calendario
    await queryRunner.query(`ALTER TABLE "Calendario" RENAME TO "calendario"`)
    await queryRunner.query(
      `ALTER TABLE "calendario" RENAME COLUMN "idCalendario" TO "id_calendario"`,
    )
    await queryRunner.query(
      `ALTER TABLE "calendario" RENAME COLUMN "idTorneo" TO "id_torneo"`,
    )
    await queryRunner.query(
      `ALTER TABLE "calendario" RENAME COLUMN "giornataSerieA" TO "giornata_serie_a"`,
    )
    await queryRunner.query(
      `ALTER TABLE "calendario" RENAME COLUMN "hasSovrapposta" TO "has_sovrapposta"`,
    )
    await queryRunner.query(
      `ALTER TABLE "calendario" RENAME COLUMN "hasGiocata" TO "has_giocata"`,
    )
    await queryRunner.query(
      `ALTER TABLE "calendario" RENAME COLUMN "hasDaRecuperare" TO "has_da_recuperare"`,
    )
    await queryRunner.query(
      `ALTER TABLE "calendario" RENAME COLUMN "dataFine" TO "data_fine"`,
    )

    //drop foreign key
    await queryRunner.query(
      `ALTER TABLE "calendario" DROP CONSTRAINT "FK_Calendario_Tornei"`,
    )
    await queryRunner.query(
      `ALTER TABLE "voto" DROP CONSTRAINT "FK_Voti_Calendario"`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" DROP CONSTRAINT "FK_Partite_Calendario"`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" DROP CONSTRAINT "FK_Partite_SquadreCasa"`,
    )
    await queryRunner.query(
      `ALTER TABLE "partita" DROP CONSTRAINT "FK_Partite_SquadreTrasferta"`,
    )
    await queryRunner.query(
      `ALTER TABLE "formazione" DROP CONSTRAINT "FK_Formazioni_Partite"`,
    )
    await queryRunner.query(
      `ALTER TABLE "formazione" DROP CONSTRAINT "FK_Formazioni_Utenti"`,
    )
    await queryRunner.query(
      `ALTER TABLE "voto" DROP CONSTRAINT "FK_Formazione_Giocatori"`,
    )
    await queryRunner.query(
      `ALTER TABLE "voto" DROP CONSTRAINT "FK_Voti_Giocatori"`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" DROP CONSTRAINT "FK_Trasferimenti_Giocatori"`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" DROP CONSTRAINT "FK_Trasferimenti_SquadreSerieA"`,
    )
    await queryRunner.query(
      `ALTER TABLE "trasferimento" DROP CONSTRAINT "FK_Trasferimenti_Utenti"`,
    )
    await queryRunner.query(
      `ALTER TABLE "classifica" DROP CONSTRAINT "FK_Classifiche_Tornei"`,
    )
    await queryRunner.query(
      `ALTER TABLE "classifica" DROP CONSTRAINT "FK_Classifiche_Utenti"`,
    )
    //add foreign key
    await queryRunner.query(
      `ALTER TABLE "partita" ADD CONSTRAINT "FK_Partite_Calendario" FOREIGN KEY ("id_calendario") REFERENCES "calendario"("id_calendario") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "voto" ADD CONSTRAINT "FK_Voti_Calendario" FOREIGN KEY ("id_calendario") REFERENCES "calendario"("id_calendario") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "calendario" ADD CONSTRAINT "FK_Calendario_Tornei" FOREIGN KEY ("id_torneo") REFERENCES "torneo"("id_torneo") ON DELETE RESTRICT ON UPDATE NO ACTION`,
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
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //albo trofei
    await queryRunner.query(
      `ALTER TABLE "albo_trofei" RENAME TO "AlboTrofei_new"`,
    )

    //stats_p
    await queryRunner.query(`ALTER TABLE "stats_p" RENAME TO "StatsP"`)
    await queryRunner.query(
      `ALTER TABLE "StatsP" RENAME COLUMN "squadra_serie_a" TO "squadraSerieA"`,
    )
    await queryRunner.query(
      `ALTER TABLE "StatsP" RENAME COLUMN "id_squadra" TO "idSquadra"`,
    )

    //stats_d
    await queryRunner.query(`ALTER TABLE "stats_d" RENAME TO "StatsD"`)
    await queryRunner.query(
      `ALTER TABLE "StatsD" RENAME COLUMN "squadra_serie_a" TO "squadraSerieA"`,
    )
    await queryRunner.query(
      `ALTER TABLE "StatsD" RENAME COLUMN "id_squadra" TO "idSquadra"`,
    )

    //stats_c
    await queryRunner.query(`ALTER TABLE "stats_c" RENAME TO "StatsC"`)
    await queryRunner.query(
      `ALTER TABLE "StatsC" RENAME COLUMN "squadra_serie_a" TO "squadraSerieA"`,
    )
    await queryRunner.query(
      `ALTER TABLE "StatsC" RENAME COLUMN "id_squadra" TO "idSquadra"`,
    )

    //stats_a
    await queryRunner.query(`ALTER TABLE "stats_a" RENAME TO "StatsA"`)
    await queryRunner.query(
      `ALTER TABLE "StatsA" RENAME COLUMN "squadra_serie_a" TO "squadraSerieA"`,
    )
    await queryRunner.query(
      `ALTER TABLE "StatsA" RENAME COLUMN "id_squadra" TO "idSquadra"`,
    )

    //flow_new_season
    await queryRunner.query(
      `ALTER TABLE "flow_new_season" RENAME TO "FlowNewSeasosn"`,
    )
    await queryRunner.query(
      `ALTER TABLE "FlowNewSeasosn" RENAME COLUMN "id_fase" TO "idFase"`,
    )

    //torneo
    await queryRunner.query(`ALTER TABLE "torneo" RENAME TO "Tornei"`)
    await queryRunner.query(
      `ALTER TABLE "Tornei" RENAME COLUMN "id_torneo" TO "idTorneo"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Tornei" RENAME COLUMN "gruppo_fase" TO "gruppoFase"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Tornei" RENAME COLUMN "has_classifica" TO "hasClassifica"`,
    )

    //classifica
    await queryRunner.query(`ALTER TABLE "classifica" RENAME TO "Classifiche"`)
    await queryRunner.query(
      `ALTER TABLE "Classifiche" RENAME COLUMN "id_squadra" TO "idSquadra"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Classifiche" RENAME COLUMN "id_torneo" TO "idTorneo"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Classifiche" RENAME COLUMN "vinte_casa" TO "vinteCasa"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Classifiche" RENAME COLUMN "pareggi_casa" TO "pareggiCasa"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Classifiche" RENAME COLUMN "perse_casa" TO "perseCasa"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Classifiche" RENAME COLUMN "vinte_trasferta" TO "vinteTrasferta"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Classifiche" RENAME COLUMN "pareggi_trasferta" TO "pareggiTrasferta"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Classifiche" RENAME COLUMN "perse_trasferta" TO "perseTrasferta"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Classifiche" RENAME COLUMN "gol_fatti" TO "golFatti"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Classifiche" RENAME COLUMN "gol_subiti" TO "golSubiti"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Classifiche" RENAME COLUMN "differenza_reti" TO "differenzaReti"`,
    )

    //utente
    await queryRunner.query(`ALTER TABLE "utente" RENAME TO "Utenti"`)
    await queryRunner.query(
      `ALTER TABLE "Utenti" RENAME COLUMN "id_utente" TO "idUtente"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Utenti" RENAME COLUMN "admin_level" TO "adminLevel"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Utenti" RENAME COLUMN "nome_squadra" TO "nomeSquadra"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Utenti" RENAME COLUMN "importo_base" TO "importoBase"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Utenti" RENAME COLUMN "importo_multe" TO "importoMulte"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Utenti" RENAME COLUMN "importo_mercato" TO "importoMercato"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Utenti" RENAME COLUMN "fanta_milioni" TO "fantaMilioni"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Utenti" RENAME COLUMN "campionato" TO "Campionato"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Utenti" RENAME COLUMN "champions" TO "Champions"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Utenti" RENAME COLUMN "secondo" TO "Secondo"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Utenti" RENAME COLUMN "terzo" TO "Terzo"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Utenti" RENAME COLUMN "lock_level" TO "lockLevel"`,
    )
    //trasferimento
    await queryRunner.query(
      `ALTER TABLE "trasferimento" RENAME TO "Trasferimenti"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Trasferimenti" RENAME COLUMN "id_trasferimento" TO "idTrasferimento"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Trasferimenti" RENAME COLUMN "id_giocatore" TO "idGiocatore"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Trasferimenti" RENAME COLUMN "id_squadra_serie_a" TO "idSquadraSerieA"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Trasferimenti" RENAME COLUMN "data_acquisto" TO "dataAcquisto"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Trasferimenti" RENAME COLUMN "data_cessione" TO "dataCessione"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Trasferimenti" RENAME COLUMN "id_squadra" TO "idSquadra"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Trasferimenti" RENAME COLUMN "has_ritirato" TO "hasRitirato"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Trasferimenti" RENAME COLUMN "nome_squadra_serie_a" TO "nomeSquadraSerieA"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Trasferimenti" RENAME COLUMN "nome_squadra" TO "nomeSquadra"`,
    )

    //serie a
    await queryRunner.query(`ALTER TABLE "serie_a" RENAME TO "SerieA"`)
    await queryRunner.query(
      `ALTER TABLE "SerieA" RENAME COLUMN "id_serie_a" TO "idSerieA"`,
    )
    await queryRunner.query(
      `ALTER TABLE "SerieA" RENAME COLUMN "squadra_home" TO "squadraHome"`,
    )
    await queryRunner.query(
      `ALTER TABLE "SerieA" RENAME COLUMN "squadra_away" TO "squadraAway"`,
    )

    //squadre serie a
    await queryRunner.query(
      `ALTER TABLE "squadra_serie_a" RENAME TO "SquadreSerieA"`,
    )
    await queryRunner.query(
      `ALTER TABLE "SquadreSerieA" RENAME COLUMN "id_squadra_serie_a" TO "idSquadraSerieA"`,
    )

    //giocatore
    await queryRunner.query(`ALTER TABLE "giocatore" RENAME TO "Giocatori"`)
    await queryRunner.query(
      `ALTER TABLE "Giocatori" RENAME COLUMN "id_giocatore" TO "idGiocatore"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Giocatori" RENAME COLUMN "nome_fanta_gazzetta" TO "nomeFantaGazzetta"`,
    )

    //voto
    await queryRunner.query(`ALTER TABLE "voto" RENAME TO "Voti"`)
    await queryRunner.query(
      `ALTER TABLE "Voti" RENAME COLUMN "id_voto" TO "idVoto"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Voti" RENAME COLUMN "id_giocatore" TO "idGiocatore"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Voti" RENAME COLUMN "id_calendario" TO "idCalendario"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Voti" RENAME COLUMN "id_formazione" TO "idFormazione"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Voti" RENAME COLUMN "altri_bonus" TO "altriBonus"`,
    )

    //formazione
    await queryRunner.query(`ALTER TABLE "formazione" RENAME TO "Formazioni"`)
    await queryRunner.query(
      `ALTER TABLE "Formazioni" RENAME COLUMN "id_formazione" TO "idFormazione"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Formazioni" RENAME COLUMN "id_squadra" TO "idSquadra"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Formazioni" RENAME COLUMN "id_partita" TO "idPartita"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Formazioni" RENAME COLUMN "data_ora" TO "dataOra"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Formazioni" RENAME COLUMN "has_bloccata" TO "hasBloccata"`,
    )

    //partita
    await queryRunner.query(`ALTER TABLE "partita" RENAME TO "Partite"`)
    await queryRunner.query(
      `ALTER TABLE "Partite" RENAME COLUMN "id_partita" TO "idPartita"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Partite" RENAME COLUMN "id_calendario" TO "idCalendario"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Partite" RENAME COLUMN "id_squadra_home" TO "idSquadraH"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Partite" RENAME COLUMN "id_squadra_away" TO "idSquadraA"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Partite" RENAME COLUMN "punti_home" TO "puntiH"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Partite" RENAME COLUMN "punti_away" TO "puntiA"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Partite" RENAME COLUMN "gol_home" TO "golH"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Partite" RENAME COLUMN "gol_away" TO "golA"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Partite" RENAME COLUMN "has_multa_home" TO "hasMultaH"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Partite" RENAME COLUMN "has_multa_away" TO "hasMultaA"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Partite" RENAME COLUMN "punteggio_home" TO "punteggioH"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Partite" RENAME COLUMN "punteggio_away" TO "punteggioA"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Partite" RENAME COLUMN "fattore_casalingo" TO "fattoreCasalingo"`,
    )

    //calendario
    await queryRunner.query(
      `ALTER TABLE "calendario" RENAME COLUMN "data_fine" TO "dataFine"`,
    )
    await queryRunner.query(
      `ALTER TABLE "calendario" RENAME COLUMN "has_da_recuperare" TO "hasDaRecuperare"`,
    )
    await queryRunner.query(
      `ALTER TABLE "calendario" RENAME COLUMN "has_giocata" TO "hasGiocata"`,
    )
    await queryRunner.query(
      `ALTER TABLE "calendario" RENAME COLUMN "has_sovrapposta" TO "hasSovrapposta"`,
    )
    await queryRunner.query(
      `ALTER TABLE "calendario" RENAME COLUMN "giornata_serie_a" TO "giornataSerieA"`,
    )
    await queryRunner.query(
      `ALTER TABLE "calendario" RENAME COLUMN "id_torneo" TO "idTorneo"`,
    )
    await queryRunner.query(
      `ALTER TABLE "calendario" RENAME COLUMN "id_calendario" TO "idCalendario"`,
    )
    await queryRunner.query(`ALTER TABLE "calendario" RENAME TO "Calendario"`)

    //drop foreign key
    await queryRunner.query(
      `ALTER TABLE "Calendario" DROP CONSTRAINT "FK_Calendario_Tornei"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Voti" DROP CONSTRAINT "FK_Voti_Calendario"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Partite" DROP CONSTRAINT "FK_Partite_Calendario"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Partite" DROP CONSTRAINT "FK_Partite_SquadreCasa"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Partite" DROP CONSTRAINT "FK_Partite_SquadreTrasferta"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Formazioni" DROP CONSTRAINT "FK_Formazioni_Partite"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Formazioni" DROP CONSTRAINT "FK_Formazioni_Utenti"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Voti" DROP CONSTRAINT "FK_Formazione_Giocatori"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Voti" DROP CONSTRAINT "FK_Voti_Giocatori"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Trasferimenti" DROP CONSTRAINT "FK_Trasferimenti_Giocatori"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Trasferimenti" DROP CONSTRAINT "FK_Trasferimenti_SquadreSerieA"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Trasferimenti" DROP CONSTRAINT "FK_Trasferimenti_Utenti"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Classifiche" DROP CONSTRAINT "FK_Classifiche_Tornei"`,
    )
    await queryRunner.query(
      `ALTER TABLE "Classifiche" DROP CONSTRAINT "FK_Classifiche_Utenti"`,
    )

    //add foreign key
    await queryRunner.query(
      `ALTER TABLE "Voti" ADD CONSTRAINT "FK_Voti_Calendario" FOREIGN KEY ("idCalendario") REFERENCES "Calendario"("idCalendario") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "Partite" ADD CONSTRAINT "FK_Partite_Calendario" FOREIGN KEY ("idCalendario") REFERENCES "Calendario"("idCalendario") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "Calendario" ADD CONSTRAINT "FK_Calendario_Tornei" FOREIGN KEY ("idTorneo") REFERENCES "Tornei"("idTorneo") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "Partite" ADD CONSTRAINT "FK_Partite_SquadreCasa" FOREIGN KEY ("idSquadraH") REFERENCES "Utenti"("idUtente") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "Partite" ADD CONSTRAINT "FK_Partite_SquadreTrasferta" FOREIGN KEY ("idSquadraA") REFERENCES "Utenti"("idUtente") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "Formazioni" ADD CONSTRAINT "FK_Formazioni_Partite" FOREIGN KEY ("idPartita") REFERENCES "Partite"("idPartita") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "Formazioni" ADD CONSTRAINT "FK_Formazioni_Utenti" FOREIGN KEY ("idSquadra") REFERENCES "Utenti"("idUtente") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "Voti" ADD CONSTRAINT "FK_Formazione_Giocatori" FOREIGN KEY ("idFormazione") REFERENCES "Formazioni"("idFormazione") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "Voti" ADD CONSTRAINT "FK_Voti_Giocatori" FOREIGN KEY ("idGiocatore") REFERENCES "Giocatori"("idGiocatore") ON DELETE RESTRICT ON UPDATE NO ACTION`,
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
      `ALTER TABLE "Classifiche" ADD CONSTRAINT "FK_Classifiche_Tornei" FOREIGN KEY ("idTorneo") REFERENCES "Tornei"("idTorneo") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "Classifiche" ADD CONSTRAINT "FK_Classifiche_Utenti" FOREIGN KEY ("idSquadra") REFERENCES "Utenti"("idUtente") ON DELETE RESTRICT ON UPDATE NO ACTION`,
    )
  }
}
