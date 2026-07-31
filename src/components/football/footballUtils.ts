/**
 * Utility helpers per i componenti football.
 * Solo funzioni pure — nessuna dipendenza da React o MUI.
 */

/** Formato data + ora (es. "06 gen, 14:00") nel fuso Europe/Rome */
export function formatMatchDateTime(utcDate: string): string {
  try {
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Rome',
    }).format(new Date(utcDate))
  } catch {
    return utcDate
  }
}

/** Formato solo data (es. "sab 06 gen") nel fuso Europe/Rome */
export function formatMatchDate(utcDate: string): string {
  try {
    return new Intl.DateTimeFormat('it-IT', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      timeZone: 'Europe/Rome',
    }).format(new Date(utcDate))
  } catch {
    return utcDate
  }
}

/** Formato solo ora (es. "14:00") nel fuso Europe/Rome */
export function formatMatchTime(utcDate: string): string {
  try {
    return new Intl.DateTimeFormat('it-IT', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Rome',
    }).format(new Date(utcDate))
  } catch {
    return utcDate
  }
}

/** Etichetta stagione (es. "2024/25") da anno di inizio */
export function formatSeason(year: string): string {
  const start = parseInt(year, 10)
  return `${start}/${String(start + 1).slice(-2)}`
}
