<script setup lang="ts">
import { FILTER_CATEGORIES, PRICE_RANGES } from "~/constants/categories"

const route = useRoute()
const router = useRouter()

const selectedCategory = ref(route.query.category?.toString() || "all")
const selectedPriceRange = ref(route.query.price?.toString() || "all")

watch(() => route.query.category, (newCategory) => {
  selectedCategory.value = newCategory?.toString() || "all"
}, { immediate: true })

watch([selectedCategory, selectedPriceRange], ([newCategory, newPrice]) => {
  const query: Record<string, any> = { ...route.query }

  if (newCategory && newCategory !== "all") {
    query.category = newCategory
  } else {
    delete query.category
  }

  delete query.min_price
  delete query.max_price

  if (newPrice && newPrice !== "all") {
    const range = PRICE_RANGES.find(r => r.id === newPrice)
    if (range) {
      if (range.min !== undefined) {
        query.min_price = range.min
      }
      if (range.max !== undefined) {
        query.max_price = range.max
      }
    }
  }

  router.replace({ query })
})
</script>

<template>
  <Sheet>
    <SheetTrigger as-child>
      <button class="flex items-center gap-1 border border-gray-400 px-2 py-1.5">
        <Icon name="basil:settings-adjust-outline" class="size-5 text-gray-500" />
        <span>Filter</span>
      </button>
    </SheetTrigger>
    <SheetContent class="w-[300px] sm:w-[400px]">
      <SheetHeader>
        <SheetTitle>Filters</SheetTitle>
      </SheetHeader>
      <div class="mt-6 space-y-6">
        <!-- Categories -->
        <div class="space-y-2">
          <Label>Categories</Label>
          <RadioGroup v-model="selectedCategory" class="grid gap-2">
            <div v-for="category in FILTER_CATEGORIES" :key="category.id" class="flex items-center space-x-2">
              <RadioGroupItem :id="`cat-${category.id}`" :value="category.id" />
              <Label :for="`cat-${category.id}`">{{ category.name }}</Label>
            </div>
          </RadioGroup>
        </div>

        <!-- Price Range -->
        <div class="space-y-2">
          <Label>Price Range</Label>
          <RadioGroup v-model="selectedPriceRange" class="grid gap-2">
            <div v-for="range in PRICE_RANGES" :key="range.id" class="flex items-center space-x-2">
              <RadioGroupItem :id="`price-${range.id}`" :value="range.id" />
              <Label :for="`price-${range.id}`">{{ range.name }}</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
