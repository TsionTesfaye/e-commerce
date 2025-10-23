// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-04-03",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "shadcn-nuxt",
    "@nuxtjs/color-mode",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/eslint",
    "@nuxt/image",
  ],
  eslint: {
    config: {
      standalone: false,
      stylistic: false,
    },
  },
  shadcn: {
    prefix: "",
  },
  components: {
    global: true,
    dirs: ["~/components"],
  },
  ssr: false,
  runtimeConfig: {
    public: {
      apiEndpoint: process.env.NUXT_PUBLIC_API_ENDPOINT || "https://online-shop-1-afra.onrender.com",
    },
  },
})
