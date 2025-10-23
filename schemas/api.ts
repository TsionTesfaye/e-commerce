import { z } from "zod"

export const apiResponseSchema = z.object({
  data: z.array(z.any()),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number(),
})

export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  displayName: z.string(),
  image: z.string(),
})

export const subCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
})



