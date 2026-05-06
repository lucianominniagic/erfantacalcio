/**
 * votiService — logica pura per il calcolo bonus/malus dei voti giocatore.
 *
 * Nessuna dipendenza da contesto tRPC, DB o sessione.
 * Usa `BonusConfig` per disaccoppiare da `Configurazione` globale.
 */
import type { BonusConfig } from '~/config/bonus'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface VotoInput {
  Voto: number | null
  Ruolo: string
  Ammonizione: number
  Espulsione: number
  GolSegnati: number
  GolSubiti: number
  Assist: number
  Autogol: number
  RigoriParati?: number | null
  RigoriErrati?: number | null
}

export interface BonusVotoResult {
  voto: number
  ammonizione: number
  espulsione: number
  gol: number
  assist: number
  autogol: number
  altriBonus: number
}

// ─── Functions ────────────────────────────────────────────────────────────────

/**
 * Calcola il set di campi bonus/malus da salvare in `Voti` per un giocatore.
 *
 * Portiere: il campo `gol` usa `bonusGolSubito * GolSubiti`.
 * Campo player: `bonusGol * GolSegnati`.
 */
export function calcBonusVoto(
  input: VotoInput,
  config: Pick<
    BonusConfig,
    | 'bonusGol'
    | 'bonusGolSubito'
    | 'bonusAssist'
    | 'bonusAmmonizione'
    | 'bonusEspulsione'
    | 'bonusRigoreParato'
    | 'bonusRigoreSbagliato'
    | 'bonusAutogol'
  >,
): BonusVotoResult {
  return {
    voto: input.Voto ?? 0,
    ammonizione: input.Ammonizione === 1 ? config.bonusAmmonizione : 0,
    espulsione: input.Espulsione === 1 ? config.bonusEspulsione : 0,
    gol:
      input.Ruolo === 'P'
        ? input.GolSubiti * config.bonusGolSubito
        : input.GolSegnati * config.bonusGol,
    assist: input.Assist * config.bonusAssist,
    autogol: (input.Autogol * config.bonusAutogol) || 0, // Ensure +0, not -0
    altriBonus:
      (input.RigoriParati ?? 0) * config.bonusRigoreParato +
      (input.RigoriErrati ?? 0) * config.bonusRigoreSbagliato,
  }
}
