import { z } from "zod"

export const cosmeticSchema = z.object({
  metric: z.string().optional(),
  size: z.union([
    z.number({
      invalid_type_error: "Size must be a number",
    })
      .positive("Size must be a positive number")
      .optional(),
    z.literal(""),
  ]),
  customSize: z.string().optional(),
}).superRefine((data, ctx) => {
  if (!data.metric && (data.size !== undefined && data.size !== "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Metric is required when size value is provided",
      path: ["metric"],
    })
    if (!data.size && data.metric !== undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Size value is required when metric is provided",
        path: ["size"],
      })
    }
  }
})



