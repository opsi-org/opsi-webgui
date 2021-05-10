<template>
  <div>
    <div>
      <b-form-input readonly v-model="configserver"></b-form-input>
      <b-form-input v-model="form.username">adminuser</b-form-input>
      <b-form-input v-model="form.password">adminuser</b-form-input>
      <b-button @click="login">login</b-button>
      <!-- {{result}} <br /> -->
      <!-- LoggedIn: {{loggedIn}} <br /> -->
    </div>
      result: {{result}} <br />
  </div>
</template>

<script>
import Vue from 'vue'
import {mapState, mapGetters, mapMutations} from 'vuex'

// import Cookie from 'js-cookie'
export default Vue.extend({
  name:"index",
  props:{
    configserver:String,
  },
  data(){return {
    form:{username:"adminuser", password:"adminuser"},
    result:"",
    // isAuthenticated: false,
  }},
  computed:{

    // ...mapState('auth', ['loggedIn', 'user']),
    ...mapGetters({
      Xusername: "myauth/username",
      Xexpired: "myauth/expired",
    }),
  },
  methods:{
    // ...mapMutations({
    //   XsetUsername:'myauth/setUsername',
    //   XsetExpired:'myauth/setExpired',
    // }),
    async login(){
      if (!this.form.username) return
      if (!this.form.password) return

      const User = new FormData();
      User.append("username", this.form.username);
      User.append("password", this.form.password);
      // var xhr = new XMLHttpRequest();
      // let host = "https://localhost:4447/webgui"
      // xhr.open('POST', `${host}/api/auth/login`, true);
      // xhr.setRequestHeader('Content-Type', 'application/json');
      // xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      // xhr.withCredentials = true;

      // xhr.send(User);



      // xhr.open('POST', `${host}/api/user/getsettings`, true);
      // xhr.withCredentials = true;
      // xhr.send(null);
      this.result = ""

      try {
        // let response = await this.$auth.loginWith('cookie', {data:User});
        // let response = await this.$auth.login({data:User})
        let response = await this.$axios.$post('/api/auth/login', User);
        console.log("response after request", response)
        this.result = this.result + response.result
      } catch (e) { console.error(e); }


      try {
        let data = await this.$axios.$post('/api/user/getsettings');
        console.log("data", data)
        this.result = this.result + data
      } catch (e) { console.error(e);
        this.result = this.result + " --- but cannot get settings: " + e
      }
      // try {
        //   let response = await this.$auth.loginWith('local', {data:User});
      //   console.log(response)
      // } catch (err) {
        //   console.log(err)
      // }
      // let data = await this.$axios.$post('/api/auth/login', User);
      // if (data.result === 'Login success'){
        //   this.XsetUsername(this.form.username)
      //   // this.XsetExpired()
      //   console.log(data)
      //   // console.log(Cookie.get('opsiconfd-session'))
      //   let data = await this.$axios.$post('/api/user/getsettings');
        // let data = await this.$axios.$post('/api/user/getsettings');
        // var config = { headers: {'Content-Type' : 'application/json'},
        //   withCredentials: true
        //   }
        // await this.$axios.post('/api/user/getsettings', config)
        //   .then(function(response) {
        //     console.log('response', response)
        //   })
        //   .catch(function(error) {
        //     console.log('error', error)
        //   });
        // this.result = data.result
    //   }
      // this.result = data.result
    },
    // async userLogin() {
    //   if (this.form.username !== "" && this.form.password !== "") {
    //     await this.$axios
    //       .post("/api/auth/login", this.form)
    //       .then((response) => {
    //         this.$store.commit("setUser", response.data);
    //         this.$store.commit("setAuthenticated", true);
    //         this.$cookies.set("authUser", JSON.stringify(response.data), {
    //           maxAge: 60 * 60 * 24 * 7,
    //         });
    //         if (this.$route.query.redirect) {
    //           this.$router.push(this.$route.query.redirect);
    //         }
    //         this.$router.push("/panel");
    //       })
    //       .catch((e) => {
    //         this.$toast
    //           .error("Error logging in", { icon: "error" })
    //           .goAway(800);
    //       })
    //     }
    // }
  }
})
</script>

<style>
.container {
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.title {
  font-family:
    'Quicksand',
    'Source Sans Pro',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    'Helvetica Neue',
    Arial,
    sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}
</style>
