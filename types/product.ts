export type Product = {
  id: string
  name: string
  image: string
  sub_category: string
  colors: string[]
  price: string
}

export type ProductDetail = {
  id: string
  name: string
  description: string
  brand: string
  material: string
  price: number
  status: "ONLINE" | "OFFLINE" | "DRAFT" | "ARCHIVED"
  product_images: ProductImage[]
  variants: ProductVariant[]
  categoryId: number
  [key: string]: any
}

export type ProductImage = {
  url: string
  id?: string
}

export type ProductVariant = {
  id?: string
  size: ProductSize | string
  color: ProductColor | string
  stock_quantity: number
}

export type ProductSize = {
  metric?: string
  size?: number // Numeric size value
  customSize?: string // For accessories
  sizeLetter?: string // For clothing (S, M, L, XL)
  bust?: number
  waist?: number
  hips?: number
  length?: number
  sleeve?: number
  fit?: string
}

export type ProductColor = {
  color: string
  name: string
}
