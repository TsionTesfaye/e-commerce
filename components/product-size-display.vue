<script lang="ts" setup>
import type { ProductDetail, ProductVariant } from "~/types/product"

const props = defineProps<{
  product: ProductDetail
}>()

const emit = defineEmits(["select"])

const selectedSize = ref<string | null>(null)
const selectedColor = ref<string | null>(null)
const selectedVariant = ref<ProductVariant | null>(null)

// Get unique sizes and colors
const sizes = computed(() => {
  const uniqueSizes = new Set<string>()
  props.product.variants.forEach((variant) => {
    if (typeof variant.size === "object" && variant.size.sizeLetter) {
      uniqueSizes.add(variant.size.sizeLetter)
    }
    if (typeof variant.size === "object" && variant.size.metric && variant.size.size) {
      uniqueSizes.add(`${variant.size.size} ${variant.size.metric}`)
    }
  })
  return Array.from(uniqueSizes).sort()
})

const colors = computed(() => {
  const uniqueColors = new Set<string>()
  props.product.variants.forEach((variant) => {
    if (typeof variant.color === "object" && variant.color.color) {
      uniqueColors.add(variant.color.color)
    }
  })
  return Array.from(uniqueColors)
})

// Get available colors for selected size
const availableColors = computed(() => {
  if (!selectedSize.value) {
    return []
  }
  return props.product.variants
    .filter((variant) => {
      if (typeof variant.size === "object" && variant.size.sizeLetter) {
        return variant.size.sizeLetter === selectedSize.value
      }
      if (typeof variant.size === "object" && variant.size.metric && variant.size.size) {
        return `${variant.size.size} ${variant.size.metric}` === selectedSize.value
      }
      return false
    })
    .map(variant => typeof variant.color === "object" ? variant.color.color : variant.color)
})

// Get all unique colors (only used for accessories)
const allColors = computed(() => {
  const uniqueColors = new Set<string>()
  props.product.variants.forEach((variant) => {
    if (typeof variant.color === "object" && variant.color.color) {
      uniqueColors.add(variant.color.color)
    }
  })
  return Array.from(uniqueColors)
})

// Get stock for selected variant
const stock = computed(() => {
  if (!selectedSize.value || !selectedColor.value) {
    return 0
  }
  const variant = props.product.variants.find((v) => {
    const sizeMatches = (typeof v.size === "object" && v.size.sizeLetter === selectedSize.value)
      || (typeof v.size === "object" && v.size.metric && v.size.size && `${v.size.size} ${v.size.metric}` === selectedSize.value)
    const colorMatches = typeof v.color === "object" ? v.color.color === selectedColor.value : v.color === selectedColor.value
    return sizeMatches && colorMatches
  })
  return variant?.stock_quantity || 0
})

// Get variant details for display
const variantDetails = computed(() => {
  if (!selectedVariant.value) {
    return null
  }
  const { size } = selectedVariant.value
  const details = []

  if (typeof size === "object") {
    if (size.fit) {
      details.push({ label: "Fit", value: size.fit })
    }
    if (size.bust) {
      details.push({ label: "Bust", value: `${size.bust}cm` })
    }
    if (size.hips) {
      details.push({ label: "Hips", value: `${size.hips}cm` })
    }
    if (size.waist) {
      details.push({ label: "Waist", value: `${size.waist}cm` })
    }
    if (size.length) {
      details.push({ label: "Length", value: `${size.length}cm` })
    }
    if (size.sleeve) {
      details.push({ label: "Sleeve", value: `${size.sleeve}cm` })
    }
    if (size.customSize) {
      details.push({ label: "Size", value: size.customSize })
    }
  }

  return details
})

// Initialize with first available size
onMounted(() => {
  if (sizes.value.length > 0) {
    selectedSize.value = sizes.value[0]
  }
})

// watcher for size and color changes
watch(() => ({
  size: selectedSize.value,
  color: selectedColor.value,
}), (newState, oldState) => {
  // Handle size changes
  if (newState.size !== oldState?.size && newState.size) {
    const variant = props.product.variants.find((v) => {
      if (typeof v.size === "object" && v.size.sizeLetter) {
        return v.size.sizeLetter === newState.size
      }
      if (typeof v.size === "object" && v.size.metric && v.size.size) {
        return `${v.size.size} ${v.size.metric}` === newState.size
      }
      return false
    })

    if (variant) {
      selectedVariant.value = variant
      selectedColor.value = typeof variant.color === "object" ? variant.color.color : variant.color
      emit("select", variant)
    }
  }

  // handle color changessd
  if (newState.color !== oldState?.color && newState.color && newState.size) {
    const variant = props.product.variants.find((v) => {
      const sizeMatches = (typeof v.size === "object" && v.size.sizeLetter === newState.size)
        || (typeof v.size === "object" && v.size.metric && v.size.size && `${v.size.size} ${v.size.metric}` === newState.size)
      const colorMatches = typeof v.color === "object" ? v.color.color === newState.color : v.color === newState.color
      return sizeMatches && colorMatches
    })

    if (variant) {
      selectedVariant.value = variant
      emit("select", variant)
    }
  }
})
</script>

<template>
  <div class="flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm">
    <h3 class="text-xl font-semibold">
      Available Options
    </h3>

    <!-- Size Selection -->
    <div v-if="sizes.length > 0">
      <p class="mb-2 text-base font-medium text-gray-600">
        Size
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="size in sizes"
          :key="size"
          class="min-w-[40px] rounded-full border px-3 py-1.5 text-base transition-colors"
          :class="{
            'border-gray-800 bg-gray-100 text-gray-800': selectedSize === size,
            'border-gray-200 hover:border-gray-300': selectedSize !== size,
          }"
          @click="selectedSize = size"
        >
          {{ size }}
        </button>
      </div>
    </div>

    <!-- Color Selection -->
    <div v-if="colors.length > 0" class="mt-2">
      <p class="mb-2 text-base font-medium text-gray-600">
        Color
      </p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="color in props.product.category_id === 'ACCESSORIES' ? allColors : availableColors"
          :key="color"
          class="size-8 rounded-full border-2 transition-all"
          :class="{
            'border-gray-800 ring-2 ring-gray-200': selectedColor === color,
            'border-gray-200 hover:border-gray-300': selectedColor !== color,
          }"
          :style="{ backgroundColor: color }"
          @click="selectedColor = color"
        />
      </div>
    </div>

    <!-- Variant Details Grid -->
    <div v-if="variantDetails && variantDetails.length > 0" class="mt-2">
      <p class="mb-2 text-base font-medium text-gray-600">
        Measurements
      </p>
      <div class="grid grid-cols-2 gap-2">
        <div v-for="detail in variantDetails" :key="detail.label" class="rounded-lg bg-gray-50 p-2.5">
          <p class="text-sm text-gray-500">
            {{ detail.label }}
          </p>
          <p class="text-base font-medium">
            {{ detail.value }}
          </p>
        </div>
      </div>
    </div>

    <!-- Stock Status -->
    <div v-if="selectedSize && selectedColor" class="mt-3">
      <p class="text-base">
        <span class="font-medium text-gray-600">Availability: </span>
        <span :class="stock > 0 ? 'text-green-600' : 'text-red-600'">
          {{ stock > 0 ? `${stock} in stock` : 'Out of stock' }}
        </span>
      </p>
    </div>
  </div>
</template>
