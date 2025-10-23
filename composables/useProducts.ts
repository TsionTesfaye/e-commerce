import type { ApiResponse } from "~/types/api"
import type { Product, ProductDetail } from "~/types/product"

export function useProducts() {
  const { buildUrl } = useApi()

  const fetchProducts = async (params: {
    page?: number
    pageSize?: number
    category?: string
    sub_category?: string
    min_price?: number
    max_price?: number
    search?: string
    created_at?: string
    price?: string
  } = {}): Promise<ApiResponse> => {
    try {
      const response = await $fetch(buildUrl("/product", params))
      return response && typeof response === "object" && "data" in response
        ? response as ApiResponse
        : { data: [], page: 1, pageSize: 8, total: 0, totalPages: 0 }
    } catch (error) {
      console.error("Error fetching products:", error)
      return { data: [], page: 1, pageSize: 8, total: 0, totalPages: 0 }
    }
  }

  const fetchProductById = async (id: string): Promise<ProductDetail | null> => {
    try {
      const response = await $fetch(buildUrl(`/product/${id}`))
      return response && typeof response === "object" && "id" in response
        ? response as ProductDetail
        : null
    } catch (error) {
      console.error("Error fetching product:", error)
      return null
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await $fetch(buildUrl("/categories"))
      return response || []
    } catch (error) {
      console.error("Error fetching categories:", error)
      return []
    }
  }

  const fetchSubCategories = async (categoryName: string) => {
    try {
      const response = await $fetch(buildUrl(`/sub-categories/category-name/${categoryName}`))
      return response || []
    } catch (error) {
      console.error("Error fetching subcategories:", error)
      return []
    }
  }

  const processItems = (items: any[]): Product[] => {
    if (!items || !Array.isArray(items)) {
      return []
    }

    return items.map((item) => {
      try {
        // handle image URL
        let imageUrl = "/placeholder-image.jpg"
        if (item?.product_images?.[0]?.url) {
          imageUrl = `${useRuntimeConfig().public.apiEndpoint}/file/${item.product_images[0].url}`
        }

        // ensure we get unique, non-empty color strings
        const colors = Array.from(
          new Set(
            item?.variants
              ?.map((variant: any) => variant?.color?.color)
              ?.filter((color: any) => typeof color === "string" && color.trim() !== ""),
          ),
        ) || []

        // handle price conversion safely-ish
        let priceValue = "0.00"
        if (item?.price) {
          const numericPrice = typeof item.price === "string"
            ? Number.parseFloat(item.price)
            : Number(item.price)

          if (!Number.isNaN(numericPrice)) {
            priceValue = numericPrice.toFixed(2)
          }
        }

        return {
          id: item?.id?.toString() || "unknown-id",
          name: item?.name?.toString() || "Unnamed Product",
          image: imageUrl,
          sub_category: item?.sub_category?.toString() || "",
          colors: colors as string[],
          price: priceValue,
        }
      } catch (error) {
        console.error("Error processing item:", error)
        return {
          id: "error-id",
          name: "Error Loading Product",
          image: "/placeholder-image.jpg",
          sub_category: "",
          colors: [],
          price: "0.00",
        }
      }
    })
  }

  return {
    fetchProducts,
    fetchProductById,
    fetchCategories,
    fetchSubCategories,
    processItems,
  }
}
