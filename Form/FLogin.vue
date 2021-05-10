<template>
  <div >
    <!-- v-if="!isAuthenticated"> -->
    <div>
      <b-form-input readonly v-model="opsiconfigserver"></b-form-input>
      <b-form-input v-model="form.username"  :state="validUsername">adminuser</b-form-input>
      <b-form-input v-model="form.password" type="password" :state="validPassword"></b-form-input>
      <!-- <b-button @click="login" :disabled="(validUsername&&validPassword)!==null">login</b-button> -->
      <!-- <b-button @click="login" :disabled="(validUsername!==null&&validPassword!==null)">login</b-button> -->
      <b-button @click="login">login</b-button>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import {mapMutations} from 'vuex'

export default Vue.extend({
  name:"FLogin",
  fetchOnServer: false, // call fetch only on client-side
  async fetch() {
    this.opsiconfigserver = (await this.$axios.$post('/api/user/opsiserver')).result;
  },
  data(){return {
    opsiconfigserver:"",
    form:{username:"adminuser", password:"adminuser"},
  }},
  computed:{
    validUsername(){
      if (this.form.username!=='') return null
      return false
    },
    validPassword(){
      if (this.form.password!=='') return null
      return false
    },
  },
  methods:{
    ...mapMutations({
      XsetUsername:'auth/setUsername',
    }),
    async login(){
      if (!this.form.username) return
      if (!this.form.password) return

      const User = new FormData();
      User.append("username", this.form.username);
      User.append("password", this.form.password);

      let response = await this.$axios.$post('/api/auth/login', User)
      if (response.result == 'Login success'){
        this.XsetUsername(this.form.username)
        if (this.$route.name === "login"){
          this.$router.push("/")
        }
        else{
          this.$router.back()
        }
      }else{
        alert("error")
      }
      // if (response.result == 'Login success'){

      //   // let data = await this.$axios.$get('/api/user/getsettings');
      //   // // return { settings:data.result}
      //   // this.result = data
      // }
    }
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
