<template>
  <div>
    <div>
      <b-form-input v-model="opsiconfigserver" readonly />
      <b-form-input v-model="form.username" :state="validUsername" />
      <b-form-input v-model="form.password" :state="validPassword" type="password" />
      <!-- <b-button @click="login" :disabled="(validUsername&&validPassword)!==null">login</b-button> -->
      <!-- <b-button @click="login" :disabled="(validUsername!==null&&validPassword!==null)">login</b-button> -->
      <b-button @click="doLogin">
        {{ $t('button.login') }}
      </b-button>
      <p>{{ result }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, namespace } from 'nuxt-property-decorator'
const auth = namespace('auth')
interface FormUser {
    username: string,
    password: string
}

@Component export default class DDTheme extends Vue {
  form: FormUser = { username: '', password: '' }
  opsiconfigserver: string = ''
  result: string = ''

  @auth.Mutation public login!: (username: string) => void
  @auth.Mutation public logout!: () => void

  async fetch () {
    this.opsiconfigserver = (await this.$axios.$get('/api/user/opsiserver')).result
  }

  get validUsername () {
    if (this.form.username !== '') { return null }
    return false
  }

  get validPassword () {
    if (this.form.password !== '') { return null }
    return false
  }

  doLogin () {
    this.result = ''
    if (!this.form.username) { return }
    if (!this.form.password) { return }

    const User = new FormData()
    User.append('username', this.form.username)
    User.append('password', this.form.password)
    this.$axios.post('/api/auth/login', User)
      .then((response) => {
        if (response.data.result === 'Login success') {
          this.login(this.form.username)
          if (this.$route.name === 'login') {
            this.$router.push({ path: '/' })
          } else {
            this.$router.back()
          }
        }
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
        this.logout()
        this.result = 'login failed'
      })
  }
}
</script>

<style>
</style>
