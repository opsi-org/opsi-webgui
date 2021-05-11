export default function ({
  store,
  redirect,
  route
}) {
  if (store.getters['auth/isAuthenticated'] && route.name === 'login') {
    return redirect('/')
  } else if (!store.getters['auth/isAuthenticated'] && route.name !== 'login') {
    return redirect('/login')
  }
}
