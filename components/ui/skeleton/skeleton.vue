<script lang="ts" setup>
import { cn } from "@/lib/utils"

const props = defineProps<{
  class?: string
}>()
</script>

<template>
  <div
    :class="cn('animate-pulse rounded-md bg-gray-200 dark:bg-gray-800', props.class)"
    role="status"
    aria-label="Loading"
  />
</template>
