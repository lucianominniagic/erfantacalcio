import { ORPCError } from '@orpc/server'
import { publicProcedure } from '~/server/orpc'
import { resetPasswordSchema } from '~/schemas/auth'
import { Utenti } from '~/server/db/entities'
import { hashPassword } from '~/utils/hashPassword'

export const resetPasswordORPCProcedure = publicProcedure
  .route({ method: 'POST', path: '/auth/resetPassword', summary: 'Reset password con token' })
  .input(resetPasswordSchema)
  .handler(async ({ input }) => {
    const utente = await Utenti.findOne({
      where: { resetToken: input.token },
    })

    if (!utente) {
      throw new ORPCError('NOT_FOUND', { message: 'Token non valido' })
    }

    if (!utente.resetTokenExpiresAt || utente.resetTokenExpiresAt < new Date()) {
      throw new ORPCError('BAD_REQUEST', { message: 'Token scaduto' })
    }

    await Utenti.update(
      { idUtente: utente.idUtente },
      {
        pwd: await hashPassword(input.newPassword),
        resetToken: null,
        resetTokenExpiresAt: null,
      },
    )
  })
