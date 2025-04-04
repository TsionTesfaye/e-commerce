<script setup lang="ts">
import { Toaster } from "@/components/ui/toast"
import WebApp from "@twa-dev/sdk"

WebApp.ready()
WebApp.expand()
WebApp.disableVerticalSwipes()
</script>

<template>
  <div>
    <Toaster />
    <NuxtLayout>
      <div>
        <!-- <div class="relative flex items-center justify-center bg-white">
          <div class=" flex w-full flex-col items-center bg-white min-h-screen">
            <NuxtPage />
          </div>
        </div> -->
        <NuxtPage />
      </div>
    </NuxtLayout>
  </div>
</template>

<style>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
</style>
