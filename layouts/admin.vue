<template>
  <div class="flex h-screen bg-gray-100">
    <!-- Sidebar for screens md and up -->
    <aside class="hidden md:flex md:flex-col w-64 bg-gray-800 text-white">
      <div class="p-4 text-2xl font-bold">Admin Panel</div>
      <nav class="flex-1">
        <NuxtLink
          v-for="link in navLinks"
          :key="link.to"
          :to="link.to"
          active-class="bg-gray-900"
          class="block px-4 py-2 hover:bg-gray-700 transition-colors duration-200"
        >
          {{ link.text }}
        </NuxtLink>
      </nav>
    </aside>

    <!-- Main content area and top navbar -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Top navbar for smaller screens -->
      <nav class="md:hidden bg-gray-800 text-white">
        <div class="flex items-center justify-between p-4">
          <div class="text-xl font-bold">Admin Panel</div>
          <button @click="toggleMobileMenu" class="text-white focus:outline-none">
            <svg
              class="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                v-if="!isMobileMenuOpen"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
              <path
                v-else
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              ></path>
            </svg>
          </button>
        </div>
        <div v-if="isMobileMenuOpen" class="px-2 pt-2 pb-4">
          <NuxtLink
            v-for="link in navLinks"
            :key="link.to"
            :to="link.to"
            class="block px-3 py-2 rounded-md text-base font-medium hover:bg-gray-700 transition-colors duration-200"
            @click="closeMobileMenu"
          >
            {{ link.text }}
          </NuxtLink>
        </div>
      </nav>

      <!-- Main content area -->
      <main class="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
        <div class="container mx-auto px-6 py-8">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const isMobileMenuOpen = ref(false);

const navLinks = [
  { to: "", text: "Dashboard" },
  { to: "/admin", text: "Add Products" },
  { to: "", text: "Products" },
  { to: "", text: "Users" },
  { to: "", text: "Orders" },
];

const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value;
};

const closeMobileMenu = () => {
  isMobileMenuOpen.value = false;
};
</script>

<style scoped>
/* Add layout-specific styles here */
</style>
