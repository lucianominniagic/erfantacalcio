import type { PaletteColor, PaletteColorOptions } from '@mui/material/styles'

declare module '@mui/material/styles' {
  interface Palette {
    champions: PaletteColor
  }
  interface PaletteOptions {
    champions?: PaletteColorOptions
  }
}
