import Cookie from 'js-cookie'

export default function ({
  // store,
  redirect,
  route
}) {
  const isA = Boolean(Cookie.get('opsiconfd-session') && localStorage.getItem('username'))
  // const isA = store.getters['auth/isAuthenticated']
  // value is different from store.auth.isAuthenticated
  // seems to be a timing issue
  if (isA && route.name === 'login') {
    return redirect('/')
  } else if (!isA && route.name !== 'login') {
    return redirect('/login')
  }
}
