<template>
  <main data-testid="FLogin" :class="$mq === 'mobile'? 'px-[4%]': ''" v-loading="isLoading">
    <h1 class="sr-only">{{ $t('button.login') }}</h1>
    <el-card class="text-center bg-opsi-blue text-white mx-auto" :class="$mq === 'mobile'? 'w-full' : 'w-1/2; max-w-md'">
      <IconIOpsiLogo :light="false" :short="false" class="mb-2" classes="w-full" />
      <div @keyup.enter="doLogin">
        <el-form class="mt-1">
          <el-form-item class="mb-1">
            <el-input id="configserver" data-testid="login_configserver" v-model="opsiconfigserver" :aria-label="$t('title.configserver')" disabled readonly :placeholder="opsiconfigserver"/>
          </el-form-item>
          <el-form-item class="mb-1">
            <el-input id="username" v-model="form.username" :disabled="isLoading" data-testid="login_username" :aria-label="$t('form.username')" :placeholder="$t('form.username')" :state="validUsername" class="username" />
          </el-form-item>
          <el-form-item class="mb-1">
            <el-input id="password" v-model="form.password" :disabled="isLoading" data-testid="login_password" :aria-label="$t('form.password')" :placeholder="$t('form.password')" :state="validPassword" show-password class="password" />
          </el-form-item>
          <el-form-item>
            <el-input data-testid="login_otp" v-model="totp" :disabled="isLoading" :aria-label="$t('table.fields.oneTimePassword')" :placeholder="$t('table.fields.oneTimePassword')" show-password />
          </el-form-item>
          <el-button v-if="authMethods.includes('password')" data-testid="btn-login"
            :title="$t('button.login.description')"
            :disabled="!form.username || !form.password"
            class="mt-2 login w-100"
            @click="doLogin">
            {{ $t('button.login') }}
          </el-button>
          <a v-if="authMethods.includes('saml')"  data-testid="btn-login-saml"
            class="el-button mt-2 login w-100"
            :href="samlUrl"
            :title="$t('button.login.saml.description')"
          >{{ $t('button.login.saml') }}</a>
        </el-form>
      </div>
    </el-card>
  </main>
</template>

<script setup lang="ts">
import { useNotification } from "../../composables/mixins/useComponent"
import { useConfigserver } from '@/composables/mixins/useGet'
// import { opsiheaders } from '@/utils/uconstants'
interface TResult {
  result: string
}
const $t = useI18n().t
const { notifySuccess, notifyError } = useNotification()
const config = useRuntimeConfig()
const $mq = useMQ().$mq
const form = ref({ username: '', password: '' })
const isLoading = ref(true)
const totp = ref('')
const opsiconfigserver = ref('');
const authMethods = ref('')

onMounted( async () => {
  isLoading.value = true
  const useServerGet = await useConfigserver(true, undefined, $t)
  const res = await useServerGet.getOpsiConfigServerWithHeaders()
  opsiconfigserver.value = res.data || ''
  authMethods.value = res.headers.get(opsiheaders.xopsiauthmethods) || ''
  const username = storeAuth().username
  if (username) {
    form.value.username = username
    handleSuccessfulLogin()
  }
  isLoading.value = false
})

const samlUrl = computed(() => {
  const webguisRedirect: string = useRoute().query?.redirect as string || ''
  const ownpath:string = config.public.OWN_PATH
  if (webguisRedirect && (webguisRedirect.startsWith(ownpath))) {
    return `/auth/saml/login?redirect=${webguisRedirect}`
  } else if (webguisRedirect) {
    return `/auth/saml/login?redirect=${ownpath}${webguisRedirect}`
  }
  return `/auth/saml/login?redirect=${encodeURIComponent(window.location.href)}`
})

const validUsername = computed<boolean|null>(
  () => (form.value.username !== '') ?  null : false
)
const validPassword = computed(
  () => (form.value.password !== '') ?  null : false
)

function createUserFormData() {
  const User = new FormData()
  User.append('username', form.value.username)
  let newPassword = form.value.password
  if (totp.value !== null) {
    newPassword += totp.value
  }
  User.append('password', newPassword)
  return User
}

async function doLogin () {
  if (!validUsername || !validPassword) return
  isLoading.value = true

  try {
    const User = createUserFormData()
    const { data, error } = await useApiPOST<TResult>('/auth/login', User)
    if (error) {
      notifyError({ message: error?.response?.data?.message || $t('message.error.generic') })
      return
    }
    if (data.value == undefined) {
      notifyError({ message: $t('message.error.empty-response', { details: "Login" }) })
      return
    }
    if (data.value.result !== 'Login success') {
      notifyError({ message: $t('message.error.login-failed') })
      return
    }
    handleSuccessfulLogin()
  } catch (error) {
    notifyError({ message: $t('message.error.unexpected') })
  } finally {
    isLoading.value = false
  }
}

function handleSuccessfulLogin() {
  notifySuccess({ message: $t('message.page.redirect') })
  storeAuth().setSession()
  const route = useRoute()
  const router = useRouter()
  if (route.name === 'login') {
    if (route.query?.redirect) {
      router.push({ path: route.query.redirect.toString() })
    } else {
      router.push({ path: config.public.BASE_PAGE })
    }
  } else {
    router.back()
  }
}
</script>