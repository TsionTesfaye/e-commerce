import { z } from "zod"

export const clothingSchema = z.object({
  sizeLetters: z.string({ required_error: "Size letter is required" }).nonempty("Size letter is required"),
  bust: z.union([
    z.number({
      invalid_type_error: "Bust size must be a number",
    })
      .positive("Size must be a positive number")
      .optional(),
    z.literal(""),
  ]),
  waist: z.union([
    z.number({
      invalid_type_error: "Waist Size must be a number",
    })
      .positive("Size must be a positive number")
      .optional(),
    z.literal(""),
  ]),
  hips: z.union([
    z.number({
      invalid_type_error: "Hips size must be a number",
    })
      .positive("Size must be a positive number")
      .optional(),
    z.literal(""),
  ]),
  length: z.union([
    z.number({
      invalid_type_error: "Length must be a number",
    })
      .positive("Size must be a positive number")
      .optional(),
    z.literal(""),
  ]),
  sleeve: z.union([
    z.number({
      invalid_type_error: "Sleeve size must be a number",
    })
      .positive("Size must be a positive number")
      .optional(),
    z.literal(""),
  ]),
  fit: z.string().optional(),
  customSize: z.string().optional(),
})
