<script setup>
import { computed, ref } from "vue"
import { useRoute } from "vue-router"

const isMobileMenuOpen = ref(false)

const navLinks = [
  { to: "", text: "Dashboard", disabled: true },
  { to: "/admin", text: "Add Products", disabled: false },
  { to: "/admin/products", text: "Products", disabled: false },
  { to: "", text: "Users", disabled: true },
  { to: "", text: "Orders", disabled: true },
]

const route = useRoute()

const isProductsRoute = computed(() => {
  return route.path.startsWith("/admin/products")
})

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <div class="fixed inset-0 flex">
    <!-- Sidebar (Fixed for larger screens) -->
    <aside class="sticky top-0 hidden h-screen w-64 overflow-y-auto bg-gray-800 text-white md:flex md:flex-col">
      <div class="p-4 text-2xl font-bold">
        Admin Panel
      </div>
      <nav class="flex-1">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.disabled ? '' : link.to"
          class="block px-4 py-2 transition-colors duration-200 hover:bg-gray-700"
          :class="[
            (link.to === '/admin/products' && isProductsRoute) ? 'bg-gray-900' : '',
            link.disabled ? 'cursor-not-allowed opacity-50' : '',
          ]"
        >
          {{ link.text }}
        </NuxtLink>
      </nav>
    </aside>

    <!-- Mobile Navbar (Hamburger) -->
    <nav class="bg-gray-800 text-white md:hidden">
      <div class="flex items-center justify-between p-4">
        <div class="text-xl font-bold">
          Admin Panel
        </div>
        <button class="text-white focus:outline-none" @click="toggleMobileMenu">
          <svg class="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div v-if="isMobileMenuOpen" class="px-2 pb-4 pt-2">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.disabled ? '' : link.to"
          class="block rounded-md px-3 py-2 text-base font-medium transition-colors duration-200 hover:bg-gray-700"
          :class="[
            (link.to === '/admin/products' && isProductsRoute) ? 'bg-gray-900' : '',
            link.disabled ? 'cursor-not-allowed opacity-50' : '',
          ]"
          @click="closeMobileMenu"
        >
          {{ link.text }}
        </NuxtLink>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="flex flex-1 flex-col">
      <!-- Main Scrollable Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>

<style>
html, body {
  height: 100%;
  margin: 0;
  overflow: hidden;
}
</style>
