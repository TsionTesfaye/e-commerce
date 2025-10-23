<script setup lang="ts">
import { Check } from "lucide-vue-next"
import { SORT_OPTIONS } from "~/constants/categories"

const route = useRoute()
const router = useRouter()

const selectedSort = ref(route.query.sort?.toString() || "none")

watch(selectedSort, (newValue) => {
  const query = { ...route.query }

  // Remove all sorting parameters first )
  delete query.created_at
  delete query.price

  if (newValue !== "none") {
    const option = SORT_OPTIONS.find(opt => opt.value === newValue)
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
        v-for="option in SORT_OPTIONS"
        :key="option.value"
        class="flex items-center justify-between"
        @click="selectedSort = option.value"
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
