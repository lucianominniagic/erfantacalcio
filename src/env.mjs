import { z } from 'zod'
import { createEnv } from '@t3-oss/env-nextjs'

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
    NEXTAUTH_SECRET:
      process.env.NODE_ENV === 'production'
        ? z.string().min(1)
        : z.string().min(1).optional(),
    NEXTAUTH_URL: z.preprocess(
      // This makes Vercel deployments not fail if you don't set NEXTAUTH_URL
      // Since NextAuth.js automatically uses the VERCEL_URL if present.
      (str) => process.env.VERCEL_URL ?? str,
      // VERCEL_URL doesn't include `https` so it cant be validated as a URL
      process.env.VERCEL ? z.string().min(1) : z.string().url(),
    ),
    // Add `.min(1) on ID and SECRET if you want to make sure they're not empty
    JWT_SECRET: z.string().optional(),
    CRON_SECRET:
      process.env.NODE_ENV === 'production'
        ? z.string().min(1)
        : z.string().min(1).optional(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_STAGIONE: z.string(),
    NEXT_PUBLIC_LOCALE: z.string(),
    NEXT_PUBLIC_FATTORE_CASALINGO: z.number(),
    NEXT_PUBLIC_BONUS_GOL: z.number(),
    NEXT_PUBLIC_BONUS_ASSIST: z.number(),
    NEXT_PUBLIC_BONUS_GOLSUBITO: z.number(),
    NEXT_PUBLIC_BONUS_AMMONIZIONE: z.number(),
    NEXT_PUBLIC_BONUS_ESPULSIONE: z.number(),
    NEXT_PUBLIC_BONUS_RIGOREPARATO: z.number(),
    NEXT_PUBLIC_BONUS_RIGORESBAGLIATO: z.number(),
    NEXT_PUBLIC_BONUS_AUTOGOL: z.number(),
    NEXT_PUBLIC_BONUS_SENZA_VOTO: z.number(),
    NEXT_PUBLIC_SOSTITUZIONI: z.number(),
    NEXT_PUBLIC_BONUS_MODULO: z.boolean(),
    NEXT_PUBLIC_RECORDCOUNT: z.number(),
    NEXT_PUBLIC_PERCENTUALE_MINIMA_GIOCATE: z.number(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    JWT_SECRET: process.env.JWT_SECRET,
    CRON_SECRET: process.env.CRON_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXT_PUBLIC_STAGIONE: process.env.NEXT_PUBLIC_STAGIONE,
    NEXT_PUBLIC_RECORDCOUNT: Number(process.env.NEXT_PUBLIC_RECORDCOUNT),
    NEXT_PUBLIC_PERCENTUALE_MINIMA_GIOCATE: Number(
      process.env.NEXT_PUBLIC_PERCENTUALE_MINIMA_GIOCATE,
    ),
    NEXT_PUBLIC_LOCALE: process.env.NEXT_PUBLIC_LOCALE,
    NEXT_PUBLIC_FATTORE_CASALINGO: Number(
      process.env.NEXT_PUBLIC_FATTORE_CASALINGO,
    ),
    NEXT_PUBLIC_BONUS_GOL: Number(process.env.NEXT_PUBLIC_BONUS_GOL),
    NEXT_PUBLIC_BONUS_ASSIST: Number(process.env.NEXT_PUBLIC_BONUS_ASSIST),
    NEXT_PUBLIC_BONUS_GOLSUBITO: Number(
      process.env.NEXT_PUBLIC_BONUS_GOLSUBITO,
    ),
    NEXT_PUBLIC_BONUS_AMMONIZIONE: Number(
      process.env.NEXT_PUBLIC_BONUS_AMMONIZIONE,
    ),
    NEXT_PUBLIC_BONUS_ESPULSIONE: Number(
      process.env.NEXT_PUBLIC_BONUS_ESPULSIONE,
    ),
    NEXT_PUBLIC_BONUS_RIGOREPARATO: Number(
      process.env.NEXT_PUBLIC_BONUS_RIGOREPARATO,
    ),
    NEXT_PUBLIC_BONUS_RIGORESBAGLIATO: Number(
      process.env.NEXT_PUBLIC_BONUS_RIGORESBAGLIATO,
    ),
    NEXT_PUBLIC_BONUS_AUTOGOL: Number(process.env.NEXT_PUBLIC_BONUS_AUTOGOL),
    NEXT_PUBLIC_BONUS_SENZA_VOTO: Number(
      process.env.NEXT_PUBLIC_BONUS_SENZA_VOTO,
    ),
    NEXT_PUBLIC_SOSTITUZIONI: Number(process.env.NEXT_PUBLIC_SOSTITUZIONI),
    NEXT_PUBLIC_BONUS_MODULO: process.env.NEXT_PUBLIC_BONUS_MODULO === 'true',
  },
})

// Export optional environment variables separately for backward compatibility
export const optionalEnv = {
  NEXT_PUBLIC_MULTA: Number(process.env.NEXT_PUBLIC_MULTA ?? '0'),
  NEXT_PUBLIC_BONUS_MODULO_343: Number(
    process.env.NEXT_PUBLIC_BONUS_MODULO_343 ?? '0',
  ),
  NEXT_PUBLIC_BONUS_MODULO_352: Number(
    process.env.NEXT_PUBLIC_BONUS_MODULO_352 ?? '0',
  ),
  NEXT_PUBLIC_BONUS_MODULO_433: Number(
    process.env.NEXT_PUBLIC_BONUS_MODULO_433 ?? '0',
  ),
  NEXT_PUBLIC_BONUS_MODULO_442: Number(
    process.env.NEXT_PUBLIC_BONUS_MODULO_442 ?? '0',
  ),
  NEXT_PUBLIC_BONUS_MODULO_451: Number(
    process.env.NEXT_PUBLIC_BONUS_MODULO_451 ?? '0',
  ),
  NEXT_PUBLIC_BONUS_MODULO_532: Number(
    process.env.NEXT_PUBLIC_BONUS_MODULO_532 ?? '0',
  ),
  NEXT_PUBLIC_BONUS_MODULO_541: Number(
    process.env.NEXT_PUBLIC_BONUS_MODULO_541 ?? '0',
  ),
}
