import { z } from "zod"

export const accessorySchema = z.object({
  customSize: z.string().optional(),
})
