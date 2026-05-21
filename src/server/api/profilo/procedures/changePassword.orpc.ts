import { verifyPassword, hashPassword } from '~/utils/hashPassword'
import { protectedProcedure } from '~/server/orpc'
import { Utenti } from '~/server/db/entities'
import { changePasswordSchema } from '~/schemas/auth'

export const changePasswordORPCProcedure = protectedProcedure
  .route({ method: 'POST', path: '/profilo/changePassword', summary: 'Cambia password utente' })
  .input(changePasswordSchema)
  .handler(async ({ input }) => {
    try {
      const user = await Utenti.findOne({
        select: { pwd: true },
        where: { idUtente: input.id },
      })
      if (!user) throw new Error('Utente non trovato')

      const oldPasswordMatch = await verifyPassword(input.oldPassword, user.pwd)
      if (!oldPasswordMatch)
        throw new Error('La vecchia password non è corretta')

      await Utenti.update(
        { idUtente: input.id },
        { pwd: await hashPassword(input.newPassword) },
      )
    } catch (error) {
      console.error('Si è verificato un errore', error)
      throw error
    }
  })
