/**
 * Configurazione colonne del file PF (FantaGazzetta).
 * Ogni valore indica l'indice (0-based) della colonna nel CSV/XLS di importazione.
 * Validato con Zod al momento dell'import.
 */
import { z } from 'zod'

// ─── Schema ──────────────────────────────────────────────────────────────────

export const pfConfigSchema = z.object({
  /** Numero totale di colonne attese nel file PF */
  pfColumns: z.number().int().min(0),
  pfColumnIdGiocatore: z.number().int().min(0),
  pfColumnNome: z.number().int().min(0),
  pfColumnRuolo: z.number().int().min(0),
  pfColumnSquadra: z.number().int().min(0),
  pfColumnVoto: z.number().int().min(0),
  pfColumnAssist: z.number().int().min(0),
  pfColumnAmmo: z.number().int().min(0),
  pfColumnEspu: z.number().int().min(0),
  pfColumnGolFatti: z.number().int().min(0),
  pfColumnGolSubiti: z.number().int().min(0),
  pfColumnRigErrato: z.number().int().min(0),
  pfColumnRigParato: z.number().int().min(0),
  pfColumnAutogol: z.number().int().min(0),
})

export type PfConfig = z.infer<typeof pfConfigSchema>

// ─── Helper: parse int con fallback ──────────────────────────────────────────

const parseIntEnv = (key: string, fallback: number): number =>
  parseInt(process.env[key] ?? String(fallback), 10)

// ─── Valore validato (fail-fast al momento dell'import) ───────────────────────

export const pfConfig: PfConfig = pfConfigSchema.parse({
  pfColumns: parseIntEnv('NEXT_PUBLIC_PF_COUNT', 35),
  pfColumnIdGiocatore: parseIntEnv('NEXT_PUBLIC_PF_IDGIOCATORE', 0),
  pfColumnNome: parseIntEnv('NEXT_PUBLIC_PF_NOME', 0),
  pfColumnRuolo: parseIntEnv('NEXT_PUBLIC_PF_RUOLO', 0),
  pfColumnSquadra: parseIntEnv('NEXT_PUBLIC_PF_SQUADRA', 0),
  pfColumnVoto: parseIntEnv('NEXT_PUBLIC_PF_VOTO', 0),
  pfColumnAssist: parseIntEnv('NEXT_PUBLIC_PF_ASSIST', 0),
  pfColumnAmmo: parseIntEnv('NEXT_PUBLIC_PF_AMMO', 0),
  pfColumnEspu: parseIntEnv('NEXT_PUBLIC_PF_ESPU', 0),
  pfColumnGolFatti: parseIntEnv('NEXT_PUBLIC_PF_GOLFATTI', 0),
  pfColumnGolSubiti: parseIntEnv('NEXT_PUBLIC_PF_GOLSUBITI', 0),
  pfColumnRigErrato: parseIntEnv('NEXT_PUBLIC_PF_RIGERRATO', 0),
  pfColumnRigParato: parseIntEnv('NEXT_PUBLIC_PF_RIGPARATO', 0),
  pfColumnAutogol: parseIntEnv('NEXT_PUBLIC_PF_AUTOGOL', 0),
})
