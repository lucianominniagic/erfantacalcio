import { verifyPassword, hashPassword } from '~/utils/hashPassword'
import { protectedProcedure } from '~/server/api/trpc'
import { Utenti } from '~/server/db/entities'
import { changePasswordSchema } from '~/schemas/auth'

export const changePasswordProcedure = protectedProcedure
  .input(changePasswordSchema)
  .mutation(async (opts) => {
    try {
      const user = await Utenti.findOne({
        select: { pwd: true },
        where: { idUtente: opts.input.id },
      })
      if (!user) throw new Error('Utente non trovato')

      const oldPasswordMatch = await verifyPassword(opts.input.oldPassword, user.pwd)
      if (!oldPasswordMatch)
        throw new Error('La vecchia password non è corretta')

      // Nuove password salvate sempre come bcrypt.
      await Utenti.update(
        { idUtente: opts.input.id },
        { pwd: await hashPassword(opts.input.newPassword) },
      )
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
