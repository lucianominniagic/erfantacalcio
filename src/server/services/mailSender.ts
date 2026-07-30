import { env } from 'process'
import { Resend } from 'resend'

/**
 * Invia una mail tramite Resend.
 *
 * - Se `MAIL_ENABLED !== 'true'` la funzione ritorna immediatamente senza
 *   istanziare il client Resend né effettuare chiamate di rete.
 * - `cc` vuoto (`''`) viene omesso dalla chiamata API.
 * - Gli errori dell'API Resend vengono loggati ma non rilanciati; il chiamante
 *   è responsabile di decidere la semantica d'errore al proprio livello.
 */
export async function ReSendMailAsync(
  to: string,
  cc: string,
  subject: string,
  htmlMessage: string,
) {
  if (env.MAIL_ENABLED !== 'true') {
    console.info('Mail disabilitata (MAIL_ENABLED != true), skip invio a:', to)
    return
  }

  // Istanziazione lazy: Resend non viene creato quando la mail è disabilitata.
  const resend = new Resend(env.MAIL_API_KEY)

  const { data, error } = await resend.emails.send({
    from: env.MAIL_FROM ?? 'notify@erfantacalcio.com',
    to,
    ...(cc !== '' && { cc }),
    subject,
    html: htmlMessage,
  })

  if (error) {
    console.error('Errore invio mail:', error)
    return
  }
  console.info('Mail inviata con successo:', data)
}
