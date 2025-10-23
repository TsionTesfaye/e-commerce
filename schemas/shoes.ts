import { z } from "zod"

export const shoesSchema = z.object({
  metric: z.string().min(1, "Size standard is required"),
  size: z
    .union([
      z.number().positive("Size must be a positive number"),
      z.string().min(1, "Size is required"),
    ])
    .transform(val => (typeof val === "string" ? Number(val) || undefined : val)),
}).superRefine((data, ctx) => {
  if (!data.metric && data.size) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Size standard is required when size is provided",
      path: ["metric"],
    })
  }
  if (!data.size && data.metric) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Size is required when size standard is provided",
      path: ["size"],
    })
  }
})



