import type { PaletteColor, PaletteColorOptions } from '@mui/material/styles'

// ── Tipo per i colori per ruolo giocatore ──────────────────────────────────
// Ogni ruolo ha un singolo valore stringa (colore CSS).
// P = portiere, D = difensore, C = centrocampista, A = attaccante
export interface RuoloPalette {
  P: string
  D: string
  C: string
  A: string
}

declare module '@mui/material/styles' {
  interface Palette {
    champions: PaletteColor
    ruolo: RuoloPalette
  }
  interface PaletteOptions {
    champions?: PaletteColorOptions
    ruolo?: Partial<RuoloPalette>
  }
}
