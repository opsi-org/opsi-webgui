<template>
  <div data-testid="FLogin">
    <AlertAAlert ref="loginAlert" />
    <div @keyup.enter="doLogin">
      <b-form>
        <label for="configserver" class="sr-only"> {{ $t('title.configserver') }} </label>
        <b-form-input id="configserver" v-model="opsiconfigserver" readonly class="mb-2" :placeholder="opsiconfigserver" />
        <label for="username" class="sr-only"> {{ $t('form.username') }} </label>
        <b-form-input
          id="username"
          v-model="form.username"
          :placeholder="$t('form.username')"
          :state="validUsername"
          class="mb-2"
          autocomplete="current_username"
        />
        <label for="password" class="sr-only"> {{ $t('form.password') }} </label>
        <b-input-group>
          <b-form-input
            id="password"
            v-model="form.password"
            :placeholder="$t('form.password')"
            :state="validPassword"
            :type="showPassword? 'text': 'password'"
            class="mb-2"
            autocomplete="current_password"
          />
          <b-button variant="primary" :pressed.sync="showPassword" class="mb-2">
            <span class="sr-only">{{ showPassword? 'Hide Password': 'Show Password' }}</span>
            <b-icon v-if="showPassword" :icon="iconnames.valueShow" />
            <b-icon v-else :icon="iconnames.valueHide" />
          </b-button>
        </b-input-group>
        <b-button data-testid="btn-login" variant="primary" class="mt-1 border-light" block @click="doLogin">
          <!-- Quickly change expired time curently only for testing purposes  -->
          <!-- <b-input-group>
            <InputIExpiredTimeChanger />
          </b-input-group> -->
          <!-- <b-button data-testid="btn-login" class="login_input_field_btn" variant="primary" block @click="doLogin"> -->
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
  $router:any
  $route:any
  $axios:any
  $t: any

  form: FormUser = { username: '', password: '' }
  isLoading: boolean = false
  showPassword : boolean = false

  @cache.Getter public opsiconfigserver!: string
  @cache.Mutation public setOpsiconfigserver!: (s: string) => void
  @auth.Mutation public login!: (username: string) => void
  @auth.Mutation public logout!: () => void
  @auth.Mutation public clearSession!: () => void
  @auth.Mutation public setSession!: () => void
  @selections.Mutation public setSelectionDepots!: (s: Array<string>) => void

  async fetch () {
    await this.$axios.$get('/api/user/opsiserver')
      .then((response) => {
        this.setOpsiconfigserver(response.result)
      }).catch((error) => {
        const errorMsg = this.$t('message.error.opsiconfd') as string
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.loginAlert as any)
        ref.alert(errorMsg, 'danger', detailedError as string)
      })
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
            this.$router.push({ path: '/clients/' })
          } else {
            this.$router.back()
          }
          const selectionDepot: Array<string> = []
          selectionDepot.push(this.opsiconfigserver)
          this.setSelectionDepots([...selectionDepot])
          this.setSession()
          this.isLoading = false
        }
      }).catch((error) => {
        this.logout()
        this.clearSession()
        this.isLoading = false
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        const ref = (this.$refs.loginAlert as any)
        ref.alert(this.$t('message.error.login') as string, 'danger', detailedError)
      })
  }
}
</script>
