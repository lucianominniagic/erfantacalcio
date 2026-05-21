import { randomBytes } from 'crypto'
import { publicProcedure } from '~/server/orpc'
import { requestPasswordResetSchema } from '~/schemas/auth'
import { Utenti } from '~/server/db/entities'
import { ReSendMailAsync } from '~/service/mailSender'

function buildResetPasswordHtml(data: { presidente: string; resetUrl: string }): string {
  return `Notifica automatica da erFantacalcio.com<br><br>
Ciao ${data.presidente},<br><br>
Hai richiesto il recupero della password per il tuo account erFantacalcio.<br><br>
Clicca il link seguente per impostare una nuova password (valido per 1 ora):<br>
<a href="${data.resetUrl}">${data.resetUrl}</a><br><br>
Se non hai richiesto questo recupero, ignora questa email.<br><br>
https://www.erfantacalcio.com<br><br>
Saluti dal Vostro immenso Presidente`
}

export const requestPasswordResetORPCProcedure = publicProcedure
  .route({ method: 'POST', path: '/auth/requestPasswordReset', summary: 'Richiesta reset password' })
  .input(requestPasswordResetSchema)
  .handler(async ({ input }) => {
    const utente = await Utenti.findOne({ where: { mail: input.email } })

    // Risposta neutra — non rivela se l'email esiste o meno
    if (!utente) return

    const token = randomBytes(32).toString('hex') // 64 chars hex
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // +1 ora

    await Utenti.update(
      { idUtente: utente.idUtente },
      { resetToken: token, resetTokenExpiresAt: expiresAt },
    )

    const resetUrl = `https://www.erfantacalcio.com/reset-password?token=${token}`
    await ReSendMailAsync(
      utente.mail,
      '',
      'Recupero password — erFantacalcio',
      buildResetPasswordHtml({ presidente: utente.presidente, resetUrl }),
    )
  })
