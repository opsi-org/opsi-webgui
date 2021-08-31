<template>
  <div @keyup.enter="doLogin">
    <b-form-input v-model="opsiconfigserver" readonly class="login_input_field" />
    <b-form-input v-model="form.username" :placeholder="$t('loginPage.username')" :state="validUsername" class="login_input_field" />
    <b-form-input v-model="form.password" :placeholder="$t('loginPage.password')" :state="validPassword" type="password" class="login_input_field" />
    <!-- <b-button @click="login" :disabled="(validUsername&&validPassword)!==null">login</b-button> -->
    <!-- <b-button @click="login" :disabled="(validUsername!==null&&validPassword!==null)">login</b-button> -->
    <b-button class="login_input_field_btn" variant="primary" block @click="doLogin">
      {{ $t('button.login') }}
    </b-button>
    <IconILoading v-if="isLoading" />

    <!-- <p>{{ result }}</p> -->
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
  isLoading: boolean = false

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
    if (!this.form.username) {
      return
    }
    if (!this.form.password) {
      return
    }
    this.isLoading = true

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
          this.isLoading = false
        }
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
        this.logout()
        this.result = (this as any).$t('message.loginFailed')
        this.isLoading = false
        this.$bvToast.toast(this.result, {
          title: (this as any).$t('message.error'),
          toaster: 'b-toaster-bottom-right',
          variant: 'danger',
          autoHideDelay: 5000,
          appendToast: false
        })
      })
  }
}
</script>

<style>
.login_input_field {
  margin-bottom: 5px;
}
.login_input_field_btn {
  border: 1px solid var(--light) !important;
}
</style>
