export default defineNuxtRouteMiddleware((to) => {
  if (to.path !== '/login' && !useAuthStore().isAuthenticated) {
    return navigateTo('/login')
  }
})
