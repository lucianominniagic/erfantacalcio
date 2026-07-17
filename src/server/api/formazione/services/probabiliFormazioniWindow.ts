const WINDOW_MILLISECONDS = 48 * 60 * 60 * 1000

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
