import CryptoJS from 'crypto-js'
import bcrypt from 'bcryptjs'

const BCRYPT_ROUNDS = 10

/**
 * Calcola l'hash MD5 di una password (uppercase hex, 32 chars).
 * Legacy — usato internamente per la lazy migration e per il confronto
 * con gli hash MD5 ancora presenti nel DB.
 */
export function computeMD5Hash(password: string): string {
  return CryptoJS.MD5(password).toString().toUpperCase()
}

/** Alias esplicito per uso interno. */
export const hashMD5 = computeMD5Hash

/**
 * Ritorna true se l'hash sembra un MD5 uppercase (32 caratteri hex).
 */
function isMD5Hash(hash: string): boolean {
  return /^[0-9A-F]{32}$/.test(hash)
}

/**
 * Hasha una password con bcrypt (rounds: 10).
 * Da usare per nuove password e al momento del re-hash durante lazy migration.
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

/**
 * Verifica una password contro un hash che può essere bcrypt o MD5 legacy.
 *
 * Strategia:
 * - Se l'hash inizia con `$2b$` (o `$2a$`) → confronto bcrypt diretto.
 * - Se l'hash sembra un MD5 (32 hex uppercase) → confronto MD5.
 * - Altrimenti → false.
 *
 * Non esegue la lazy migration: quella responsabilità resta nel credentials
 * provider di auth.config.ts, che ha accesso al DB.
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  if (hash.startsWith('$2b$') || hash.startsWith('$2a$')) {
    return bcrypt.compare(password, hash)
  }

  if (isMD5Hash(hash)) {
    return computeMD5Hash(password) === hash
  }

  return false
}
