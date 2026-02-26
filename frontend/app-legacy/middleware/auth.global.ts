export default defineNuxtRouteMiddleware(async (to) => {
  if (to.path === '/login') return

  const userStore = useUserStore()
  const authenticated = userStore.isAuthenticated

  if (!authenticated) {
    userStore.globalError = 'Session expired or not authenticated.'
    return navigateTo('/login')
  }
})
