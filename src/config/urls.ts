/**
 * Configurazione URL esterni (immagini, campioncini, ecc.).
 * Validato con Zod al momento dell'import.
 */
import { z } from 'zod'

// ─── Schema ──────────────────────────────────────────────────────────────────

export const urlsConfigSchema = z.object({
  /** URL base per le immagini campioncino (formato normale) */
  urlCampioncino: z.string(),
  /** URL base per le immagini campioncino (formato small) */
  urlCampioncinoSmall: z.string(),
})

export type UrlsConfig = z.infer<typeof urlsConfigSchema>

// ─── Valore validato (fail-fast al momento dell'import) ───────────────────────

export const urlsConfig: UrlsConfig = urlsConfigSchema.parse({
  urlCampioncino: process.env.NEXT_PUBLIC_CAMPIONCINO ?? '',
  urlCampioncinoSmall: process.env.NEXT_PUBLIC_CAMPIONCINO_SMALL ?? '',
})
