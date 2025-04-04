<script setup lang="ts">
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const route = useRoute()
const router = useRouter()

const categories = [
  { id: "all", name: "All Categories" }, // All option added
  { id: "SHOES", name: "Shoes" },
  { id: "COSMETICS", name: "Cosmetics" },
  { id: "CLOTHING", name: "Clothing" },
  { id: "ACCESSORIES", name: "Accessories" },
]

const priceRanges = [
  { id: "all", name: "All Prices" },
  { id: "0-50", name: "Under 50 Birr", min: undefined, max: 50 },
  { id: "50-100", name: "50 - 100 Birr", min: 50, max: 100 },
  { id: "100-200", name: "100 - 200 Birr", min: 100, max: 200 },
  { id: "200+", name: "Over 200 Birr", min: 200, max: undefined },
]

// Initialize from URL query params
const selectedCategory = ref(route.query.category?.toString() || "all")
const selectedPriceRange = ref(route.query.price?.toString() || "all")

// Watch for route changes to update the selected category
watch(() => route.query.category, (newCategory) => {
  selectedCategory.value = newCategory?.toString() || "all"
}, { immediate: true })

// Watch for changes and update URL
watch([selectedCategory, selectedPriceRange], ([newCategory, newPrice]) => {
  const query: Record<string, any> = { ...route.query }

  // Handle category
  if (newCategory && newCategory !== "all") {
    query.category = newCategory
  } else {
    delete query.category
  }

  // Handle price range
  delete query.min_price
  delete query.max_price

  if (newPrice && newPrice !== "all") {
    const range = priceRanges.find(r => r.id === newPrice)
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
            <div v-for="category in categories" :key="category.id" class="flex items-center space-x-2">
              <RadioGroupItem :id="`cat-${category.id}`" :value="category.id" />
              <Label :for="`cat-${category.id}`">{{ category.name }}</Label>
            </div>
          </RadioGroup>
        </div>

        <!-- Price Range -->
        <div class="space-y-2">
          <Label>Price Range</Label>
          <RadioGroup v-model="selectedPriceRange" class="grid gap-2">
            <div v-for="range in priceRanges" :key="range.id" class="flex items-center space-x-2">
              <RadioGroupItem :id="`price-${range.id}`" :value="range.id" />
              <Label :for="`price-${range.id}`">{{ range.name }}</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </SheetContent>
  </Sheet>
</template>
