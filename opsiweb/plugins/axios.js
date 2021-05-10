export default function ({ $axios, redirect }) {
  $axios.defaults.xsrfHeaderName = 'X-CSRFTOKEN'
  $axios.defaults.xsrfCookieName = 'csrftoken'
    $axios.onRequest(config => {
      console.log('')
      console.log('Making request to ',config)
    })
    $axios.onResponse((response) => {
        // get the set-cookie header from the response
        // const setCookies = response.headers['set-cookie'];
        console.log('Received response from ', response)
        // console.log('');

        // if (setCookies) {
        //   // parse the cookies axios uses
        //   const cookies = parse($axios.defaults.headers.common.cookie);

        //   // add cookies from setCookies to cookies
        //   // set $axios.defaults.headers.common.cookie equal to the new cookie header

        //   // merge the existing Set-Cookie header with setCookies
        //   // set the cookies on the response, so the client gets them back
        //   res.setHeader('Set-Cookie', setCookies);
        // }
      });

    $axios.onError(error => {
      const code = parseInt(error.response && error.response.status)
      // console.error(error)
      console.error("ERROR code:", code)
      // if (code === 400) {
      //   redirect('/400')
      // }
      // else if (code === 401) {
      //     console.error("401: unauthorized")
      //   redirect('/login')
      // }
    })
  }
// export default function({ $axios, redirect }) {
//     $axios.onRequest(config => {
//       config.withCredentials = true

//       return config
//     })
//   }


// export default function ({
//     $axios,
//     store,
//     redirect
//   }) {
//     $axios.onError(error => {
//       if (error.response && error.response.status === 500) {
//         redirect('/')
//       }
//     })
//     $axios.interceptors.response.use(
//       response => {
//         if (response.status === 200) {
//           if (response.request.responseURL && response.request.responseURL.includes('login')) {
//             // store.dispatch("setUser", response);
//             console.log("set user (?)", response)
//           }
//         }
//         return response
//       }
//     )
//   }