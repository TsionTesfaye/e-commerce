<script setup>
import { ref } from "vue"

const isMobileMenuOpen = ref(false)

const navLinks = [
  { to: "", text: "Dashboard" },
  { to: "/admin", text: "Add Products" },
  { to: "", text: "Products" },
  { to: "", text: "Users" },
  { to: "", text: "Orders" },
]

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function closeMobileMenu() {
  isMobileMenuOpen.value = false
}
</script>

<template>
  <div class="flex h-screen overflow-hidden">
    <!-- Sidebar -->
    <aside class="hidden h-screen w-64 overflow-y-auto bg-gray-800 text-white md:flex md:flex-col">
      <div class="p-4 text-2xl font-bold">
        Admin Panel
      </div>
      <nav class="flex-1">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          active-class="bg-gray-900"
          class="block px-4 py-2 transition-colors duration-200 hover:bg-gray-700"
        >
          {{ link.text }}
        </NuxtLink>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="flex min-h-0 flex-1 flex-col overflow-hidden">
      <!-- Mobile Navbar -->
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
            :to="link.to"
            class="block rounded-md px-3 py-2 text-base font-medium transition-colors duration-200 hover:bg-gray-700"
            @click="closeMobileMenu"
          >
            {{ link.text }}
          </NuxtLink>
        </div>
      </nav>

      <!-- Main Scrollable Content -->
      <main class="flex-1 overflow-y-auto p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
