export type ApiResponse<T = any> = {
  data: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export type Category = {
  id: string
  name: string
  displayName: string
  image: string
}

export type SubCategory = {
  id: string
  name: string
  image: string
}

export type AdminProduct = {
  id: string
  name: string
  description: string
  price: string
  brand: string
  material: string
  category_id: string
  sub_category_id: string
  status: "ONLINE" | "OFFLINE" | "DRAFT" | "ARCHIVED"
  product_images: Array<{
    id: string
    url: string
  }>
  variants: Array<any>
}

export type AdminProductListItem = {
  id: string
  name: string
  image: string
  variants: any[]
  stock: number
  price: string
}

export type ProductForm = {
  name: string
  description: string
  brand: string | undefined
  sub_category_id: string
  material: string | undefined
  returnPolicy: boolean
  variants: any[]
  price: number
  images: { file: File, url: string }[]
}
