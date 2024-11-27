import Cookie from 'js-cookie'

export default function ({
  store,
  redirect,
  route
}) {
  const user = localStorage.getItem('username')
  const isA = Boolean(Cookie.get('opsiconfd-session') && user && user !== '')
  console.log('user:', user, 'isA:', isA)
  // const isA = store.getters['auth/isAuthenticated']
  // value is different from store.auth.isAuthenticated
  // seems to be a timing issue
  if (isA && route.name === 'login') {
    return redirect('/')
  } else if (!isA && route.name !== 'login') {
    store.dispatch('selections/clearAllSelection')
    return redirect('/login')
  }
}
