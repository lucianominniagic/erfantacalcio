import { env } from 'process'
import { Resend } from 'resend'

const resend = new Resend(env.MAIL_API_KEY)

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

  const { data, error } = await resend.emails.send({
    from: env.MAIL_FROM ?? 'notify@erfantacalcio.com',
    to: to,
    cc: cc,
    subject: subject,
    html: htmlMessage,
  })

  if (error) {
    return console.error('Errore invio mail:', error)
  }
  console.info('Mail inviata con successo:', data)
}
