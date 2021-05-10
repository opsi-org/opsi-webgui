<template>
  <div >
    <!-- v-if="!isAuthenticated"> -->
    <div>
      <b-form-input readonly v-model="configserver"></b-form-input>
      <b-form-input v-model="form.username">adminuser</b-form-input>
      <b-form-input v-model="form.password">adminuser</b-form-input>
      <b-button @click="login">login</b-button>
      Authenticated? {{isAuthenticated}}
    </div>
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
  }},
  computed:{
    ...mapGetters({ isAuthenticated: "auth/isAuthenticated", }),
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
        this.$router.back()
      }
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
