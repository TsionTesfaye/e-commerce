import { z } from "zod"

export const variantSchema = z.object({
  colorAmount: z
    .union([
      z.number().positive("Color amount must be a positive number"),
      z.string().trim().length(0),
    ])
    .refine(value => value !== "", {
      message: "Color amount is required",
    }),
  stock: z
    .union([
      z.number().positive("Stock amount must be a positive number"),
      z.string().trim().length(0),
    ])
    .refine(value => value !== "", {
      message: "Stock amount is required",
    }),
})



