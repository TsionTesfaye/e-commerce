<script lang="ts" setup>
import { useDebounceFn } from "@vueuse/core"
import FilterSheet from "~/components/filter-sheet.vue"
import SortMenu from "~/components/sort-menu.vue"
import Skeleton from "~/components/ui/skeleton/skeleton.vue"

definePageMeta({
  layout: "miniapp",
})

type Product = {
  id: string
  name: string
  image: string
  sub_category: string
  colors: string[]
  price: string
}

type ApiResponse = {
  data: any[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

const route = useRoute()
const data = ref<Product[]>([])
const sub_category = ref("")
const isLoading = ref(true)
const isFetchingMore = ref(false)
const hasMore = ref(true)
const totalPages = ref(0)

const categories = [
  { image: "shoes-cat.png", name: "SHOES", displayName: "Shoes" },
  { image: "clothings-cat.png", name: "CLOTHING", displayName: "Clothing" },
  { image: "accessories-cat.png", name: "ACCESSORIES", displayName: "Accessories" },
  { image: "cosmetics-cat.png", name: "COSMETICS", displayName: "Cosmetics" },
]

const subCategories = {
  SHOES: [
    { image: "heel.png", name: "Heels" },
    { image: "sneaker.png", name: "Sneakers" },
    { image: "slipper.png", name: "Slippers" },
    { image: "sandal.png", name: "Sandals" },
    { image: "boots.png", name: "Boots" },
    { image: "flat.png", name: "Flats" },
  ],
  CLOTHING: [
    { image: "women-dresses.webp", name: "Dresses" },
    { image: "women-shirt.webp", name: "Tops" },
    { image: "women-pants.webp", name: "Bottoms" },
    { image: "women-jacket.webp", name: "Sweatshirts & Hoodies" },
    { image: "women-coat.webp", name: "Outerwear" },
    { image: "women-sports.webp", name: "Sports" },
    { image: "swimwear.webp", name: "Swimwear" },
    { image: "women-pjs.webp", name: "Sleepwear" },
    { image: "women-shorts.webp", name: "Undergarments" },
    { image: "others.webp", name: "Others" },
  ],
  ACCESSORIES: [
    { image: "jewelry.png", name: "Jewelry" },
    { image: "bag.png", name: "Bags" },
    { image: "hats.png", name: "Hats" },
    { image: "belts.png", name: "Belts" },
    { image: "scarves.png", name: "Scarves" },
    { image: "sunglasses.png", name: "Sunglasses" },
    { image: "watches.png", name: "Watches" },
    { image: "hair.png", name: "Hair Accessories" },
    { image: "others.png", name: "Others" },
  ],
  COSMETICS: [
    { image: "face.png", name: "Face" },
    { image: "eyes.png", name: "Eyes" },
    { image: "lips.png", name: "Lips" },
    { image: "nails.png", name: "Nails" },
    { image: "skincare.png", name: "Skincare" },
    { image: "haircare.png", name: "Haircare" },
    { image: "tools.png", name: "Tools" },
    { image: "others.png", name: "Others" },
  ],
}

const q = ref("")
const searchDebounce = useDebounceFn((val: string) => {
  q.value = val
}, 500, { maxWait: 2000 })

const page = ref(1)
const limit = ref(8)

const passUrl = computed(() => {
  const baseParams = {
    page: page.value,
    pageSize: limit.value,
  }

  const queryParams = new URLSearchParams()

  // Add base parameters
  Object.entries(baseParams).forEach(([key, value]) => {
    queryParams.append(key, value.toString())
  })

  // Only add category if it exists in query and isn't "all"
  if (route.query.category && route.query.category !== "all") {
    queryParams.append("category", route.query.category.toString())
  }

  // Add sub_category if exists
  if (sub_category.value) {
    queryParams.append("sub_category", sub_category.value)
  }

  // Add price filters if they exist and are valid
  if (route.query.min_price && !isNaN(Number(route.query.min_price))) {
    queryParams.append("min_price", route.query.min_price.toString())
  }
  if (route.query.max_price && !isNaN(Number(route.query.max_price))) {
    queryParams.append("max_price", route.query.max_price.toString())
  }

  // Add search query if exists
  if (q.value.trim()) {
    queryParams.append("search", q.value.trim())
  }

  // Add sorting if specified
  if (route.query.created_at) {
    queryParams.append("created_at", route.query.created_at.toString())
  } else if (route.query.price) {
    queryParams.append("price", route.query.price.toString())
  }

  return `https://online-shop-1-afra.onrender.com/product?${queryParams.toString()}`
})
async function fetchProducts(): Promise<ApiResponse> {
  try {
    const response = await $fetch(passUrl.value)
    return response || { data: [], page: 1, pageSize: 8, total: 0, totalPages: 0 }
  } catch (error) {
    console.error("Error fetching products:", error)
    return { data: [], page: 1, pageSize: 8, total: 0, totalPages: 0 }
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

      // Handle colors - ensure we get unique, non-empty color strings
      const colors = Array.from(
        new Set(
          item?.variants
            ?.map((variant: any) => variant?.color?.color)
            ?.filter((color: any) => typeof color === "string" && color.trim() !== ""),
        ),
      ) || []

      // Handle price conversion safely
      let priceValue = "0.00"
      if (item?.price) {
        const numericPrice = typeof item.price === "string"
          ? Number.parseFloat(item.price)
          : Number(item.price)

        if (!Number.isNaN(numericPrice)) {
          // Keep the original price value without converting to cents
          priceValue = numericPrice.toFixed(2)
        }
      }

      return {
        id: item?.id?.toString() || "unknown-id",
        name: item?.name?.toString() || "Unnamed Product",
        image: imageUrl,
        sub_category: item?.sub_category?.toString() || "",
        colors: colors as string[], // Ensure colors is string[]
        price: priceValue,
      }
    } catch (error) {
      console.error("Error processing item:", error)
      // Return a safe default product if processing fails
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

const { execute: fetchItems } = useAsyncData("products", async () => {
  if (page.value === 1) {
    isLoading.value = true
    data.value = []
  } else {
    isFetchingMore.value = true
  }

  const response = await fetchProducts()
  const processedItems = processItems(response.data)

  if (page.value === 1) {
    data.value = processedItems
  } else {
    data.value = [...data.value, ...processedItems]
  }

  totalPages.value = response.totalPages
  hasMore.value = page.value < response.totalPages
  isLoading.value = false
  isFetchingMore.value = false

  return response
}, {
  watch: [passUrl],
  immediate: true,
})

// Watch for filter changes (category and price)
// Add this to your main page script section
watch(() => ({
  // Watch for sorting changes
  created_at: route.query.created_at,
  price: route.query.price,
  // Watch for other filter changes
  category: route.query.category,
  min_price: route.query.min_price,
  max_price: route.query.max_price,
}), (newVal, oldVal) => {
  // Reset pagination when any filter or sort changes
  if (page.value !== 1) {
    page.value = 1
  }

  // Reset sub_category when category changes
  if (oldVal && newVal.category !== oldVal.category) {
    sub_category.value = ""
  }
}, { deep: true, immediate: true })

// Watch for search or subcategory changes
watch([q, sub_category], () => {
  page.value = 1
  isLoading.value = true
  data.value = []
})

// Add a new watch for category changes specifically
watch(() => route.query.category, (newCategory, oldCategory) => {
  if (oldCategory && newCategory !== oldCategory) {
    isLoading.value = true
    data.value = []
  }
}, { immediate: true })

const currentCategory = computed(() => route.query.category?.toString().toUpperCase())

const displayItems = computed(() => {
  if (!currentCategory.value) {
    return categories
  }
  const subCats = subCategories[currentCategory.value as keyof typeof subCategories] || []
  return [{ image: "all.png", name: "ALL", displayName: "All" }, ...subCats]
})

function handleCategoryClick(category: string) {
  if (!currentCategory.value) {
    // If we're on main categories, navigate to that category
    navigateTo({
      query: {
        ...route.query,
        category,
      },
    })
  } else {
    // If we're on subcategories, set the subcategory
    if (category === "ALL") {
      sub_category.value = ""
    } else {
      sub_category.value = category
    }
    page.value = 1
  }
}

async function loadMore() {
  if (isFetchingMore.value || !hasMore.value || isLoading.value) {
    return
  }

  isFetchingMore.value = true
  page.value += 1
  await fetchItems()
}

function handleScroll() {
  const { scrollY, innerHeight } = window
  const { scrollHeight } = document.documentElement
  const bottomOffset = 200

  if (scrollY + innerHeight >= scrollHeight - bottomOffset) {
    loadMore()
  }
}

onMounted(() => {
  window.addEventListener("scroll", handleScroll)
})

onBeforeUnmount(() => {
  window.removeEventListener("scroll", handleScroll)
})

function getImagePath(item: { image: string, name: string }, category?: string) {
  // Special case for "Others" subcategory
  if (item.name === "Others") {
    return `/categories/others.png`
  }

  // If no category (main categories view) or category is undefined
  if (!category) {
    return `/categories/${item.image}`
  }

  // For subcategories
  return `/categories/${category.toLowerCase()}/${item.image}`
}

function handleBackClick() {
  if (sub_category.value) {
    // If we're in a subcategory, go back to the main category
    sub_category.value = ""
  } else if (currentCategory.value) {
    // If we're in a category, go back to no category
    navigateTo({
      query: {
        ...route.query,
        category: undefined,
      },
    })
  }
}
</script>

<template>
  <div class="flex w-full flex-col items-center bg-white">
    <div class="flex w-full items-center justify-between px-6 py-4">
      <button
        v-if="currentCategory || sub_category"
        class="flex items-center gap-1 text-gray-600 hover:text-gray-900"
        @click="handleBackClick"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        <span>Back</span>
      </button>
      <div v-else class="w-16" /> <!-- Spacer to maintain layout -->
      <p class="text-center text-2xl font-semibold">
        {{ !currentCategory ? 'Categories' : 'Sub Categories' }}
      </p>
      <div class="w-16" /> <!-- Spacer to maintain layout -->
    </div>
    <div class="no-scrollbar flex max-h-32 max-w-full gap-3 overflow-x-auto overflow-y-hidden px-6">
      <div
        v-for="item in displayItems"
        :key="item.name"
        class="flex max-w-32 flex-col gap-1"
      >
        <div
          class="flex size-20 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 bg-white"
          :class="{ 'border-blue-500': sub_category === item.name }"
          @click="handleCategoryClick(item.name)"
        >
          <template v-if="item.name === 'ALL'">
            <span class="text-lg font-medium">All</span>
          </template>
          <template v-else>
            <NuxtImg
              loading="lazy"
              :src="getImagePath(item, currentCategory)"
              class="size-full rounded-full object-contain p-1"
            />
          </template>
        </div>
        <p class="line-clamp-2 break-all text-center text-sm leading-tight">
          {{ item.displayName || item.name }}
        </p>
      </div>
    </div>

    <div class="mt-3 flex w-full justify-between gap-2 px-6">
      <Input
        :model-value="q"
        placeholder="Search..."
        class="w-full rounded-none border border-gray-400 px-4 py-2.5"
        @input="(n: Event) => searchDebounce((n.target as HTMLInputElement).value)"
      />
      <FilterSheet />
    </div>

    <div class="mb-3 mt-5 flex w-full justify-between px-6">
      <p class="text-3xl font-semibold">
        {{ currentCategory ? currentCategory.charAt(0) + currentCategory.slice(1).toLowerCase() : 'All Products' }}
      </p>
      <SortMenu />
    </div>

    <div class="grid w-full grid-cols-2 gap-x-2 gap-y-4 bg-white sm:gap-6">
      <template v-if="isLoading">
        <div v-for="n in limit" :key="n" class="h-[300px]">
          <div class="h-full overflow-hidden rounded-b-lg bg-white shadow-md">
            <Skeleton class="h-[200px] w-full" />
            <div class="flex h-[100px] flex-col justify-between p-4">
              <div>
                <Skeleton class="mb-2 h-4 w-3/4" />
                <Skeleton class="h-4 w-1/4" />
              </div>
              <div class="flex gap-1">
                <Skeleton class="size-4 rounded-full" />
                <Skeleton class="size-4 rounded-full" />
                <Skeleton class="size-4 rounded-full" />
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <template v-if="data.length === 0">
          <div class="col-span-2 flex h-[300px] w-full items-start justify-center pt-8">
            <p class="text-lg text-gray-500">
              No items found
            </p>
          </div>
        </template>
        <template v-else>
          <ItemCard
            v-for="(item) in data"
            :key="item.id"
            :item="item"
            @click="navigateTo({ path: '/details', query: { item: item.id } })"
          />
        </template>
      </template>
    </div>

    <div v-if="isFetchingMore" class="my-4 flex w-full justify-center">
      <div class="size-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
    </div>
  </div>
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

body {
  overflow-x: hidden;
}
</style>
