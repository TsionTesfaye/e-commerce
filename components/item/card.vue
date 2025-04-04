<script lang="ts" setup>
type Item = {
  id: string
  name: string
  image: string
  price: string
  colors: string[]
  sub_category: string
}

defineProps({
  item: {
    type: Object as () => Item,
    required: true,
  },
})
</script>

<template>
  <div class="h-[300px] xs:h-[350px]">
    <div class="h-full overflow-hidden rounded-b-lg bg-white shadow-md transition-transform duration-200 ease-in-out active:scale-95">
      <!-- Image container with responsive height -->
      <div class="h-[200px] w-full bg-gray-100 xs:h-[250px]">
        <NuxtImg
          :src="item?.image"
          class="size-full object-cover"
          loading="lazy"
        />
      </div>

      <!-- Content section with responsive height -->
      <div class="flex h-[100px] flex-col justify-between p-3 xs:p-4">
        <div>
          <h3 class="line-clamp-2 text-xs font-semibold text-gray-800 xs:text-sm">
            {{ item?.name }}
          </h3>
          <p class="mt-1 text-xs font-medium text-gray-600 xs:text-sm">
            {{ Number(item?.price).toFixed(2) }} Birr
          </p>
        </div>

        <!-- Color options at the bottom -->
        <div class="flex flex-wrap gap-1">
          <div
            v-for="color in item?.colors"
            :key="color"
            class="size-3 rounded-full border border-gray-200 xs:size-4"
            :style="{ backgroundColor: color }"
            :title="color"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Optional: Adjust padding or size if needed */
</style>
