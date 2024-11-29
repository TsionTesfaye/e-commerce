<script lang="ts" setup>
defineProps({
  item: Object,
})

function getColorCode(color: string) {
  const colorMap = {
    Black: "#000000",
    Red: "#FF0000",
    Nude: "#E3BC9A",
    White: "#FFFFFF",
    Brown: "#964B00",
    Gold: "#FFD700",
  }
  return colorMap[color] || color
}
</script>

<template>
  <div>
    <div class="overflow-hidden rounded-b-lg bg-white shadow-md transition-transform duration-300 ease-in-out hover:scale-105">
      <!-- Use 'relative' and 'overflow-hidden' for better image control -->
      <div class="aspect-w-16 aspect-h-9 relative w-full">
        <NuxtImg :src="item?.image" class="size-full object-cover" loading="lazy" />
      </div>

      <div class="p-4">
        <h3 class="truncate text-lg font-semibold text-gray-800">
          {{ item?.name }}
        </h3>
        <p class="mt-1 text-gray-600">
          ${{ item?.price ? item.price.toFixed(2) : 'N/A' }}
        </p>
        <div class="mt-2 flex">
          <div v-for="color in item?.color" :key="color" class="mr-2 size-6 rounded-full border border-black" :style="{ backgroundColor: getColorCode(color) }" :title="color" />
        </div>
      </div>
    </div>
  </div>
</template>

<style>
/* Optional: Adjust padding or size if needed */
</style>
