import { z } from "zod"

export const variantFormSchema = z.object({
  color: z.string().optional(),
  colorName: z.string().min(1, "Color name is required"),
  stock_quantity: z
    .union([
      z.number().positive("Stock amount must be a positive number"),
      z.string().trim().min(1, "Stock amount is required"),
    ])
    .transform(val => (typeof val === "string" ? Number.parseInt(val) || 0 : val)),
})



