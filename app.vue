<script setup lang="ts">
import Toaster from '@/components/ui/toast/Toaster.vue'

</script>

<template>
  <Toaster />
      <NuxtLayout >
        <div >
        <!-- <div class="relative flex items-center justify-center bg-white">
          <div class=" flex w-full flex-col items-center bg-white min-h-screen">
            <NuxtPage />
          </div>
        </div> -->
        <NuxtPage />
      </div>
     
    </NuxtLayout>
 
</template>

<style>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
