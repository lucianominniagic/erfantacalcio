/**
 * Schema Zod per `magliaType` — la configurazione grafica della maglia.
 *
 * Sostituisce i `JSON.parse(...) as magliaType` sparsi nel codebase con un
 * parsing sicuro e validato. Usa `magliaSchema.parse(JSON.parse(raw))` oppure
 * `magliaSchema.safeParse(JSON.parse(raw))` a seconda che si voglia un
 * errore esplicito o un fallback graceful.
 */
import { z } from 'zod'

export const magliaSchema = z.object({
  mainColor: z.string(),
  secondaryColor: z.string(),
  thirdColor: z.string(),
  textColor: z.string(),
  shirtNumber: z.number(),
  selectedTemplate: z.string(),
})

export type MagliaType = z.infer<typeof magliaSchema>

/**
 * Parsa in modo sicuro una stringa JSON nella struttura `MagliaType`.
 * Restituisce `null` se la stringa è vuota, non è JSON valido, o non
 * rispetta lo schema.
 */
export const parseMaglia = (raw: string | null | undefined): MagliaType | null => {
  if (!raw) return null
  try {
    const result = magliaSchema.safeParse(JSON.parse(raw))
    return result.success ? result.data : null
  } catch {
    return null
  }
}
