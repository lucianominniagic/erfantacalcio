import { TRPCError } from '@trpc/server'
import { publicProcedure } from '~/server/api/trpc'
import { resetPasswordSchema } from '~/schemas/auth'
import { Utenti } from '~/server/db/entities'
import { hashPassword } from '~/utils/hashPassword'

export const resetPasswordProcedure = publicProcedure
  .input(resetPasswordSchema)
  .mutation(async ({ input }) => {
    const utente = await Utenti.findOne({
      where: { resetToken: input.token },
    })

    if (!utente) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'Token non valido' })
    }

    if (!utente.resetTokenExpiresAt || utente.resetTokenExpiresAt < new Date()) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Token scaduto' })
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