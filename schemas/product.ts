import { z } from "zod"

export const productSizeSchema = z.object({
  metric: z.string().optional(),
  size: z.number().optional(),
  customSize: z.string().optional(),
  sizeLetter: z.string().optional(),
  bust: z.number().optional(),
  waist: z.number().optional(),
  hips: z.number().optional(),
  length: z.number().optional(),
  sleeve: z.number().optional(),
  fit: z.string().optional(),
})

export const productColorSchema = z.object({
  color: z.string(),
  name: z.string(),
})

export const productSchema = z.object({
  id: z.string(),
  name: z.string(),
  image: z.string(),
  sub_category: z.string(),
  colors: z.array(z.string()),
  price: z.string(),
})

export const productDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  brand: z.string(),
  material: z.string(),
  price: z.number(),
  status: z.enum(["ONLINE", "OFFLINE", "DRAFT", "ARCHIVED"]),
  product_images: z.array(z.object({
    url: z.string(),
    id: z.string().optional(),
  })),
  variants: z.array(z.object({
    id: z.string().optional(),
    size: z.union([z.string(), productSizeSchema]),
    color: z.union([z.string(), productColorSchema]),
    stock_quantity: z.number(),
  })),
  categoryId: z.number(),
})

export const productVariantSchema = z.object({
  id: z.string().optional(),
  size: z.union([z.string(), productSizeSchema]),
  color: z.union([z.string(), productColorSchema]),
  stock_quantity: z.number(),
})
