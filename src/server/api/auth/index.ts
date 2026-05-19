import { createTRPCRouter } from '~/server/api/trpc'
import { requestPasswordResetProcedure } from './procedures/requestPasswordReset'
import { resetPasswordProcedure } from './procedures/resetPassword'

export const authRouter = createTRPCRouter({
  requestPasswordReset: requestPasswordResetProcedure,
  resetPassword: resetPasswordProcedure,
})
