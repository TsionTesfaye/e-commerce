<script lang="ts" setup>

import { useDebounceFn } from "@vueuse/core"



const data = ref([])
const category = ref("All")
const categories = [
  {
    image: "women-pants.webp",
    name: "Pants",
  },
  { image: "women-coat.webp", name: "Coats" },
  { image: "women-dresses.webp", name: "Dresses" },
  { image: "women-gown.webp", name: "Gowns" },
  { image: "women-jacket.webp", name: "Jackets" },
  { name: "Pjs", image: "women-pjs.webp" },
  { name: "Shirts", image: "women-shirt.webp" },
  { name: "Shorts", image: "women-shorts.webp" },
  { name: "Skirts", image: "women-skirt.webp" },
  { name: "Sports wear", image: "women-sport.webp" },
]

const shoeCategories = [
  { image: "heel.png", name: "Heels" },
  { image: "sneaker.png", name: "Sneakers" },
  { image: "slipper.png", name: "Slippers" },
  { image: "sandal.png", name: "Sandals" },
  { image: "boots.png", name: "Boots" },
  { image: "flat.png", name: "Flats" },
]

const q = ref("")
const debouncedFn = useDebounceFn((val: string) => {
  q.value = val
}, 1000, { maxWait: 5000 })

async function fetchCardDetails() {
  const response = await fetch("/items/shoes.json")
  data.value = await response.json()
}
fetchCardDetails()

function categorize(name: string) {
  category.value = name
}

const sendData = computed(() => {
  if (category.value === "All") {
    return data.value.sub_category
  }
  return data.value.sub_category.filter(item => item.type === category.value)
})
</script>

<template>
  <div class="flex w-full flex-col items-center  bg-white">
    <p class="py-4 text-center text-2xl font-semibold">
      Sub Categories
    </p>
    <div class="no-scrollbar flex max-h-32 max-w-full gap-3 overflow-x-auto overflow-y-hidden px-6">
      <div v-for="cat in shoeCategories" :key="cat.name" class="  flex max-w-32 flex-col gap-1 ">
        <div class="flex size-20 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 bg-white" @click="categorize(cat.name)">
          <NuxtImg
            loading="lazy" :src="`/categories/shoes/${cat.image}`"
            class="size-full rounded-full object-contain"
          />
        </div>
        <p class="line-clamp-2 break-all text-center leading-tight">
          {{ cat.name }}
        </p>
      </div>
    </div>
    <div class="mt-3 flex w-full justify-between gap-2 px-6">
      <Input
        :model-value="q" placeholder="Search..." class="w-full rounded-none border border-gray-400 px-4 py-2.5"
        @input="(n: Event) => debouncedFn((n.target as HTMLInputElement).value)"
      />
      <button class="flex items-center gap-1 border border-gray-400 px-2 py-1.5">
        <Icon name="basil:settings-adjust-outline" class="size-5 text-gray-500" /> <span>Filter</span>
      </button>
    </div>

    <div class="mb-3 mt-5 flex w-full justify-between px-6">
      <p class="text-3xl font-semibold">
        <span v-if="category !== 'All'">{{ category }}</span><span v-else>Shoes</span>
      </p>
      <button class="flex  items-center gap-1 px-2 py-1.5">
        <Icon name="basil:sort-outline" class="size-5 text-gray-500" /> <span>Sort</span>
      </button>
    </div>

    <div class="grid w-full grid-cols-2 gap-x-2 gap-y-4 bg-white sm:gap-6">
      <ItemCard v-for="(item, index) in sendData" :key="index" :item="item" @click="navigateTo({ path: '/details', query: { item: item.id } })" />
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
