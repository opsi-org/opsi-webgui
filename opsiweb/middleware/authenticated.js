export default function ({
    store,
    redirect,
    route
  }) {
    console.log("IsAuthenticated", store.getters['auth/isAuthenticated'])
    if (store.getters['auth/isAuthenticated'] && route.name === 'login'){
      return redirect('/')
    }
    // if (!store.getters['auth/isAuthenticated'] && route.name === 'login'){ }
    else if (!store.getters['auth/isAuthenticated'] && route.name !== 'login') {
      console.log("redirect to login")
      return redirect('/login')
    }
    console.log("redirect to ??")
  }