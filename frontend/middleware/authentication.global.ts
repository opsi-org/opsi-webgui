import { abortNavigation, defineNuxtRouteMiddleware, navigateTo, useCookie } from "nuxt/app"
// import { useAuthStore } from "../store/authsstore"


export default defineNuxtRouteMiddleware((to, from) => {
  const config = useRuntimeConfig()
  if (to.params.id === '1') {
    console.log('no idea what happend here', to.name, from.name)
    return abortNavigation()
  }
  // const isA:Boolean = useAuthStore().isAuthenticated // has old values in store...
  const isA = Boolean(useCookie('opsiconfd-session') && localStorage.getItem('username'))

  if (isA && to.name === 'login') {
    return navigateTo(config.public.BASE_PAGE)
  } else if (!isA && to.name !== 'login') {
    //TODO: useSelectionStore
    // store.dispatch('selections/clearAllSelection')
    return navigateTo('/login')
  }
  // In a real app you would probably not redirect every route to `/`
  // however it is important to check `to.path` before redirecting or you
  // might get an infinite redirect loop
  // if (to.path !== '/') {
  //   return navigateTo('/')
  // }
})