<script lang="ts" setup>
import type { ApiResponse } from "~/types/api"
import type { Product } from "~/types/product"
import { useDebounceFn } from "@vueuse/core"
import { CATEGORIES, SUB_CATEGORIES } from "~/constants/categories"

definePageMeta({
  layout: "miniapp",
})

const route = useRoute()
const data = ref<Product[]>([])
const sub_category = ref("")
const isLoading = ref(true)
const isFetchingMore = ref(false)
const hasMore = ref(true)
const totalPages = ref(0)

const q = ref("")
const searchDebounce = useDebounceFn((val: string) => {
  q.value = val
}, 500, { maxWait: 2000 })

const page = ref(1)
const limit = ref(8)

const { buildUrl } = useApi()

const passUrl = computed(() => {
  const params: Record<string, any> = {
    page: page.value,
    pageSize: limit.value,
  }

  // Only add category if it exists in query and isn't "all"
  if (route.query.category && route.query.category !== "all") {
    params.category = route.query.category.toString()
  }

  // Add sub_category if exists
  if (sub_category.value) {
    params.sub_category = sub_category.value
  }

  // Add price filters if they exist and are valid
  if (route.query.min_price && !Number.isNaN(Number(route.query.min_price))) {
    params.min_price = Number(route.query.min_price)
  }
  if (route.query.max_price && !Number.isNaN(Number(route.query.max_price))) {
    params.max_price = Number(route.query.max_price)
  }

  // Add search query if exists
  if (q.value.trim()) {
    params.search = q.value.trim()
  }

  // Add sorting if specified
  if (route.query.created_at) {
    params.created_at = route.query.created_at.toString()
  } else if (route.query.price) {
    params.price = route.query.price.toString()
  }

  return buildUrl("/product", params)
})
const { fetchProducts, processItems } = useProducts()

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

watch(() => ({

  created_at: route.query.created_at,
  price: route.query.price,

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
    return CATEGORIES
  }
  const subCats = SUB_CATEGORIES[currentCategory.value as keyof typeof SUB_CATEGORIES] || []
  return [{ id: "all", image: "all.png", name: "ALL", displayName: "All" }, ...subCats]
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

import { getImagePath } from "~/utils"

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
        <Icon name="lucide:arrow-left" class="size-5" />
        <span>Back</span>
      </button>
      <div v-else class="w-16" />
      <p class="text-center text-2xl font-semibold">
        {{ !currentCategory ? 'Categories' : 'Sub Categories' }}
      </p>
      <div class="w-16" />
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
