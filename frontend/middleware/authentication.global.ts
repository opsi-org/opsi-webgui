import { abortNavigation, defineNuxtRouteMiddleware, navigateTo, useCookie } from "nuxt/app"
// import { storeAuth } from "../store/authsstore"


export default defineNuxtRouteMiddleware((to, from) => {
  if (window.location.port === '6006' || window.location.port === '3000') {
    console.log('access from storybook')
    return
  }

  const config = useRuntimeConfig()
  if (to.params.id === '1') {
    console.log('no idea what happend here', to.name, from.name)
    return abortNavigation()
  }
  // const isA:Boolean = storeAuth().isAuthenticated // has old values in store...
  const isA = Boolean(useCookie('opsiconfd-session') && storeAuth().username)
  // const isA = Boolean(useCookie('opsiconfd-session') && localStorage.getItem('username'))

  console.log('try basepage is', config.public.BASE_PAGE)
  console.log('try isAuthenticated', isA)
  console.log('try to.name', to.name)
  if (isA && to.name === 'login') {
    console.log('try redirect to basepage')
    return navigateTo('' + config.public.BASE_PAGE)
  } else if (!isA && to.name !== 'login') {
    console.log('try redirect to login')
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