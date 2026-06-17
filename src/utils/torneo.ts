/**
 * Helpers puri per la presentazione dei tornei/giornate.
 *
 * Nessuna dipendenza da DB, tRPC o sessione.
 * Usati lato server e lato client.
 *
 * Due varianti di descrizione giornata:
 * - `getDescrizioneGiornataExtended`: label lunga server-side, es. "Campionato 3ª giornata (25ª giornata serie A)"
 * - `getDescrizioneGiornataCompact`: label compatta client-side, es. "Serie A 25 - Campionato 3 girone A"
 */

import { z } from 'zod'
import { calendarioSchema } from '~/schemas/calendario'

export function getDescrizioneGiornataExtended(
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

export function getDescrizioneGiornataCompact(
  giornataSerieA: number,
  nomeTorneo: string,
  giornata: number,
  gruppoFase: string | null,
): string {
  return `Serie A ${giornataSerieA} - ${nomeTorneo} ${giornata === 0 ? '' : giornata} ${gruppoFase ? (gruppoFase.length === 1 ? `girone ${gruppoFase}` : gruppoFase) : ''}`.trimEnd()
}

export function getNomeTorneo(nome: string, gruppo: string | null): string {
  return `${nome} ${gruppo ? `girone ${gruppo}` : ''}`.trim()
}

export function getIdNextGiornata(
  calendarioList: z.infer<typeof calendarioSchema>[],
): number | undefined {
  return calendarioList?.find((item) => item.isSelected)?.id ?? undefined
}
