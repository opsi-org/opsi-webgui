<template>
  <!-- TODO: Read changelogs from tag and add it to changelog.md. Frontend is ready with a What's new view added to login and support page.  -->
  <div role="main">
    <h1 class="sr-only">
      {{ $t('button.login') }}
    </h1>
    <OverlayOLoading :is-loading="isLoading" />
    <b-card
      data-testid="FLogin"
      class="text-center bg-primary mt-3 mx-auto"
      :style="$mq === 'mobile'? 'width:100%;' : 'width:50%;max-width:400px;' "
    >
      <IconIOpsiLogo v-once :light="themeclass !== CONST_LIGHT" :short="false" class="mb-2" classes="w-100" />
      <!-- <h3 v-once data-testid="login_title" class="d-inline-block text-light projectTitle webgui_title">
        {{ $t('title.project') }}
      </h3> -->
      <div @keyup.enter="doLogin">
        <b-form class="mt-1">
          <b-input-group>
            <b-form-input
              id="configserver"
              v-model="opsiconfigserver"
              data-testid="login_configserver"
              :aria-label="$t('title.configserver')"
              readonly
              size="sm"
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
              size="sm"
              class="mb-2 username"
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
              size="sm"
              class="mb-2 password"
            />
            <b-button variant="primary" :pressed.sync="showPassword" size="sm" class="mb-2 text-light">
              <span class="sr-only">{{ showPassword? $t('form.password.hide'): $t('form.password.show') }}</span>
              <b-icon :icon="showPassword ? icon.valueShow : icon.valueHide" />
            </b-button>
          </b-input-group>
          <b-button
            data-testid="btn-login"
            variant="primary"
            size="sm"
            class="mt-1 border-light login text-light"
            block
            @click="doLogin"
          >
            {{ $t('button.login') }}
          </b-button>
        </b-form>
      </div>
    </b-card>
  </div>
</template>

<script lang="ts">
import { Component, Vue, namespace } from 'nuxt-property-decorator'
import { Icons } from '../../mixins/icons'
import { Configserver } from '../../mixins/get'
import { Settings } from '../../mixins/settings'
const auth = namespace('auth')
const selections = namespace('selections')
const cache = namespace('data-cache')
interface FormUser {
    username: string,
    password: string
}

@Component({ mixins: [Icons, Configserver, Settings] })
export default class FLogin extends Vue {
  themeclass!: string // mixin Settings
  CONST_LIGHT!: string // mixin Settings
  icon: any
  $router:any
  $route:any
  $axios:any
  $t: any
  $mq:any
  getOpsiConfigServer:any

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
    const alertRef = (this.$root.$children[1].$refs.authAlert as any) || (this.$root.$children[2].$refs.authAlert as any)
    await this.getOpsiConfigServer(alertRef)
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
        const detailedError = ((error?.response?.data?.message) ? error.response.data.message : '') + ' ' + ((error?.response?.data?.detail) ? error.response.data.detail : '')
        ref.alert(this.$t('message.error.login') as string, 'danger', detailedError)
      })
  }
}
</script>
