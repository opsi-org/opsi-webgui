// import axios from 'axios'
// export default ({ res, store }) => {
//   if (process.server) {
//     axios.get(process.env.token)
//       .then((response) => {
//         document.cookie = "token="+response.data.token+"; expires=Thu, 18 Dec 2019 12:00:00 UTC; path=/";
//       })
//   }
// }
//middleware/authenticated.js
export default function ({
    store,
    redirect,
    route
  }) {
    console.log("IsAuthenticated", store.getters['auth/isAuthenticated'])
    if (route.name === 'login'){
      if (store.getters['auth/isAuthenticated'])
        return redirect('/')
    }
    else if (!store.getters['auth/isAuthenticated']) {
      console.log("redirect to login")
      return redirect('/login')
    }
  }