import { z } from 'zod'

export const utenteSchema = z.object({
  id: z.number(),
  isAdmin: z.boolean(),
  isLockLevel: z.boolean(),
  presidente: z.string().min(4),
  email: z.string().email(),
  squadra: z.string().min(4),
  foto: z.string(),
  importoAnnuale: z.number(),
  importoMulte: z.number(),
  importoMercato: z.number(),
  fantamilioni: z.number(),
})

export const loginFormSchema = z.object({
  username: z.string().email().or(z.string().min(3).max(20)),
  password: z.string().min(6),
})
