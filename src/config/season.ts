/**
 * Configurazione generale di stagione (stringhe, contatori, locale).
 * Validato con Zod al momento dell'import.
 */
import { z } from 'zod'
import { env } from '~/env.mjs'

// ─── Schema ──────────────────────────────────────────────────────────────────

export const seasonConfigSchema = z.object({
  /** Stagione corrente, es. "2024-25" */
  stagione: z.string().min(1),
  /** Stagione precedente, es. "2023-24" */
  stagionePrecedente: z.string(),
  /** Numero di record mostrati nelle liste paginate */
  recordCount: z.number().int().positive(),
  /** Percentuale minima di partite giocate per comparire nelle statistiche */
  percentualeMinimaGiocate: z.number().int().min(0).max(100),
  /** Locale per formattazione date/numeri */
  locale: z.string().min(2),
})

export type SeasonConfig = z.infer<typeof seasonConfigSchema>

// ─── Valore validato (fail-fast al momento dell'import) ───────────────────────

export const seasonConfig: SeasonConfig = seasonConfigSchema.parse({
  stagione: env.NEXT_PUBLIC_STAGIONE,
  stagionePrecedente: process.env.NEXT_PUBLIC_STAGIONEPRECEDENTE ?? '',
  recordCount: env.NEXT_PUBLIC_RECORDCOUNT,
  percentualeMinimaGiocate: env.NEXT_PUBLIC_PERCENTUALE_MINIMA_GIOCATE,
  locale: env.NEXT_PUBLIC_LOCALE,
})
