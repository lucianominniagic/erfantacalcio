import { z } from 'zod'

export const squadraSerieASchema = z.object({
  idSquadraSerieA: z.number(),
  nome: z.string().trim().min(1, 'campo obbligatorio').max(50),
  maglia: z.string().trim().min(1, 'campo obbligatorio').max(50),
})

export type SquadraSerieASchemaType = z.infer<typeof squadraSerieASchema>
