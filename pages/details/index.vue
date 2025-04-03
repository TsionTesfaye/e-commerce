<script setup lang="ts">
import { Carousel, type CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import WebApp from "@twa-dev/sdk"
import { watchOnce } from "@vueuse/core"
import { computed, ref } from "vue"
import { useRoute } from "vue-router"
import ProductSizeDisplay from "~/components/product-size-display.vue"
import Skeleton from "~/components/ui/skeleton/skeleton.vue"

definePageMeta({
  layout: "miniapp",
})

const route = useRoute()
const id = ref(Array.isArray(route.query.item) ? route.query.item[0] : route.query.item || "")
const item = ref<any>(null)
const category = ref<"SHOES" | "CLOTHING" | "COSMETICS" | "ACCESSORIES">("CLOTHING")
const isLoading = ref(true)
const error = ref<string | null>(null)

// Carousel setup
const emblaMainApi = ref<CarouselApi>()
const emblaThumbnailApi = ref<CarouselApi>()
const selectedIndex = ref(0)

// Initialize WebApp
WebApp.MainButton.hide()
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

    const [itemRes, categoriesRes] = await Promise.all([
      $fetch(`https://online-shop-1-afra.onrender.com/product/${id.value}`),
      $fetch("https://online-shop-1-afra.onrender.com/categories"),
    ])

    if (!itemRes) {
      throw new Error("Product not found")
    }

    // Process images
    if (itemRes.product_images?.length > 0) {
      itemRes.product_images = itemRes.product_images.map((img: any) => ({
        ...img,
        url: `https://online-shop-1-afra.onrender.com/file/${img.url}`,
      }))
    }

    // Process price
    itemRes.price = Number(itemRes.price) || 0

    // Determine category
    if (categoriesRes?.length) {
      const productCategory = categoriesRes.find((cat: any) => cat.id === itemRes.category_id)
      if (productCategory) {
        const categoryName = productCategory.name.toUpperCase()
        if (["SHOES", "CLOTHING", "COSMETICS", "ACCESSORIES"].includes(categoryName)) {
          category.value = categoryName as any
          console.log("Category set to:", categoryName)
          console.log("First variant:", itemRes.variants?.[0])
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

const sizes = computed(() => {
  if (!item.value?.variants) {
    return []
  }
  return [...new Set(item.value.variants.map((v: any) => v.size?.sizeLetter).filter(Boolean))]
})

const colorsForSize = computed(() => {
  if (!item.value?.variants || !selectedSize.value) {
    return []
  }
  return item.value.variants
    .filter((v: any) => v.size?.sizeLetter === selectedSize.value)
    .filter((v: any) => v.color)
})

watch(() => item.value?.variants, (variants) => {
  if (variants?.length) {
    const firstInStock = variants.find((v: any) => v.stock_quantity > 0) || variants[0]
    if (firstInStock) {
      selectedSize.value = firstInStock.size?.sizeLetter || ""
      selectedColor.value = firstInStock.color?.color || ""
      selectedVariant.value = firstInStock
    }
  }
}, { immediate: true })

function handleVariantSelect(variant: any) {
  selectedVariant.value = variant
  selectedSize.value = variant.size?.sizeLetter || ""
  selectedColor.value = variant.color?.color || ""
}

function formatSize(size: any) {
  if (!size) {
    return "N/A"
  }

  switch (category.value) {
    case "SHOES":
      return `${size.sizeValue || ""} ${size.metric || ""}`.trim()
    case "CLOTHING":
      if (size.customSize) {
        return size.customSize
      }
      return `${size.sizeLetters || ""} (Bust: ${size.bust || ""}cm, Waist: ${size.waist || ""}cm, Hips: ${size.hips || ""}cm)`
    case "COSMETICS":
      return size.customSize || `${size.sizeValue || ""} ${size.metric || ""}`.trim()
    case "ACCESSORIES":
      return size.customSize || "One Size"
    default:
      return "N/A"
  }
}

function reserveItem() {
  if (!selectedVariant.value) {
    return
  }
  alert(`Reserved: ${item.value?.name} - Size: ${selectedSize.value}, Color: ${selectedColor.value}`)
}

function addToCart() {
  if (!selectedVariant.value) {
    return
  }
  alert(`Added to cart: ${item.value?.name} - Size: ${selectedSize.value}, Color: ${selectedColor.value}`)
}
</script>

<template>
  <div class="flex w-full flex-col items-center bg-white">
    <button
      class="mb-4 flex items-center gap-2 self-start px-3 py-2 text-gray-600 hover:text-gray-900"
      @click="navigateTo('/')"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m15 18-6-6 6-6" />
      </svg>
      Back
    </button>

    <!-- Loading state -->
    <div v-if="isLoading" class="flex h-screen w-full items-center justify-center">
      <div class="size-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
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
        <!-- Image Gallery -->
        <div class="w-full">
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
            <CarouselPrevious v-if="selectedIndex !== 0" class="absolute left-0" />
            <CarouselNext v-if="selectedIndex !== images.length - 1" class="absolute right-0" />
          </Carousel>

          <!-- Thumbnails -->
          <div v-if="images.length === 0" class="mt-2 flex justify-center gap-1">
            <div v-for="n in 6" :key="n" class="size-16">
              <Skeleton class="size-full rounded-md" />
            </div>
          </div>
          <Carousel
            v-else
            class="relative w-full"
            @init-api="(val) => emblaThumbnailApi = val"
          >
            <CarouselContent class="ml-0 flex justify-center gap-1">
              <CarouselItem v-for="(image, index) in images" :key="index" class="basis-1/6 cursor-pointer pl-0" @click="onThumbClick(index)">
                <div class="p-1" :class="index === selectedIndex ? '' : 'opacity-50'">
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
        <div class="mt-4 px-3 pb-8">
          <template v-if="isLoading">
            <div class="space-y-4">
              <Skeleton class="h-8 w-3/4" />
              <Skeleton class="h-4 w-full" />
              <Skeleton class="h-4 w-full" />
            </div>
          </template>
          <template v-else>
            <h1 class="mb-2 text-2xl font-bold">
              {{ item.name }}
            </h1>

            <p class="mb-4 text-2xl font-bold text-gray-900">
              ${{ typeof item.price === 'number' ? (item.price / 100).toFixed(2) : '0.00' }}
            </p>

            <!-- Show custom size for accessories -->
            <div v-if="category === 'ACCESSORIES' && item.variants?.[0]?.size?.customSize" class="mb-4">
              <p class="text-lg font-semibold">
                Size
              </p>
              <p class="text-gray-700">
                {{ item.variants[0].size.customSize }}
              </p>
            </div>

            <p class="my-2 text-lg font-semibold">
              Description
            </p>
            <p class="mb-4 text-gray-700">
              {{ item.description }}
            </p>

            <div class="mb-4">
              <h2 class="mb-2 text-xl font-semibold">
                Available Options
              </h2>
              <ProductSizeDisplay
                :product="item"
              />
            </div>

            <div class="mt-6 flex gap-3">
              <button
                class="flex flex-1 items-center justify-center gap-2 rounded-lg border border-gray-300 bg-gray-100 px-6 py-3 text-base font-medium text-gray-700 transition-colors hover:bg-gray-200 disabled:opacity-50"
                :disabled="!selectedVariant"
                @click="reserveItem"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
                  <path d="M4 8V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2" />
                  <path d="M12 2v8" />
                </svg>
                Reserve
              </button>
              <button
                class="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-6 py-3 text-base font-medium text-white transition-colors hover:bg-gray-800 disabled:opacity-50"
                :disabled="!selectedVariant"
                @click="addToCart"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                  <path d="M3 6h18" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Add to Cart
              </button>
            </div>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
</style>
