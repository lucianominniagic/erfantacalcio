/**
 * Helpers puri per la presentazione dei tornei/giornate.
 *
 * Nessuna dipendenza da DB, tRPC o sessione.
 * Usati lato server nei mapper del calendario e dei risultati.
 *
 * NOTA: `getDescrizioneGiornata` qui ha firma (nome, giornata, giornataSerieA, gruppoFase)
 * e produce la label stile "Campionato 3ª giornata (25ª giornata serie A)".
 * Non confondere con `getDescrizioneGiornata` in `~/utils/helper` che ha firma
 * e formato diversi, usata lato client.
 */

export function getDescrizioneGiornata(
  nome: string,
  giornata: number,
  giornataSerieA: number,
  gruppoFase?: string | null,
): string {
  if (gruppoFase === null || gruppoFase === undefined) {
    return `${nome} ${giornata}ª giornata (${giornataSerieA}ª giornata serie A)`
  } else if (gruppoFase === 'A' || gruppoFase === 'B') {
    return `Gruppo ${gruppoFase} - ${nome} ${giornata}ª giornata (${giornataSerieA}ª giornata serie A)`
  } else {
    return `${gruppoFase} - ${nome} ${giornata}ª giornata (${giornataSerieA}ª giornata serie A)`
  }
}

export function getTorneoTitle(
  nome: string,
  giornata: number,
  gruppoFase?: string | null,
): string {
  if (gruppoFase === null || gruppoFase === undefined) {
    return `${nome} ${giornata}ª giornata`
  } else if (gruppoFase === 'A' || gruppoFase === 'B') {
    return `Gruppo ${gruppoFase} - ${nome} ${giornata}ª giornata`
  } else {
    return `${gruppoFase} - ${nome} ${giornata}ª giornata`
  }
}

export function getTorneoSubTitle(giornataSerieA: number): string {
  return `${giornataSerieA}ª giornata serie A`
}

export function getTorneo(nome: string, gruppoFase?: string | null): string {
  return gruppoFase ? `${nome.trim()} ${gruppoFase.trim()}` : nome.trim()
}
