/**
 * Configurazione bonus/malus e modificatori di voto.
 * Tutti i valori sono validati con Zod al momento dell'import.
 */
import { z } from 'zod'
import { env } from '~/env.mjs'

// ─── Schema ──────────────────────────────────────────────────────────────────

export const bonusConfigSchema = z.object({
  /** Bonus fattore casalingo (interi; 0 = disabilitato) */
  bonusFattoreCasalingo: z.number().int(),
  bonusGol: z.number(),
  bonusAssist: z.number(),
  bonusGolSubito: z.number(),
  bonusAmmonizione: z.number(),
  bonusEspulsione: z.number(),
  bonusRigoreParato: z.number(),
  bonusRigoreSbagliato: z.number(),
  bonusAutogol: z.number(),
  bonusSenzaVoto: z.number(),
  /** Se true, si applica il bonus modulo al calcolo fantapunti */
  bonusModulo: z.boolean(),
  bonusModulo541: z.number(),
  bonusModulo451: z.number(),
  bonusModulo532: z.number(),
  bonusModulo442: z.number(),
  bonusModulo352: z.number(),
  bonusModulo433: z.number(),
  bonusModulo343: z.number(),
  maxSostituzioni: z.number().int().min(0),
  importoMulta: z.number().int().min(0),
  importoQuotaAnnuale: z.number().int().min(0),
})

export type BonusConfig = z.infer<typeof bonusConfigSchema>

// ─── Helper: parseFloat con fallback (tollera valori con virgola finale) ──────

const pfloat = (key: string, fallback: number): number => {
  const raw = process.env[key]
  if (!raw) return fallback
  const v = parseFloat(raw)
  return isNaN(v) ? fallback : v
}

const pint = (key: string, fallback: number): number => {
  const raw = process.env[key]
  if (!raw) return fallback
  const v = parseInt(raw, 10)
  return isNaN(v) ? fallback : v
}

// ─── Valore validato (fail-fast al momento dell'import) ───────────────────────

export const bonusConfig: BonusConfig = bonusConfigSchema.parse({
  bonusFattoreCasalingo: env.NEXT_PUBLIC_FATTORE_CASALINGO,
  bonusGol: env.NEXT_PUBLIC_BONUS_GOL,
  bonusAssist: env.NEXT_PUBLIC_BONUS_ASSIST,
  bonusGolSubito: env.NEXT_PUBLIC_BONUS_GOLSUBITO,
  bonusAmmonizione: env.NEXT_PUBLIC_BONUS_AMMONIZIONE,
  bonusEspulsione: env.NEXT_PUBLIC_BONUS_ESPULSIONE,
  bonusRigoreParato: env.NEXT_PUBLIC_BONUS_RIGOREPARATO,
  bonusRigoreSbagliato: env.NEXT_PUBLIC_BONUS_RIGORESBAGLIATO,
  bonusAutogol: env.NEXT_PUBLIC_BONUS_AUTOGOL,
  bonusSenzaVoto: env.NEXT_PUBLIC_BONUS_SENZA_VOTO,
  bonusModulo: env.NEXT_PUBLIC_BONUS_MODULO,
  // Usare parseFloat (non Number) perché il .env può avere valori con virgola finale (es. "1.5,")
  bonusModulo541: pfloat('NEXT_PUBLIC_BONUS_MODULO_541', 1.5),
  bonusModulo451: pfloat('NEXT_PUBLIC_BONUS_MODULO_451', 1),
  bonusModulo532: pfloat('NEXT_PUBLIC_BONUS_MODULO_532', 0.5),
  bonusModulo442: pfloat('NEXT_PUBLIC_BONUS_MODULO_442', 0),
  bonusModulo352: pfloat('NEXT_PUBLIC_BONUS_MODULO_352', -0.5),
  bonusModulo433: pfloat('NEXT_PUBLIC_BONUS_MODULO_433', -1),
  bonusModulo343: pfloat('NEXT_PUBLIC_BONUS_MODULO_343', -1.5),
  maxSostituzioni: env.NEXT_PUBLIC_SOSTITUZIONI,
  importoMulta: pint('NEXT_PUBLIC_MULTA', 10),
  importoQuotaAnnuale: pint('NEXT_PUBLIC_QUOTA_ANNUALE', 120),
})

