<script setup lang="ts">
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Check } from "lucide-vue-next"

const route = useRoute()
const router = useRouter()

const sortOptions = [
  { value: "none", label: "None" },
  { value: "newest", label: "Newest", field: "created_at", order: "desc" },
  { value: "oldest", label: "Oldest", field: "created_at", order: "asc" },
  { value: "price-high", label: "Price: High to Low", field: "price", order: "desc" },
  { value: "price-low", label: "Price: Low to High", field: "price", order: "asc" },
]

const selectedSort = ref(route.query.sort?.toString() || "none")

watch(selectedSort, (newValue) => {
  const query = { ...route.query }
  
  // Remove all sorting parameters first
  delete query.created_at
  delete query.price
  
  if (newValue !== "none") {
    const option = sortOptions.find(opt => opt.value === newValue)
    if (option && option.field && option.order) {
      // Set the appropriate field based on sort type
      query[option.field] = option.order
    }
  }
  
  // Update the sort indicator in URL
  if (newValue === "none") {
    delete query.sort
  } else {
    query.sort = newValue
  }
  
  router.replace({ query })
})
</script>

<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <button class="flex items-center gap-1 px-2 py-1.5">
        <Icon name="basil:sort-outline" class="size-5 text-gray-500" />
        <span>Sort</span>
      </button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-[200px]">
      <DropdownMenuItem 
        v-for="option in sortOptions" 
        :key="option.value" 
        @click="selectedSort = option.value"
        class="flex items-center justify-between"
      >
        <span>{{ option.label }}</span>
        <Check 
          v-if="selectedSort === option.value" 
          class="size-4 text-blue-500" 
        />
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>