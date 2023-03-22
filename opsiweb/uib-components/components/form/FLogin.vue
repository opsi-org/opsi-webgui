<template>
  <!-- TODO: Read changelogs from tag and add it to changelog.md. Frontend is ready with a What's new view added to login and support page.  -->
  <div>
    <OverlayOLoading :is-loading="isLoading" />
    <b-card
      data-testid="FLogin"
      class="text-center bg-primary mt-3 mx-auto"
      :style="$mq === 'mobile'? 'width:100%;' : 'width:50%;max-width:400px;' "
    >
      <IconIOpsiLogo v-once :light="true" class="mb-3" height="35" />
      <h2 v-once data-testid="login_title" class="d-inline-block text-light projectTitle webgui_title">
        {{ $t('title.project') }}
      </h2>
      <div @keyup.enter="doLogin">
        <b-form>
          <b-input-group>
            <b-form-input
              id="configserver"
              v-model="opsiconfigserver"
              data-testid="login_configserver"
              :aria-label="$t('title.configserver')"
              readonly
              class="mb-2"
              :placeholder="opsiconfigserver"
            />
          </b-input-group>

          <b-input-group>
            <b-form-input
              id="username"
              v-model="form.username"
              :aria-label="$t('form.username')"
              :placeholder="$t('form.username')"
              :state="validUsername"
              class="mb-2 username"
              autocomplete="current_username"
            />
          </b-input-group>
          <b-input-group>
            <b-form-input
              id="password"
              v-model="form.password"
              :aria-label="$t('form.password')"
              :placeholder="$t('form.password')"
              :state="validPassword"
              :type="showPassword? 'text': 'password'"
              class="mb-2 password"
              autocomplete="current_password"
            />
            <b-button variant="primary" :pressed.sync="showPassword" class="mb-2 text-light">
              <span class="sr-only">{{ showPassword? $t('form.password.hide'): $t('form.password.show') }}</span>
              <b-icon v-if="showPassword" :icon="iconnames.valueShow" />
              <b-icon v-else :icon="iconnames.valueHide" />
            </b-button>
          </b-input-group>
          <b-button data-testid="btn-login" variant="primary" class="mt-1 border-light login text-light" block @click="doLogin">
            {{ $t('button.login') }}
          </b-button>
        </b-form>
      </div>
    </b-card>
    <!-- <CardCWhatsNew /> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { Constants } from '../../mixins/uib-mixins'
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
  $mq:any

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
        const ref = (this.$root.$children[1].$refs.authAlert as any) || (this.$root.$children[2].$refs.authAlert as any)
        const errorMsg = this.$t('message.error.opsiconfd') as string
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
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
        const ref = (this.$root.$children[1].$refs.authAlert as any) || (this.$root.$children[2].$refs.authAlert as any)
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.details) ? error.response.data.details : '')
        ref.alert(this.$t('message.error.login') as string, 'danger', detailedError)
      })
  }
}
</script>