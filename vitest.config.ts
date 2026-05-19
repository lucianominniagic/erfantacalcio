import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
    // Env vars for unit tests — values chosen to match test expectations:
    //   BONUS_MODULO enabled, SENZA_VOTO=1 per sostituzione, SOSTITUZIONI=9 (no cap before 9),
    //   FATTORE_CASALINGO=1 (test assertions use 1, not the production value 2)
    env: {
      NEXTAUTH_URL: 'http://localhost:3000',
      NEXT_PUBLIC_STAGIONE: '2025-2026',
      NEXT_PUBLIC_LOCALE: 'it-IT',
      NEXT_PUBLIC_RECORDCOUNT: '100',
      NEXT_PUBLIC_PERCENTUALE_MINIMA_GIOCATE: '30',
      NEXT_PUBLIC_FATTORE_CASALINGO: '1',
      NEXT_PUBLIC_BONUS_GOL: '3',
      NEXT_PUBLIC_BONUS_ASSIST: '1',
      NEXT_PUBLIC_BONUS_GOLSUBITO: '-1',
      NEXT_PUBLIC_BONUS_AMMONIZIONE: '-0.5',
      NEXT_PUBLIC_BONUS_ESPULSIONE: '-1',
      NEXT_PUBLIC_BONUS_RIGOREPARATO: '3',
      NEXT_PUBLIC_BONUS_RIGORESBAGLIATO: '-3',
      NEXT_PUBLIC_BONUS_AUTOGOL: '-2',
      NEXT_PUBLIC_BONUS_SENZA_VOTO: '1',
      NEXT_PUBLIC_SOSTITUZIONI: '9',
      NEXT_PUBLIC_BONUS_MODULO: 'true',
      NEXT_PUBLIC_BONUS_MODULO_541: '1.5',
      NEXT_PUBLIC_BONUS_MODULO_451: '1',
      NEXT_PUBLIC_BONUS_MODULO_532: '0.5',
      NEXT_PUBLIC_BONUS_MODULO_442: '0',
      NEXT_PUBLIC_BONUS_MODULO_352: '-0.5',
      NEXT_PUBLIC_BONUS_MODULO_433: '-1',
      NEXT_PUBLIC_BONUS_MODULO_343: '-1.5',
    },
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: [
        'src/**/*.test.ts',
        'src/app/**',
        'src/components/**',
        'src/styles/**',
        'src/theme/**',
        'src/env.mjs',
        'src/env.js',
        'src/types/**',
      ],
    },
  },
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './src'),
    },
  },
})
