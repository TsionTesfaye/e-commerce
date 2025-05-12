<script setup lang="ts">
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

definePageMeta({
  layout: "admin",
})

type Product = {
  id: string
  name: string
  image: string
  variants: any[]
  stock: number
  price: string
}

type ApiResponse = {
  data: any[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

// Reactive data
const products = ref<Product[]>([])
const isLoading = ref(false)
const currentPage = ref(1)
const itemsPerPage = 20 // Set to 20 products per page
const totalItems = ref(0)
const totalPages = ref(0)
const currentStatus = ref("ALL")

const passUrl = computed(() => {
  const queryParams = new URLSearchParams({
    page: currentPage.value.toString(),
    pageSize: itemsPerPage.toString(),
  })

  // Only add status parameter if it's not "ALL"
  if (currentStatus.value !== "ALL") {
    queryParams.append("status", currentStatus.value)
  }

  return `https://online-shop-1-afra.onrender.com/products?${queryParams.toString()}`
})

async function fetchProducts(): Promise<ApiResponse> {
  try {
    const response = await $fetch<ApiResponse>(passUrl.value)
    return response
  } catch (error) {
    console.error("Error fetching products:", error)
    return { data: [], page: 1, pageSize: 20, total: 0, totalPages: 0 }
  }
}

function processItems(items: any[]): Product[] {
  if (!items || !Array.isArray(items)) {
    return []
  }

  return items.map((item) => {
    try {
      // Handle image URL
      let imageUrl = "/placeholder-image.jpg"
      if (item?.product_images?.[0]?.url) {
        imageUrl = `https://online-shop-1-afra.onrender.com/file/${item.product_images[0].url}`
      }

      // Calculate total stock from variants
      const totalStock = item?.variants?.reduce((sum: number, variant: any) => {
        return sum + (Number(variant.stock_quantity) || 0)
      }, 0) || 0

      // Handle price conversion safely
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
        variants: item?.variants || [],
        stock: totalStock,
        price: priceValue,
      }
    } catch (error) {
      console.error("Error processing item:", error)
      return {
        id: "error-id",
        name: "Error Loading Product",
        image: "/placeholder-image.jpg",
        variants: [],
        stock: 0,
        price: "0.00",
      }
    }
  })
}

const { execute: fetchItems } = useAsyncData("products", async () => {
  isLoading.value = true
  const response = await fetchProducts()
  products.value = processItems(response.data)
  totalItems.value = response.total
  totalPages.value = response.totalPages
  isLoading.value = false
  return response
}, {
  watch: [passUrl],
  immediate: true,
})

// Function to change the current page
async function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    await fetchItems()
  }
}

// Add navigation function with error handling
async function navigateToProduct(id: string) {
  try {
    if (!id) {
      console.error("No product ID provided")
      return
    }
    await navigateTo(`/admin/products/${id}`)
  } catch (error) {
    console.error("Error navigating to product:", error)
  }
}

// Function to change status
async function changeStatus(status: string | number) {
  currentStatus.value = status as string
  currentPage.value = 1 // Reset to first page when changing status
  await fetchItems()
}

// Add a helper function to format price
function formatPrice(price: string | number) {
  const num = typeof price === "string" ? Number.parseFloat(price) : price
  return Number.isInteger(num) ? num.toString() : num.toFixed(2)
}
</script>

<template>
  <div class="min-h-screen overflow-hidden bg-gray-100">
    <div class="mx-auto max-w-6xl p-8">
      <div class="overflow-hidden rounded-lg bg-white shadow-md">
        <div class="w-full p-8">
          <div class="mb-8 flex items-center justify-between">
            <h1 class="text-3xl font-bold">
              Products
            </h1>
            <NuxtLink
              to="/admin"
              class="bg-primary text-primary-foreground ring-offset-background hover:bg-primary/90 focus-visible:ring-ring inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add New Product
            </NuxtLink>
          </div>

          <div class="mb-8">
            <Tabs :model-value="currentStatus" @update:model-value="changeStatus">
              <TabsList class="grid w-full grid-cols-5">
                <TabsTrigger value="ALL">
                  All
                </TabsTrigger>
                <TabsTrigger value="ONLINE">
                  Online
                </TabsTrigger>
                <TabsTrigger value="DRAFT">
                  Draft
                </TabsTrigger>
                <TabsTrigger value="OFFLINE">
                  Offline
                </TabsTrigger>
                <TabsTrigger value="ARCHIVED">
                  Archived
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <div class="w-full">
            <Table>
              <TableHeader>
                <TableRow class="border-none">
                  <TableHead class="w-[50px]">
                    #
                  </TableHead>
                  <TableHead>Image</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Total Stock</TableHead>
                  <TableHead class="text-right">
                    Price
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <template v-if="isLoading">
                  <TableRow v-for="i in 10" :key="i" class="border-none">
                    <TableCell>
                      <div class="size-4 animate-pulse rounded bg-gray-200" />
                    </TableCell>
                    <TableCell>
                      <div class="size-16 animate-pulse rounded bg-gray-200" />
                    </TableCell>
                    <TableCell>
                      <div class="space-y-2">
                        <div class="h-4 w-32 animate-pulse rounded bg-gray-200" />
                        <div class="h-3 w-24 animate-pulse rounded bg-gray-200" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div class="h-4 w-8 animate-pulse rounded bg-gray-200" />
                    </TableCell>
                    <TableCell>
                      <div class="h-4 w-12 animate-pulse rounded bg-gray-200" />
                    </TableCell>
                    <TableCell>
                      <div class="ml-auto h-4 w-16 animate-pulse rounded bg-gray-200" />
                    </TableCell>
                  </TableRow>
                </template>
                <template v-else-if="products.length === 0">
                  <TableRow class="border-none">
                    <TableCell colspan="6" class="h-24 text-center">
                      <div class="flex flex-col items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="size-12 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                          <line x1="3" y1="6" x2="21" y2="6" />
                          <path d="M16 10a4 4 0 0 1-8 0" />
                        </svg>
                        <p class="text-lg font-medium text-gray-500">
                          No products found
                        </p>
                        <p class="text-sm text-gray-400">
                          Try changing your filters or add a new product
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                </template>
                <template v-else>
                  <TableRow
                    v-for="(product, index) in products"
                    :key="product.id"
                    class="cursor-pointer border-none transition-colors hover:bg-gray-50"
                    @click="navigateToProduct(product.id)"
                  >
                    <TableCell class="font-medium">
                      {{ (currentPage - 1) * itemsPerPage + index + 1 }}
                    </TableCell>
                    <TableCell>
                      <img :src="product.image" :alt="product.name" class="size-16 rounded object-cover">
                    </TableCell>
                    <TableCell>{{ product.name }}</TableCell>
                    <TableCell>{{ product.variants.length }}</TableCell>
                    <TableCell>{{ product.stock }}</TableCell>
                    <TableCell class="text-right">
                      {{ formatPrice(product.price) }} Birr
                    </TableCell>
                  </TableRow>
                </template>
              </TableBody>
            </Table>

            <div v-if="totalPages > 1" class="border-t p-4">
              <div class="flex items-center justify-center gap-2">
                <button
                  v-for="page in totalPages"
                  :key="page"
                  class="inline-flex size-8 items-center justify-center rounded-md text-sm font-medium ring-1 ring-inset transition-colors"
                  :class="[
                    currentPage === page
                      ? 'bg-primary text-primary-foreground ring-primary'
                      : 'bg-white text-gray-700 ring-gray-200 hover:bg-gray-50',
                  ]"
                  @click="goToPage(page)"
                >
                  {{ page }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.animate-pulse {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* Remove table borders */
:deep(.table) {
  border-collapse: separate;
  border-spacing: 0;
}

:deep(.table th),
:deep(.table td) {
  border: none;
}

/* Prevent scrolling */
html, body {
  height: 100%;
  overflow: hidden;
}
</style>
