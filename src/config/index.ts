/**
 * Barrel di re-esportazione della configurazione dell'app.
 *
 * Esporta `Configurazione` con la stessa forma dell'originale `src/config.ts`
 * per garantire zero breaking change a tutti i consumer esistenti.
 *
 * Struttura interna:
 *   - bonus   → configurazione bonus/malus
 *   - pf      → colonne file PF (FantaGazzetta)
 *   - dates   → date di stagione
 *   - urls    → URL risorse esterne
 *   - season  → dati stagione, locale, contatori
 */
export { bonusConfig, bonusConfigSchema } from './bonus'
export type { BonusConfig } from './bonus'

export { pfConfig, pfConfigSchema } from './pf'
export type { PfConfig } from './pf'

export { datesConfig, datesConfigSchema } from './dates'
export type { DatesConfig } from './dates'

export { urlsConfig, urlsConfigSchema } from './urls'
export type { UrlsConfig } from './urls'

export { seasonConfig, seasonConfigSchema } from './season'
export type { SeasonConfig } from './season'

// ─── Importa i sub-moduli ─────────────────────────────────────────────────────

import { bonusConfig } from './bonus'
import { pfConfig } from './pf'
import { datesConfig } from './dates'
import { urlsConfig } from './urls'
import { seasonConfig } from './season'

// ─── Configurazione — shape identica a src/config.ts (backward compat) ────────

export const Configurazione = {
  // ── Season
  stagione: seasonConfig.stagione,
  stagionePrecedente: seasonConfig.stagionePrecedente,
  recordCount: seasonConfig.recordCount,
  percentualeMinimaGiocate: seasonConfig.percentualeMinimaGiocate,
  locale: seasonConfig.locale,

  // ── URLs
  urlCampioncino: urlsConfig.urlCampioncino,
  urlCampioncinoSmall: urlsConfig.urlCampioncinoSmall,

  // ── Bonus
  bonusFattoreCasalingo: bonusConfig.bonusFattoreCasalingo,
  bonusGol: bonusConfig.bonusGol,
  bonusAssist: bonusConfig.bonusAssist,
  bonusGolSubito: bonusConfig.bonusGolSubito,
  bonusAmmonizione: bonusConfig.bonusAmmonizione,
  bonusEspulsione: bonusConfig.bonusEspulsione,
  bonusRigoreParato: bonusConfig.bonusRigoreParato,
  bonusRigoreSbagliato: bonusConfig.bonusRigoreSbagliato,
  bonusAutogol: bonusConfig.bonusAutogol,
  bonusSenzaVoto: bonusConfig.bonusSenzaVoto,
  bonusModulo: bonusConfig.bonusModulo,
  bonusModulo541: bonusConfig.bonusModulo541,
  bonusModulo451: bonusConfig.bonusModulo451,
  bonusModulo532: bonusConfig.bonusModulo532,
  bonusModulo442: bonusConfig.bonusModulo442,
  bonusModulo352: bonusConfig.bonusModulo352,
  bonusModulo433: bonusConfig.bonusModulo433,
  bonusModulo343: bonusConfig.bonusModulo343,
  maxSostituzioni: bonusConfig.maxSostituzioni,
  importoMulta: bonusConfig.importoMulta,
  importoQuotaAnnuale: bonusConfig.importoQuotaAnnuale,

  // ── PF columns
  pfColumns: pfConfig.pfColumns,
  pfColumnIdGiocatore: pfConfig.pfColumnIdGiocatore,
  pfColumnNome: pfConfig.pfColumnNome,
  pfColumnRuolo: pfConfig.pfColumnRuolo,
  pfColumnSquadra: pfConfig.pfColumnSquadra,
  pfColumnVoto: pfConfig.pfColumnVoto,
  pfColumnAssist: pfConfig.pfColumnAssist,
  pfColumnAmmo: pfConfig.pfColumnAmmo,
  pfColumnEspu: pfConfig.pfColumnEspu,
  pfColumnGolFatti: pfConfig.pfColumnGolFatti,
  pfColumnGolSubiti: pfConfig.pfColumnGolSubiti,
  pfColumnRigErrato: pfConfig.pfColumnRigErrato,
  pfColumnRigParato: pfConfig.pfColumnRigParato,
  pfColumnAutogol: pfConfig.pfColumnAutogol,

  // ── Dates
  dataGiornata1SerieA: datesConfig.dataGiornata1SerieA,
  mercatoSettembre: datesConfig.mercatoSettembre,
} as const
