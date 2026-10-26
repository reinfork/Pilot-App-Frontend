export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const isAuthenticated = computed(() => !!token.value)

  function setToken(value: string | null) {
    token.value = value
  }

  return { token, isAuthenticated, setToken }
})
