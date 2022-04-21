<template>
  <div data-testid="FLogin">
    <AlertAAlert ref="loginAlert" />
    <div @keyup.enter="doLogin">
      <b-form>
        <label for="configserver" class="sr-only"> {{ $t('title.configserver') }} </label>
        <b-form-input id="configserver" v-model="opsiconfigserver" readonly class="login_input_field server" :placeholder="opsiconfigserver" />
        <label for="username" class="sr-only"> {{ $t('loginPage.username') }} </label>
        <b-form-input
          id="username"
          v-model="form.username"
          :placeholder="$t('loginPage.username')"
          :state="validUsername"
          class="login_input_field"
          autocomplete="current_username"
        />
        <label for="password" class="sr-only"> {{ $t('loginPage.password') }} </label>
        <b-input-group>
          <b-form-input
            id="password"
            v-model="form.password"
            :placeholder="$t('loginPage.password')"
            :state="validPassword"
            :type="showPassword? 'text': 'password'"
            class="login_input_field"
            autocomplete="current_password"
          />
          <b-button :pressed.sync="showPassword" size="sm" variant="primary">
            <span class="sr-only">{{ showPassword? 'Hide Password': 'Show Password' }}</span>
            <b-icon v-if="showPassword" :icon="iconnames.valueShow" />
            <b-icon v-else :icon="iconnames.valueHide" />
          </b-button>
        </b-input-group>
        <b-button data-testid="btn-login" class="login_input_field_btn" variant="primary" block @click="doLogin">
          {{ $t('button.login') }}
        </b-button>
        <IconILoading v-if="isLoading" />
      </b-form>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
// import { makeToast } from '../../.utils/utils/scomponents'
// 'uib-components/.utils/utils/scomponents'
const auth = namespace('auth')
const selections = namespace('selections')
const cache = namespace('data-cache')
interface FormUser {
    username: string,
    password: string
}

@Component({ mixins: [Constants] })
export default class FLogin extends Vue {
  iconnames: any
  $axios:any
  form: FormUser = { username: '', password: '' }
  isLoading: boolean = false
  showPassword : boolean = false

  @cache.Getter public opsiconfigserver!: string
  @cache.Mutation public setOpsiconfigserver!: (s: string) => void
  @auth.Mutation public login!: (username: string) => void
  @auth.Mutation public logout!: () => void
  @auth.Mutation public clearSession!: () => void
  @selections.Mutation public setSelectionDepots!: (s: Array<string>) => void

  async fetch () {
    try {
      this.setOpsiconfigserver((await this.$axios.$get('/api/user/opsiserver')).result)
    } catch (error) {
      const errorMsg = this.$t('loginPage.errortext') as string
      this.isLoading = false
      const ref = (this.$refs.loginAlert as any)
      ref.alert(errorMsg, 'danger', error as string)
      // makeToast(this, errorMsg, this.$t('message.error') as string, 'danger')
      // eslint-disable-next-line no-console
      console.error(error)
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
    // this.$axios.post('/api/auth/login', User, { headers: { 'X-opsi-session-lifetime': 60 * 20 } })
    this.$axios.post('/api/auth/login', User)
      .then((response) => {
        if (response.data.result === 'Login success') {
          this.login(this.form.username)
          if (this.$route.name === 'login') {
            this.$router.push({ path: '/clients/' })
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
        this.clearSession()
        const errorMsg = this.$t('message.loginFailed') as string
        this.isLoading = false
        const ref = (this.$refs.loginAlert as any)
        ref.alert(errorMsg, 'danger', error as string)
        // makeToast(this, errorMsg, this.$t('message.error') as string, 'danger')
      })
  }
}
</script>

<style>
.login_input_field {
  margin-bottom: 5px;
}
.login_input_field_btn {
  margin-top: 5px;
  border: 0.5px solid var(--light) !important;
}
</style>
