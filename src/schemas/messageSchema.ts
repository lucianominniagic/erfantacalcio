import { z } from 'zod'

export const messageSchema = z.object({
  isError: z.boolean().default(false),
  isComplete: z.boolean().default(false),
  message: z.string().default(''),
})

export type Message = z.infer<typeof messageSchema>
