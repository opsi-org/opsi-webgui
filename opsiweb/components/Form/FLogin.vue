<template>
  <div>
    <div>
      <b-form-input v-model="opsiconfigserver" readonly />
      <b-form-input v-model="form.username" :state="validUsername" />
      <b-form-input v-model="form.password" :state="validPassword" type="password" />
      <!-- <b-button @click="login" :disabled="(validUsername&&validPassword)!==null">login</b-button> -->
      <!-- <b-button @click="login" :disabled="(validUsername!==null&&validPassword!==null)">login</b-button> -->
      <b-button @click="login">
        login
      </b-button>
      <p>{{ result }}</p>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import { mapMutations } from 'vuex'

export default Vue.extend({
  name: 'FLogin',
  fetchOnServer: false, // call fetch only on client-side
  data () {
    return {
      opsiconfigserver: '',
      form: { username: 'adminuser', password: 'adminuser' },
      result: ''
    }
  },
  async fetch () {
    this.opsiconfigserver = (await this.$axios.$post('/api/user/opsiserver')).result
  },
  computed: {
    validUsername () {
      if (this.form.username !== '') { return null }
      return false
    },
    validPassword () {
      if (this.form.password !== '') { return null }
      return false
    }
  },
  methods: {
    ...mapMutations({
      Xlogin: 'auth/login',
      Xlogout: 'auth/logout'
    }),
    login () {
      this.result = ''
      if (!this.form.username) { return }
      if (!this.form.password) { return }

      const User = new FormData()
      User.append('username', this.form.username)
      User.append('password', this.form.password)
      // let response = await this.$axios.$post('/api/auth/login', User)
      this.$axios.post('/api/auth/login', User)
        .then((response) => {
          if (response.data.result === 'Login success') {
            this.Xlogin(this.form.username)
            if (this.$route.name === 'login') {
              this.$router.push({ path: '/' })
            } else {
              this.$router.back()
            }
          }
        }).catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error)
          this.Xlogout()
          this.result = 'login failed'
        })
    }
  }
})
</script>

<style>
</style>
