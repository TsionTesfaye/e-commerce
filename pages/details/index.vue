<script setup lang="ts">
import type { ProductDetail } from "~/types/product"
import WebApp from "@twa-dev/sdk"
import { watchOnce } from "@vueuse/core"
import { Carousel, type CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

definePageMeta({
  layout: "miniapp",
})

const route = useRoute()
const router = useRouter()
const id = ref(Array.isArray(route.query.item) ? route.query.item[0] : route.query.item || "")
const item = ref<ProductDetail | null>(null)
const category = ref<"SHOES" | "CLOTHING" | "COSMETICS" | "ACCESSORIES">("CLOTHING")
const isLoading = ref(true)
const error = ref<string | null>(null)

// Carousel setup
const emblaMainApi = ref<CarouselApi>()
const emblaThumbnailApi = ref<CarouselApi>()
const selectedIndex = ref(0)


onMounted(() => {
  WebApp.MainButton.hide()
  fetchItemDetails()
})

// Carousel handlers
function onSelect() {
  if (!emblaMainApi.value || !emblaThumbnailApi.value) {
    return
  }
  selectedIndex.value = emblaMainApi.value.selectedScrollSnap()
  emblaThumbnailApi.value.scrollTo(selectedIndex.value)
}

function onThumbClick(index: number) {
  if (!emblaMainApi.value) {
    return
  }
  emblaMainApi.value.scrollTo(index)
}

watchOnce(emblaMainApi, (api) => {
  if (!api) {
    return
  }
  onSelect()
  api.on("select", onSelect)
  api.on("reInit", onSelect)
})

async function fetchItemDetails() {
  if (!id.value) {
    error.value = "No product ID provided"
    isLoading.value = false
    return
  }

  try {
    isLoading.value = true
    error.value = null

    const { baseUrl } = useApi()
    const [itemRes, categoriesRes] = await Promise.all([
      $fetch(`${baseUrl}/product/${id.value}`) as any,
      $fetch(`${baseUrl}/categories`),
    ])

    if (!itemRes) {
      throw new Error("Product not found")
    }

    // Process images
    if (itemRes.product_images?.length > 0) {
      itemRes.product_images = itemRes.product_images.map((img: any) => ({
        ...img,
        url: `${baseUrl}/file/${img.url}`,
      }))
    }

    itemRes.price = Number(itemRes.price) || 0

    // find category
    if (Array.isArray(categoriesRes) && categoriesRes.length > 0) {
      const productCategory = categoriesRes.find((cat: { id: number }) => cat.id === itemRes.categoryId)
      if (productCategory?.name) {
        const categoryName = productCategory.name.toUpperCase()
        if (["SHOES", "CLOTHING", "COSMETICS", "ACCESSORIES"].includes(categoryName)) {
          category.value = categoryName
        }
      }
    }

    item.value = itemRes
  } catch (err) {
    console.error("Error fetching item:", err)
    error.value = "Failed to load product details"
  } finally {
    isLoading.value = false
  }
}

const images = computed(() => {
  return item.value?.product_images?.map((img: any) => img.url) || []
})

// Variant selection logic
const selectedSize = ref("")
const selectedColor = ref("")
const selectedVariant = ref<any>(null)

watch(() => item.value?.variants, (variants) => {
  if (variants?.length) {
    const firstInStock = variants.find((v: any) => v.stock_quantity > 0) || variants[0]
    if (firstInStock) {
      selectedSize.value = typeof firstInStock.size === "object" ? firstInStock.size?.sizeLetter || "" : ""
      selectedColor.value = typeof firstInStock.color === "object" ? 
      firstInStock.color?.color || "" : firstInStock.color || ""
      selectedVariant.value = firstInStock
    }
  }
}, { immediate: true })

function reserveItem() {
  if (!selectedVariant.value) {
    return
  }
  // TODO: Implement reservation logic
  console.log("Reserved")
}

function addToCart() {
  if (!selectedVariant.value) {
    return
  }
  // TODO: Implement cart logic
  console.log("Added to cart")
}

function navigateBack() {
  router.back()
}
</script>

<template>
  <div class="flex w-full flex-col items-center bg-white">
    <button
      class="mb-2 flex items-center gap-2 self-start px-4 pt-4 text-gray-600 hover:text-gray-900"
      @click="navigateBack"
    >
      <Icon name="lucide:arrow-left" class="size-5" />
      Back
    </button>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex h-screen w-full items-center justify-center">
      <div class="size-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-800" />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="flex h-screen w-full items-center justify-center">
      <p class="text-lg text-gray-500">
        {{ error }}
      </p>
    </div>

    <!-- Product details -->
    <div v-else-if="item" class="w-full">
      <div class="flex flex-col">
        <div class="mx-4 mt-2 w-full rounded-lg bg-white shadow-sm">
          <!-- Skeleton for image area while images are loading -->
          <div v-if="images.length === 0" class="aspect-square w-full">
            <Skeleton class="size-full" />
          </div>
          <Carousel
            v-else
            class="relative w-full"
            @init-api="(val) => emblaMainApi = val"
          >
            <CarouselContent>
              <CarouselItem v-for="(image, index) in images" :key="index">
                <div class="aspect-square">
                  <NuxtImg :src="image" class="size-full object-contain" />
                </div>
              </CarouselItem>
            </CarouselContent>
            <CarouselPrevious v-if="selectedIndex !== 0" class="absolute left-2 size-8" />
            <CarouselNext v-if="selectedIndex !== images.length - 1" class="absolute right-2 size-8" />
          </Carousel>

          <!-- Thumbnails -->
          <div v-if="images.length === 0" class="mt-2 flex justify-center gap-1">
            <div v-for="n in 6" :key="n" class="size-16">
              <Skeleton class="size-full rounded-md" />
            </div>
          </div>
          <Carousel
            v-else
            class="relative w-full p-2"
            @init-api="(val) => emblaThumbnailApi = val"
          >
            <CarouselContent class="ml-0 flex justify-center gap-1">
              <CarouselItem 
              v-for="(image, index) in images" :key="index" class="basis-1/6 cursor-pointer pl-0" @click="onThumbClick(index)">
                <div class="p-1" :class="index === selectedIndex ? 'ring-2 ring-gray-800 rounded-md' : 'opacity-70'">
                  <NuxtImg
                    :src="image"
                    :alt="`Thumbnail ${index + 1}`"
                    class="aspect-square cursor-pointer rounded-md object-cover"
                  />
                </div>
              </CarouselItem>
            </CarouselContent>
          </Carousel>
        </div>

        <!-- Item Details -->
        <div class="mx-4 mt-4 rounded-lg bg-white px-4 pb-6 shadow-sm">
          <template v-if="isLoading">
            <div class="space-y-4">
              <Skeleton class="h-8 w-3/4" />
              <Skeleton class="h-4 w-full" />
              <Skeleton class="h-4 w-full" />
            </div>
          </template>
          <template v-else>
            <div class="mt-4 border-b border-gray-100 pb-4">
              <h1 class="text-3xl font-bold text-gray-900">
                {{ item.name }}
              </h1>
              <p class="mt-2 text-2xl font-bold text-gray-800">
                {{ typeof item.price === 'number' ? item.price.toFixed(2) : '0.00' }} Birr
              </p>
            </div>

            <!-- Show custom size for accessories -->
            <div
              v-if="category === 'ACCESSORIES' && typeof item.variants?.[0]?.size === 'object'
                && item.variants?.[0]?.size?.customSize" class="mt-4"
            >
              <p class="text-sm font-medium text-gray-500">
                Size
              </p>
              <p class="text-base font-medium">
                {{ item.variants[0].size.customSize }}
              </p>
            </div>

            <div class="mt-4">
              <p class="text-base font-medium text-gray-500">
                Description
              </p>
              <p class="mt-2 text-lg text-gray-700">
                {{ item.description }}
              </p>
            </div>

            <div class="mt-6">
              <ProductSizeDisplay
                :product="item"
                class="rounded-lg border border-gray-100 p-4"
              />
            </div>

            <div class="mt-6 flex gap-3">
              <button
                class="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300
                 bg-white px-4 py-3 text-lg font-medium text-gray-700 transition-colors hover:bg-gray-50 
                 disabled:opacity-50"
                :disabled="!selectedVariant"
                @click="reserveItem"
              >
                <Icon name="lucide:download" class="size-5" />
                Reserve
              </button>
              <button
                class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-gray-800 px-4 py-3 
                text-lg font-medium text-white transition-colors hover:bg-gray-900 disabled:opacity-50"
                :disabled="!selectedVariant"
                @click="addToCart"
              >
                <Icon name="lucide:shopping-cart" class="size-5" />
                Add to Cart
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
