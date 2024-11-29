<script setup lang="ts">
import { Carousel, type CarouselApi, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"
import WebApp from "@twa-dev/sdk"
import { watchOnce } from "@vueuse/core"

import { computed, ref } from "vue"
import { useRoute } from "vue-router"

const emblaMainApi = ref<CarouselApi>()
const emblaThumbnailApi = ref<CarouselApi>()
const selectedIndex = ref(0)

function onSelect() {
  if (!emblaMainApi.value || !emblaThumbnailApi.value) {
    return
  }
  selectedIndex.value = emblaMainApi.value.selectedScrollSnap()
  emblaThumbnailApi.value.scrollTo(emblaMainApi.value.selectedScrollSnap())
}

function onThumbClick(index: number) {
  if (!emblaMainApi.value || !emblaThumbnailApi.value) {
    return
  }
  emblaMainApi.value.scrollTo(index)
}

watchOnce(emblaMainApi, (emblaMainApi) => {
  if (!emblaMainApi) {
    return
  }

  onSelect()
  emblaMainApi.on("select", onSelect)
  emblaMainApi.on("reInit", onSelect)
})

const data = ref([])
const route = useRoute()
const id = ref(Array.isArray(route.query.item) ? route.query.item[0] : route.query.item)
async function fetchCardDetails() {
  const response = await fetch("/items/shoes.json")
  data.value = await response.json()
}
await fetchCardDetails()

const item = computed(() => {
  return data.value.sub_category.find(item => item.id === Number.parseInt(id.value))
})

// const item = {
//   name: "Elegant Summer Dress",
//   description: "A beautiful, lightweight dress perfect for summer days and evenings. Made from 100% cotton for maximum comfort and breathability.",
//   price: 89.99,
//   sizes: ["XS", "S", "M", "L", "XL"],
//   colors: ["#FFF", "#000", "#F6C3C3", "#95B8D1"],
// }

const images = [
  "/itemImages/backView.png",
  "/itemImages/frontView.png",
  "/itemImages/sideView.png",
  "/itemImages/backView.png",

]

const currentImageIndex = ref(0)

const selectedSize = ref(item.value?.sizes[0])
const selectedColor = ref(item.value?.colors[0])

function reserveItem() {
  alert(`Item reserved: ${item.value.name}, Size: ${selectedSize.value}, Color: ${selectedColor.value}`)
}

function addToCart() {
  alert(`Added to cart: ${item.value?.name}, Size: ${selectedSize.value}, Color: ${selectedColor.value}`)
}
</script>

<template>
  <div class="  ">
    <div>
      <!-- Image Gallery -->
      <div class="w-full ">
        <Carousel
          class="relative w-full "
          @init-api="(val) => emblaMainApi = val"
        >
          <CarouselContent>
            <CarouselItem v-for="(image, index) in images" :key="index">
              <div class="">
                <NuxtImg :src="image" class="h-auto w-full object-cover shadow-lg" />
              </div>
            </CarouselItem>
          </CarouselContent>
          <CarouselPrevious class="absolute left-0 " />
          <CarouselNext class="absolute right-0" />
        </Carousel>

        <Carousel
          class="relative w-full "
          @init-api="(val) => emblaThumbnailApi = val"
        >
          <CarouselContent class="ml-0 flex justify-center gap-1">
            <CarouselItem v-for="(image, index) in images" :key="index" class="basis-1/6 cursor-pointer pl-0" @click="onThumbClick(index)">
              <div class="p-1" :class="index === selectedIndex ? '' : 'opacity-50'">
                <NuxtImg

                  :src="image"
                  :alt="`Thumbnail ${index + 1}`"
                  class=" cursor-pointer rounded-md object-cover"
                />
              </div>
            </CarouselItem>
          </CarouselContent>
        </Carousel>
      </div>

      <!-- Item Details -->
      <div class="mt-4 px-3">
        <h1 class="mb-4 text-3xl font-bold">
          {{ item?.name }}
        </h1>
        <p class="mb-4 text-gray-700">
          {{ item?.description }}
        </p>

        <div class="mb-4">
          <h2 class="mb-2 text-xl font-semibold">
            Size
          </h2>
          <div class="flex space-x-2 text-sm">
            <button
              v-for="size in item.sizes"
              :key="size"
              class="rounded-md border px-2 py-1"
              :class="selectedSize === size ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'"
              @click="selectedSize = size"
            >
              {{ size }}
            </button>
          </div>
        </div>

        <div class="mb-4">
          <h2 class="mb-2 text-xl font-semibold">
            Colors
          </h2>
          <div class="flex space-x-2">
            <button
              v-for="color in item.colors"
              :key="color"
              class="size-8 rounded-full border-2"
              :class="{ ' ring-2 ring-gray-800': selectedColor === color }"
              :style="{ backgroundColor: color }"
              @click="selectedColor = color"
            />
          </div>
        </div>

        <p class="mb-4 text-2xl font-bold">
          ${{ item.price.toFixed(2) }}
        </p>

        <div class="flex space-x-4">
          <button class="rounded-md bg-[#6c757d] px-6 py-2 text-white" @click="reserveItem">
            Reserve
          </button>
          <button class="rounded-md bg-blue-600 px-6 py-2 text-white" @click="addToCart">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style>

</style>
