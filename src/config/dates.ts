/**
 * Configurazione date di stagione: inizio Serie A, finestre di mercato.
 * Validato con Zod al momento dell'import.
 *
 * NOTA: il pattern `new Date(process.env.X!) ?? new Date()` nell'originale
 * config.ts era difettoso — `new Date(undefined)` restituisce un Invalid Date
 * (non null/undefined) quindi il fallback `?? new Date()` non scattava mai.
 * Qui il valore viene validato esplicitamente; in assenza di variabile d'ambiente
 * si usa una data di default (1 gennaio dell'anno corrente) con un warning.
 */
import { z } from 'zod'

// ─── Schema ──────────────────────────────────────────────────────────────────

export const datesConfigSchema = z.object({
  /** Data della prima giornata di Serie A */
  dataGiornata1SerieA: z.date(),
  /** Data di apertura del mercato di settembre */
  mercatoSettembre: z.date(),
})

export type DatesConfig = z.infer<typeof datesConfigSchema>

// ─── Helper: parse safe date da stringa env ───────────────────────────────────

const parseDateEnv = (key: string, fallback: Date): Date => {
  const raw = process.env[key]
  if (!raw) {
    console.warn(
      `[config/dates] Variabile d'ambiente ${key} non impostata, uso fallback: ${fallback.toISOString()}`,
    )
    return fallback
  }
  const d = new Date(raw)
  if (isNaN(d.getTime())) {
    console.warn(
      `[config/dates] ${key}="${raw}" non è una data valida, uso fallback: ${fallback.toISOString()}`,
    )
    return fallback
  }
  return d
}

const defaultDate = new Date(new Date().getFullYear(), 0, 1) // 1 gennaio anno corrente

// ─── Valore validato (fail-fast al momento dell'import) ───────────────────────

export const datesConfig: DatesConfig = datesConfigSchema.parse({
  dataGiornata1SerieA: parseDateEnv(
    'NEXT_PUBLIC_DATA_GIORNATA_1_SERIEA',
    defaultDate,
  ),
  mercatoSettembre: parseDateEnv(
    'NEXT_PUBLIC_DATA_MERCATO_SETTEMBRE',
    defaultDate,
  ),
})
