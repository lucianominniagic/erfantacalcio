export const WINDOW_HOURS = 72
const WINDOW_MILLISECONDS = WINDOW_HOURS * 60 * 60 * 1000

export function isInProbabiliFormazioniWindow(
  now: Date,
  dataInizio: Date,
): boolean {
  const nowTime = now.getTime()
  const dataInizioTime = dataInizio.getTime()

  return (
    nowTime >= dataInizioTime - WINDOW_MILLISECONDS && nowTime < dataInizioTime
  )
}
