import WebApp from "@twa-dev/sdk"

export default defineNuxtPlugin((nuxtApp) => {
  return {
    provide: {
      WebApp,
    }
  }

})
