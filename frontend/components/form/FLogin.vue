<template>

  <div role="main">
    <h1 class="sr-only">
      {{ $t('button.login') }}
    </h1>
    <b-card
        data-testid="FLogin"
        class="text-center bg-primary mx-auto"
        :class="mq.$mq === 'mobile'? 'w-full;' : 'w-1/2; max-w-md' "
    >
      <IconIOpsiLogo :light="!storeSettings().isLight" :short="false" class="mb-2" classes="w-full" />
      <div @keyup.enter="doLogin">
        <b-form class="mt-1">
          <b-input-group>
            <b-form-input
              id="configserver"
              data-testid="login_configserver"
              v-model="opsiconfigserver"
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
            <b-button variant="primary" @click="toggleShowPassword" size="sm" class="mb-2 text-light">
              <span class="sr-only">{{ showPassword? $t('form.password.hide'): $t('form.password.show') }}</span>
              <IconIIcon :icon="showPassword ? icon.valueShow : icon.valueHide" />
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
      <!-- <TestFetch /> -->
    </b-card>
  </div>
</template>

<script setup>
import { useIcons } from "../../composables/mixins/useIcons"
import { useStrings } from "../../composables/mixins/useStrings"
import { useNotification } from "../../composables/mixins/useNotification"
import {useConfigserver} from '@/composables/mixins/useGet'
// import { ElNotification } from "element-plus"
const notificationSuccess = useNotification().success
const notificationError = useNotification().error
// notificationError('It works', 'not')
// const color = useColorMode();
// const settings = storeSettings()
// const authStore = storeAuth()

const config = useRuntimeConfig()
// const basePage = config.public.BASE_PAGE
// const isA = Boolean(useCookie('opsiconfd-session') && localStorage.getItem('username'))

const route = useRoute()
const router = useRouter()
const staticStrings = useStrings()
const mq = useMQ()
const icon = useIcons()
const { t } = useI18n()

const form = ref({ username: '', password: '' })
const showPassword = ref(false)
useConfigserver().getOpsiConfigServer()

const opsiconfigserver = ref('<could not get opsiconfigserver id>');
opsiconfigserver.value = await useConfigserver().getOpsiConfigServer()

const validUsername = computed({
  get:  () => (form.username !== '') ?  null : false
})
const validPassword = computed({
  get:  () => (form.password !== '') ?  null : false
})

function toggleShowPassword () {
  showPassword.value = !showPassword.value
}

async function doLogin () {
  if (!validUsername || !validPassword) return

  const User = new FormData()
  User.append('username', form.value.username)
  User.append('password', form.value.password)


  const { data, error } = await useApiPOST('/auth/login', User)
  if (error) {
    notificationError(error)
    return
  }
  if (data?.value?.result == 'Login success') {
    notificationSuccess('Successfull. Redirect to clients')
    console.log("login successful")
    storeAuth().login(form.value.username)
    storeAuth().setSession()
    if (useRoute().name === 'login') {
      useRouter().push({ path: config.public.BASE_PAGE })
    } else {
      useRouter().back()
    }
  }

  // body not readable if error is 403...
  // const errordata = { response: { data: {class: 'AuthenticationError', message: error.value}} }
}
</script>

<style scoped>
</style>