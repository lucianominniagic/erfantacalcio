/**
 * Schemi Zod per il dominio "Mercato Svincolati — Aste al Buio".
 *
 * Ogni schema copre l'input di una singola procedura tRPC; i tipi inferiti
 * vengono esportati nominalmente così il frontend può importarli senza
 * duplicare la definizione.
 */
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Enum
// ---------------------------------------------------------------------------

/**
 * Valuta usata per le offerte in una sessione di mercato.
 * - `fantamilioni` → valuta virtuale del fantacalcio
 * - `euro`         → valuta reale (aste di fine stagione ecc.)
 */
export const tipoValutaEnum = z.enum(['fantamilioni', 'euro'])

export type TipoValuta = z.infer<typeof tipoValutaEnum>

// ---------------------------------------------------------------------------
// createSessioneSchema — adminProcedure
// ---------------------------------------------------------------------------

/**
 * Input per creare una nuova sessione di mercato ad asta al buio.
 *
 * Vincolo cross-field: `dataChiusura` deve essere strettamente successiva
 * a `dataApertura`.
 */
export const createSessioneSchema = z
  .object({
    dataApertura: z.coerce.date(),
    dataChiusura: z.coerce.date(),
    maxProposte: z.number().int().min(1),
    tipoValuta: tipoValutaEnum.default('fantamilioni'),
  })
  .refine((data) => data.dataChiusura > data.dataApertura, {
    message: 'dataChiusura deve essere successiva a dataApertura',
    path: ['dataChiusura'],
  })

export type CreateSessioneInput = z.infer<typeof createSessioneSchema>

// ---------------------------------------------------------------------------
// createPropostaSchema — protectedProcedure
// ---------------------------------------------------------------------------

/**
 * Input per sottomettere una proposta d'acquisto in una sessione aperta.
 */
export const createPropostaSchema = z.object({
  idGiocatore: z.number().int().positive(),
  prezzoOfferto: z.number().positive().min(1),
})

export type CreatePropostaInput = z.infer<typeof createPropostaSchema>

// ---------------------------------------------------------------------------
// deletePropostaSchema — protectedProcedure
// ---------------------------------------------------------------------------

/**
 * Input per revocare una proposta precedentemente inviata.
 * L'utente può eliminare solo le proprie proposte (il router si occupa
 * del controllo di ownership).
 */
export const deletePropostaSchema = z.object({
  idProposta: z.number().int().positive(),
})

export type DeletePropostaInput = z.infer<typeof deletePropostaSchema>

// ---------------------------------------------------------------------------
// getProposteSessioneSchema — adminProcedure
// ---------------------------------------------------------------------------

/**
 * Input per recuperare tutte le proposte di una sessione chiusa.
 * Riservato agli admin per la fase di aggiudicazione.
 */
export const getProposteSessioneSchema = z.object({
  idSessione: z.number().int().positive(),
})

export type GetProposteSessioneInput = z.infer<typeof getProposteSessioneSchema>

// ---------------------------------------------------------------------------
// getGiocatoriSvincolatiSchema — protectedProcedure
// ---------------------------------------------------------------------------

/**
 * Input per ottenere la lista giocatori svincolati filtrata per ruolo e stagione.
 */
export const getGiocatoriSvincolatiSchema = z.object({
  ruolo: z.enum(['P', 'D', 'C', 'A']),
  stagione: z.string().min(1),
})

export type GetGiocatoriSvincolatiInput = z.infer<typeof getGiocatoriSvincolatiSchema>
