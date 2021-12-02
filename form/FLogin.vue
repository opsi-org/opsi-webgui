<template>
  <div data-testid="FLogin" @keyup.enter="doLogin">
    <b-form-input v-model="opsiconfigserver" readonly class="login_input_field server" :placeholder="opsiconfigserver" />
    <b-form-input v-model="form.username" :placeholder="$t('loginPage.username')" :state="validUsername" class="login_input_field" />
    <b-form-input v-model="form.password" :placeholder="$t('loginPage.password')" :state="validPassword" type="password" class="login_input_field" />
    <b-button data-testid="btn-login" class="login_input_field_btn" variant="primary" block @click="doLogin">
      {{ $t('button.login') }}
    </b-button>
    <IconILoading v-if="isLoading" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { makeToast } from 'uib-components/.utils/utils/scomponents' // 'uib-components/.utils/utils/scomponents'
const auth = namespace('auth')
const selections = namespace('selections')
interface FormUser {
    username: string,
    password: string
}

@Component export default class DDTheme extends Vue {
  form: FormUser = { username: '', password: '' }
  opsiconfigserver: string = ''
  isLoading: boolean = false

  @auth.Mutation public login!: (username: string) => void
  @auth.Mutation public logout!: () => void
  @selections.Mutation public setSelectionDepots!: (s: Array<string>) => void

  async fetch () {
    try {
      this.opsiconfigserver = (await this.$axios.$get('/api/user/opsiserver')).result
    } catch (error) {
      const errorMsg = this.$t('loginPage.errortext') as string
      this.isLoading = false
      makeToast(this, errorMsg, this.$t('message.error') as string, 'danger')
      throw new Error(errorMsg)
    }
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
          const selectionDepot: Array<string> = []
          selectionDepot.push(this.opsiconfigserver)
          this.setSelectionDepots([...selectionDepot])
          this.isLoading = false
        }
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error)
        this.logout()
        const errorMsg = this.$t('message.loginFailed') as string
        this.isLoading = false
        makeToast(this, errorMsg, this.$t('message.error') as string, 'danger')
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
