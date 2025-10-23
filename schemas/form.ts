import { z } from "zod"

export const productFormSchema = z.object({
  name: z.string({ required_error: "Name of the product is required" }).nonempty("Name of the product is required"),
  variant: z
    .union([
      z.number().positive("Variant must be a positive number"),
      z.string().trim().length(0),
    ])
    .refine(value => value !== "", {
      message: "Variant is required",
    }),
  description: z.string({ required_error: "Description is required" }).nonempty("Description is required"),
  brand: z.string().optional(),
  category: z.string({ required_error: "Category is required" }).nonempty("Category is required"),
  subCategory: z.string({ required_error: "Sub Category is required" }).nonempty("Sub Category is required"),
  material: z.string().optional(),
  returnPolicy: z.string({ required_error: "Return Policy is required" }).nonempty("Return Policy is required"),
  price: z
    .union([
      z.number().positive("Price must be a positive number"),
      z.string().trim().length(0),
    ])
    .refine(value => value !== "", {
      message: "Price is required",
    }),
  images: z.instanceof(File).optional(),
})

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

export const sizeFormSchema = z.object({
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



