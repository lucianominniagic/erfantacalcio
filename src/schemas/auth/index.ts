/**
 * Schema Zod per le procedure tRPC di autenticazione e gestione password.
 *
 * Esporta schemi e tipi inferiti per:
 * - `requestPasswordResetSchema` — richiesta reset via email
 * - `resetPasswordSchema`        — impostazione nuova password tramite token
 * - `changePasswordSchema`       — cambio password da utente autenticato
 */
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Richiesta reset password (unauthenticated)
// ---------------------------------------------------------------------------

export const requestPasswordResetSchema = z.object({
  /** Email dell'account per cui si vuole avviare il reset. */
  email: z.string().email(),
})

export type RequestPasswordResetInput = z.infer<typeof requestPasswordResetSchema>

// ---------------------------------------------------------------------------
// Reset password tramite token (unauthenticated)
// ---------------------------------------------------------------------------

export const resetPasswordSchema = z.object({
  /** Token monouso ricevuto via email. */
  token: z.string().min(1),
  /** Nuova password — minimo 6 caratteri (coerente con `loginFormSchema`). */
  newPassword: z.string().min(6),
})

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>

// ---------------------------------------------------------------------------
// Cambio password da utente autenticato (authenticated)
// ---------------------------------------------------------------------------

export const changePasswordSchema = z.object({
  /** ID numerico dell'utente autenticato. */
  id: z.number().int().positive(),
  /** Password attuale — non può essere vuota. */
  oldPassword: z.string().min(1),
  /** Nuova password — minimo 6 caratteri (coerente con `loginFormSchema`). */
  newPassword: z.string().min(6),
})

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
