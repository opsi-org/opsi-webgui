import Cookie from 'js-cookie'

export const state = () => ({
  username: null,
  expired: ""
})

// export async function nuxtServerInit({ commit }, { _req, res }) {
//     await this.$axios
//       .$get("/api/users/profile")
//       .then((response) => {
//         commit("setUser", response);
//         commit("setAuthenticated", true);
//       })
//       .catch((error) => {
//         commit("setErrors", [error]); // not covered in this demo
//         commit("setUser", null);
//         commit("setAuthenticated", false);
//         res.setHeader("Set-Cookie", [
//           `session=false; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
//           `authUser=false; expires=Thu, 01 Jan 1970 00:00:00 GMT`,
//         ]);
//       });
//   }

export const getters = {
    username: (state) => state.username,
    expired: (state) => state.expired,
  };

export const mutations = {
    setUsername(state, payload) {
      state.username = payload
    },
    setExpired(state, payload) {
      state.expired = Cookie.get("opsiconfd-session");
    //   state.colortheme.timestamp = new Date(new Date().toLocaleString(["en-EN"], { timeZone: "Europe/Berlin" })).getTime();
    //   Cookie.set('theme', JSON.stringify(payload));
    },
   };

  export const actions = {
  };
