<template>
  <div class="container">
    <div>
      <h1 class="title">opsiweb</h1>

      <b-form-input readonly v-model="opsiconfigserver"></b-form-input>
      <b-form-input v-model="form.username"></b-form-input>
      <b-form-input v-model="form.password"></b-form-input>
      <b-button @click="login">login</b-button>
      {{result}}
      <div class="links">
        <a
          href="https://nuxtjs.org/"
          target="_blank"
          rel="noopener noreferrer"
          class="button--green"
        >
          Documentation
        </a>
        <a
          href="https://github.com/nuxt/nuxt.js"
          target="_blank"
          rel="noopener noreferrer"
          class="button--grey"
        >
          GitHub
        </a>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name:"index",
  data(){return {
    form:{username:"", password:""},
    result:"",
  }},
  async asyncData({ $axios }) {
    let data = await $axios.$post('/api/user/opsiserver', {});
    return { opsiconfigserver:data.result}
  },
  methods:{
    async login(){
      if (!this.form.username) return
      if (!this.form.password) return

      const User = new FormData();
      User.append("username", this.form.username);
      User.append("password", this.form.password);
    //   let user = {username: this.form.username, password: this.form.password,}
      let data = await this.$axios.$post('/api/auth/login', User);
      this.result = data.result
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
