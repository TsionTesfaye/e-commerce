<script setup lang="ts">
import AddVariantDialog from "@/components/admin/add-variant-dialog.vue"
import ProductEditDialog from "@/components/admin/product-edit-dialog.vue"
import StockQuantityDialog from "@/components/admin/stock-quantity-dialog.vue"
import VariantEditDialog from "@/components/admin/variant-edit-dialog.vue"

definePageMeta({
  layout: "admin",
})

const route = useRoute()
const id = route.params.id

type Category = {
  id: string
  name: string
}

type SubCategory = {
  id: string
  name: string
}

type Product = {
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

const product = ref<Product | null>(null)
const category = ref<Category | null>(null)
const subCategory = ref<SubCategory | null>(null)
const categories = ref<Category[]>([])
const subCategories = ref<SubCategory[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// Update the computed property to check for valid data
const _isDataLoaded = computed(() => {
  return Boolean(
    product.value
    && Array.isArray(categories.value)
    && categories.value.length > 0
    && Array.isArray(subCategories.value)
    && subCategories.value.length > 0,
  )
})

// Add computed property for active variants
const activeVariants = computed(() => {
  if (!product.value) {
    return []
  }
  return product.value.variants.filter((variant: any) => variant.status === "ONLINE")
})

function _formatSize(size: any, categoryName: string) {
  if (!size) {
    return "N/A"
  }

  const category = categoryName?.toUpperCase()

  switch (category) {
    case "SHOES": {
      return `${size.size || ""} ${size.metric || ""}`.trim() || "N/A"
    }
    case "CLOTHING": {
      const measurements = []
      if (size.fit) {
        measurements.push(`Fit: ${size.fit}`)
      }
      if (size.bust) {
        measurements.push(`Bust: ${size.bust}cm`)
      }
      if (size.waist) {
        measurements.push(`Waist: ${size.waist}cm`)
      }
      if (size.hips) {
        measurements.push(`Hips: ${size.hips}cm`)
      }
      if (size.length) {
        measurements.push(`Length: ${size.length}cm`)
      }
      if (size.sleeve) {
        measurements.push(`Sleeve: ${size.sleeve}cm`)
      }

      // If there's a custom size, show it along with measurements
      if (size.customSize) {
        return measurements.length
          ? `${size.customSize} (${measurements.join(", ")})`
          : size.customSize
      }

      // If there's a size letter, show it with measurements
      if (size.sizeLetter) {
        return measurements.length
          ? `${size.sizeLetter.toUpperCase()} (${measurements.join(", ")})`
          : size.sizeLetter.toUpperCase()
      }

      return measurements.length ? measurements.join(", ") : "N/A"
    }
    case "COSMETICS": {
      return size.customSize || `${size.size || ""} ${size.metric || ""}`.trim() || "N/A"
    }
    case "ACCESSORIES": {
      return size.customSize || "One Size"
    }
    default: {
      return size.sizeLetter || size.customSize || "N/A"
    }
  }
}

// Add a helper function to capitalize only the first letter
function capitalizeFirstLetter(string: string | undefined) {
  if (!string) {
    return ""
  }
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

// Add a helper function to format price
function formatPrice(price: string | number) {
  const num = typeof price === "string" ? Number.parseFloat(price) : price
  return Number.isInteger(num) ? num.toString() : num.toFixed(2)
}

async function fetchProductDetails() {
  try {
    isLoading.value = true
    error.value = null

    // Fetch all categories and subcategories

    // Fetch product details
    const productRes = await $fetch<Product>(`https://online-shop-1-afra.onrender.com/products/${id}`)
    if (!productRes) {
      throw new Error("Product not found")
    }

    // Process images
    if (productRes.product_images?.length > 0) {
      productRes.product_images = productRes.product_images.map(img => ({
        ...img,
        url: `https://online-shop-1-afra.onrender.com/file/${img.url}`,
      }))
    }

    // Fetch category and subcategory details
    const [categoryRes, subCategoryRes] = await Promise.all([
      $fetch<Category>(`https://online-shop-1-afra.onrender.com/categories/${productRes.category_id}`),
      $fetch<SubCategory>(`https://online-shop-1-afra.onrender.com/sub-categories/${productRes.sub_category_id}`),
    ])

    product.value = productRes
    category.value = categoryRes
    subCategory.value = subCategoryRes

    const [categoriesRes, subCategoriesRes] = await Promise.all([
      $fetch<Category[]>("https://online-shop-1-afra.onrender.com/categories"),
      $fetch<SubCategory[]>(`https://online-shop-1-afra.onrender.com/sub-categories/category-name/${categoryRes.name}`),
    ])

    categories.value = categoriesRes
    subCategories.value = subCategoriesRes
  } catch (err) {
    console.error("Error fetching product details:", err)
    error.value = "Failed to load product details"
  } finally {
    isLoading.value = false
  }
}

function handleVariantUpdate(_updatedVariant: any) {
  // Refetch product details after successful variant update
  fetchProductDetails()
}

function handleProductUpdate(_updatedProduct: any) {
  // Refetch product details after successful product update
  fetchProductDetails()
}

// Add function to handle status change
async function updateProductStatus(newStatus: "ONLINE" | "OFFLINE" | "DRAFT" | "ARCHIVED") {
  if (!product.value) {
    return
  }

  try {
    let response
    if (newStatus === "ONLINE" && product.value.status === "DRAFT") {
      // Special endpoint for publishing draft products
      response = await $fetch(`https://online-shop-1-afra.onrender.com/products/${id}/set-status/online`, {
        method: "PATCH",
      })
    } else if (newStatus === "OFFLINE" && product.value.status === "ONLINE") {
      // Special endpoint for taking products offline
      response = await $fetch(`https://online-shop-1-afra.onrender.com/products/${id}/set-status/offline`, {
        method: "PATCH",
      })
    } else {
      // Regular status update
      response = await $fetch(`https://online-shop-1-afra.onrender.com/products/${id}`, {
        method: "PATCH",
        body: {
          status: newStatus,
        },
      })
    }

    if (response) {
      product.value.status = newStatus
    }
  } catch (error) {
    console.error("Error updating product status:", error)
  }
}

// Add this function to handle new variant
function handleNewVariant(_newVariant: any) {
  // Refetch product details after successful variant addition
  fetchProductDetails()
}

onMounted(() => {
  fetchProductDetails()
})
</script>

<template>
  <div class="mx-auto max-w-4xl">
    <div class="mb-8 flex items-center justify-between">
      <h1 class="text-3xl font-bold text-gray-900">
        Product Details
      </h1>
      <NuxtLink
        to="/admin/products"
        class="inline-flex items-center justify-center gap-2 rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back to Products
      </NuxtLink>
    </div>

    <div v-if="isLoading" class="space-y-4">
      <div class="h-64 w-full animate-pulse rounded-lg bg-gray-200" />
      <div class="space-y-2">
        <div class="h-8 w-1/2 animate-pulse rounded bg-gray-200" />
        <div class="h-4 w-1/4 animate-pulse rounded bg-gray-200" />
      </div>
    </div>

    <div v-else-if="error" class="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
      {{ error }}
    </div>

    <div v-else-if="product" class="space-y-8">
      <!-- Product Images -->
      <div class="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div
          v-for="(image, index) in product.product_images"
          :key="index"
          class="aspect-square overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-transform hover:scale-105"
        >
          <img :src="image.url" :alt="`Product image ${index + 1}`" class="size-full object-cover">
        </div>
      </div>

      <!-- Status Actions -->
      <div class="flex justify-end gap-3">
        <!-- Show take offline button for ONLINE status -->
        <button
          v-if="product.status === 'ONLINE'"
          class="inline-flex items-center justify-center gap-2 rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-yellow-600"
          @click="updateProductStatus('OFFLINE')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v20M2 12h20" />
          </svg>
          Take Offline
        </button>
        <!-- Show publish button for DRAFT status -->
        <button
          v-if="product.status === 'DRAFT'"
          class="inline-flex items-center justify-center gap-2 rounded-md bg-green-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-green-600"
          @click="updateProductStatus('ONLINE')"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
          Publish Product
        </button>
      </div>

      <!-- Product Info -->
      <div class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
        <div class="border-b border-gray-100 bg-gray-50/50 p-6">
          <div class="flex items-start justify-between">
            <div class="space-y-4">
              <div>
                <h2 class="text-2xl font-bold text-gray-900">
                  {{ product.name }}
                </h2>
                <p class="mt-2 text-gray-600">
                  Brand: {{ product.brand || "N/A" }}
                </p>
              </div>
              <div class="space-y-3">
                <p class="text-gray-600">
                  Status:
                  <span
                    :class="{
                      'rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700': product.status === 'ONLINE',
                      'rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-700': product.status === 'DRAFT',
                      'rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700': product.status === 'OFFLINE',
                      'rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700': product.status === 'ARCHIVED',
                    }"
                  >
                    {{ product.status }}
                  </span>
                </p>
                <p class="text-2xl font-bold text-gray-900">
                  {{ formatPrice(product.price) }} Birr
                </p>
              </div>
              <div class="flex items-center gap-4">
                <p class="text-gray-600">
                  Category: {{ capitalizeFirstLetter(category?.name) || "N/A" }}
                </p>
                <p class="text-gray-600">
                  Subcategory: {{ capitalizeFirstLetter(subCategory?.name) || "N/A" }}
                </p>
              </div>
            </div>
            <!-- Show edit button only for OFFLINE and DRAFT status -->
            <ProductEditDialog
              v-if="product.status === 'OFFLINE' || product.status === 'DRAFT'"
              :product="product"
              :categories="categories"
              :category="category"
              :sub-categories="subCategories"
              @update="handleProductUpdate"
            />
          </div>
        </div>

        <div class="space-y-6 p-6">
          <div>
            <h3 class="mb-3 text-lg font-semibold text-gray-900">
              Description
            </h3>
            <p class="text-gray-700">
              {{ product.description }}
            </p>
          </div>

          <div v-if="product.brand">
            <h3 class="mb-3 text-lg font-semibold text-gray-900">
              Brand
            </h3>
            <p class="text-gray-700">
              {{ product.brand }}
            </p>
          </div>

          <div v-if="product.material">
            <h3 class="mb-3 text-lg font-semibold text-gray-900">
              Material
            </h3>
            <p class="text-gray-700">
              {{ product.material }}
            </p>
          </div>

          <div>
            <div class="mb-6 flex items-center justify-between">
              <h3 class="text-lg font-semibold text-gray-900">
                Variants
              </h3>
              <!-- Add variant button for ONLINE, OFFLINE, and DRAFT products -->
              <div v-if="product.status !== 'ARCHIVED'">
                <AddVariantDialog
                  :product-id="product.id"
                  :category-name="category?.name || ''"
                  @update="handleNewVariant"
                />
              </div>
            </div>
            <div class="grid gap-6 md:grid-cols-2">
              <div
                v-for="(variant, index) in activeVariants"
                :key="index"
                class="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <div class="border-b border-gray-100 bg-gray-50/50 p-4">
                  <div class="flex items-center justify-between">
                    <span class="text-lg font-medium text-gray-900">Variant {{ index + 1 }}</span>
                    <div class="flex items-center gap-3">
                      <span class="rounded-full bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
                        Stock: {{ variant.stock_quantity }}
                      </span>
                      <!-- Show stock edit button only for ONLINE status -->
                      <StockQuantityDialog
                        v-if="product.status === 'ONLINE'"
                        :variant="variant"
                        @update="handleVariantUpdate"
                      />
                      <!-- Show variant edit button only for OFFLINE and DRAFT status -->
                      <VariantEditDialog
                        v-if="product.status === 'OFFLINE' || product.status === 'DRAFT'"
                        :variant="variant"
                        :category-name="category?.name || ''"
                        @update="handleVariantUpdate"
                      />
                    </div>
                  </div>
                </div>

                <div class="space-y-4 p-4">
                  <!-- Color Section -->
                  <div class="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
                    <div
                      class="size-8 rounded-full border-2 border-gray-200 shadow-sm"
                      :style="{ backgroundColor: variant.color?.color }"
                    />
                    <div>
                      <div class="text-sm font-medium text-gray-600">
                        Color
                      </div>
                      <div class="font-medium text-gray-900">
                        {{ variant.color?.name || variant.color?.color || "N/A" }}
                      </div>
                    </div>
                  </div>

                  <!-- Size Section -->
                  <div class="rounded-lg bg-gray-50 p-4">
                    <div class="mb-3 text-sm font-medium text-gray-600">
                      Size Details
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                      <template v-if="category?.name?.toUpperCase() === 'SHOES'">
                        <div class="rounded-lg bg-white p-3 shadow-sm">
                          <div class="text-xs font-medium text-gray-500">
                            Size
                          </div>
                          <div class="mt-1 font-medium text-gray-900">
                            {{ variant.size?.size }} {{ variant.size?.metric?.toUpperCase() }}
                          </div>
                        </div>
                      </template>
                      <template v-else>
                        <template v-if="variant.size?.sizeLetter">
                          <div class="rounded-lg bg-white p-3 shadow-sm">
                            <div class="text-xs font-medium text-gray-500">
                              Size
                            </div>
                            <div class="mt-1 font-medium text-gray-900">
                              {{ variant.size.sizeLetter.toUpperCase() }}
                            </div>
                          </div>
                        </template>
                        <template v-if="variant.size?.customSize">
                          <div class="rounded-lg bg-white p-3 shadow-sm">
                            <div class="text-xs font-medium text-gray-500">
                              Custom Size
                            </div>
                            <div class="mt-1 font-medium text-gray-900">
                              {{ variant.size.customSize }}
                            </div>
                          </div>
                        </template>
                        <template v-if="variant.size?.fit">
                          <div class="rounded-lg bg-white p-3 shadow-sm">
                            <div class="text-xs font-medium text-gray-500">
                              Fit
                            </div>
                            <div class="mt-1 font-medium text-gray-900">
                              {{ variant.size.fit }}
                            </div>
                          </div>
                        </template>
                        <template v-if="variant.size?.bust">
                          <div class="rounded-lg bg-white p-3 shadow-sm">
                            <div class="text-xs font-medium text-gray-500">
                              Bust
                            </div>
                            <div class="mt-1 font-medium text-gray-900">
                              {{ variant.size.bust }}cm
                            </div>
                          </div>
                        </template>
                        <template v-if="variant.size?.waist">
                          <div class="rounded-lg bg-white p-3 shadow-sm">
                            <div class="text-xs font-medium text-gray-500">
                              Waist
                            </div>
                            <div class="mt-1 font-medium text-gray-900">
                              {{ variant.size.waist }}cm
                            </div>
                          </div>
                        </template>
                        <template v-if="variant.size?.hips">
                          <div class="rounded-lg bg-white p-3 shadow-sm">
                            <div class="text-xs font-medium text-gray-500">
                              Hips
                            </div>
                            <div class="mt-1 font-medium text-gray-900">
                              {{ variant.size.hips }}cm
                            </div>
                          </div>
                        </template>
                        <template v-if="variant.size?.length">
                          <div class="rounded-lg bg-white p-3 shadow-sm">
                            <div class="text-xs font-medium text-gray-500">
                              Length
                            </div>
                            <div class="mt-1 font-medium text-gray-900">
                              {{ variant.size.length }}cm
                            </div>
                          </div>
                        </template>
                        <template v-if="variant.size?.sleeve">
                          <div class="rounded-lg bg-white p-3 shadow-sm">
                            <div class="text-xs font-medium text-gray-500">
                              Sleeve
                            </div>
                            <div class="mt-1 font-medium text-gray-900">
                              {{ variant.size.sleeve }}cm
                            </div>
                          </div>
                        </template>
                      </template>
                    </div>
                  </div>
                </div>
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
</style>
