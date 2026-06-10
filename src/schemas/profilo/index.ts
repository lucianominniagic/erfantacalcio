import { z } from 'zod'

export const uploadFotoVercelSchema = z.object({
  fileName: z.string(),
  fileData: z.string(),
})

export type UploadFotoVercelType = z.infer<typeof uploadFotoVercelSchema>
