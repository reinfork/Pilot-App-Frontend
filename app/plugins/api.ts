export default defineNuxtPlugin(() => {
  const auth = useAuthStore()

  const api = $fetch.create({
    baseURL: useRuntimeConfig().public.apiBase as string,
    onRequest({ options }) {
      if (auth.token) {
        const headers = new Headers(options.headers)
        headers.set('Authorization', `Bearer ${auth.token}`)
        options.headers = headers
      }
    },
    async onResponseError({ response }) {
      if (response.status === 401 && useRoute().path !== '/login') {
        auth.setToken(null)
        await navigateTo('/login')
      }
    },
  })

  return { provide: { api } }
})
