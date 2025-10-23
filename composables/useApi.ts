export function useApi() {
  const config = useRuntimeConfig()
  const baseUrl = config.public.apiEndpoint

  const buildUrl = (endpoint: string, params?: Record<string, any>) => {
    const url = new URL(`${baseUrl}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          url.searchParams.append(key, value.toString())
        }
      })
    }
    return url.toString()
  }

  return {
    baseUrl,
    buildUrl,
  }
}
