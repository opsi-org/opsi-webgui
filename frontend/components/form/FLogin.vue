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
          <el-button data-testid="btn-login" :disabled="!form.username || !form.password" class="mt-2 login w-100" @click="doLogin">
            {{ $t('button.login') }}
          </el-button>
          saml:
          <el-button data-testid="btn-login-saml" class="mt-2 login w-100">
              <NuxtLink :to="urlSaml" class="w-100">
              {{ $t('button.login.saml') }}
            </NuxtLink>
          </el-button>
        </el-form>
      </div>
    </el-card>
  </main>
</template>

<script setup lang="ts">
import { useNotification } from "../../composables/mixins/useComponent"
import { useConfigserver } from '@/composables/mixins/useGet'

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

const urlSaml = config.public.NUXT_PUBLIC_API_BASE + '/auth/saml/login'
onMounted( async () => {
  isLoading.value = true
  const useServerGet = await useConfigserver(true, undefined, $t)
  const os = await useServerGet.getOpsiConfigServer()
  opsiconfigserver.value = os || ''
  const username = storeAuth().username
  if (username) {
    form.value.username = username
    handleSuccessfulLogin()
  }
  isLoading.value = false
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

async function doLoginSaml() {
  isLoading.value = true
  // try {
  //   // url: string, body:any=undefined, prePath: string|undefined = undefined,
  //   // const { data, error } = await useApiPOST<TResult>('/auth/login/saml', undefined, '')
  //   // const { data, error } = await useApiGET<TResult>('/auth/login/saml', '')
  //   if (error) {
  //     notifyError({ message: error?.response?.data?.message || $t('message.error.generic') })
  //     return
  //   }
  //   if (data.value == undefined) {
  //     notifyError({ message: $t('message.error.empty-response', { details: "Login" }) })
  //     return
  //   }
  //   if (data.value.result !== 'Login success') {
  //     notifyError({ message: $t('message.error.login-failed') })
  //     return
  //   }
  //   handleSuccessfulLogin()
  // } catch (error) {
  //   notifyError({ message: $t('message.error.unexpected') })
  // } finally {
    isLoading.value = false
  // }
}
</script>