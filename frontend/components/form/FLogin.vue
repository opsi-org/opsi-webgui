<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <main data-testid="FLogin" :class="$mq === 'mobile' ? 'px-[4%]' : ''" v-loading="isLoading">
    <h1 class="sr-only">{{ $t('login') }}</h1>
    <el-card
      class="text-center bg-opsi-blue text-white mx-auto"
      :class="$mq === 'mobile' ? 'w-full' : 'w-1/2; max-w-md'"
    >
      <IconIOpsiLogo :light="false" :short="false" class="mb-2" classes="w-full" />
      <div @keyup.enter="doLogin">
        <el-form class="mt-1">
          <el-form-item class="mb-1">
            <el-input
              id="configserver"
              data-testid="login_configserver"
              v-model="opsiconfigserver"
              :aria-label="$t('configserver')"
              disabled
              readonly
              :placeholder="opsiconfigserver"
            />
          </el-form-item>
          <el-form-item class="mb-1" v-if="authMethods.includes(METHOD_PASSWORD)">
            <el-input
              id="username"
              ref="inputUsername"
              v-model="form.username"
              :disabled="isLoading"
              data-testid="login-username-input"
              :aria-label="$t('username')"
              :placeholder="$t('username')"
              :state="validUsername"
              class="username"
            />
          </el-form-item>
          <el-form-item class="mb-1" v-if="authMethods.includes(METHOD_PASSWORD)">
            <el-input
              id="password"
              v-model="form.password"
              :disabled="isLoading"
              data-testid="login-password-input"
              :aria-label="$t('password')"
              :placeholder="$t('password')"
              :state="validPassword"
              show-password
              class="password"
            />
          </el-form-item>
          <el-form-item v-if="authMethods.includes(METHOD_PASSWORD)">
            <el-input
              data-testid="login_otp"
              v-model="totp"
              :disabled="isLoading"
              :aria-label="$t('oneTimePassword')"
              :placeholder="$t('oneTimePassword')"
              show-password
            />
          </el-form-item>
          <el-button
            v-if="authMethods.includes(METHOD_PASSWORD)"
            data-testid="btn-login"
            :title="$t('login')"
            :disabled="!form.username || !form.password"
            class="mt-2 login w-100"
            @click="doLogin"
          >
            {{ $t('login') }}
          </el-button>
          <a
            v-if="authMethods.includes(METHOD_SAML)"
            data-testid="btn-login-saml"
            class="el-button mt-2 login w-100"
            :href="samlUrl"
            :title="$t('loginWithSAML')"
            >{{ $t('loginWithSAML') }}</a
          >
          <el-alert
            v-if="authMethods === undefined || authMethods == ''"
            type="warning"
            :closable="false"
            effect="dark"
            show-icon
            class="mt-4"
          >
            {{ $t('message.login.noAuthMethod') }}
          </el-alert>
        </el-form>
      </div>
    </el-card>
  </main>
</template>

<script setup lang="ts">
  import { useNotification } from '../../composables/mixins/useComponent'
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
  const opsiconfigserver = ref('')
  const authMethods = ref('')
  const inputUsername = ref()
  const METHOD_PASSWORD = 'password'
  const METHOD_SAML = 'saml'

  onMounted(async () => {
    isLoading.value = true
    inputUsername.value?.focus()
    try {
      const useServerGet = await useConfigserver(true, undefined, $t)
      const res = await useServerGet.getOpsiConfigServerWithHeaders()
      opsiconfigserver.value = res.data || ''
      authMethods.value = res.headers.get(opsiheaders.xopsiauthmethods) || METHOD_PASSWORD
      const username = storeAuth().username
      if (username) {
        form.value.username = username
        handleSuccessfulLogin()
      }
    } catch (error) {
      console.error(error)
    } finally {
      isLoading.value = false
    }
  })

  const samlUrl = computed(() => {
    const webguisRedirect: string = (useRoute().query?.redirect as string) || ''
    const ownpath: string = config.public.OWN_PATH
    if (webguisRedirect && webguisRedirect.startsWith(ownpath)) {
      return `/auth/saml/login?redirect=${webguisRedirect}`
    } else if (webguisRedirect) {
      return `/auth/saml/login?redirect=${ownpath}${webguisRedirect}`
    }
    return `/auth/saml/login?redirect=${encodeURIComponent(window.location.href)}`
  })

  const validUsername = computed<boolean | null>(() => (form.value.username !== '' ? null : false))
  const validPassword = computed(() => (form.value.password !== '' ? null : false))

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

  async function doLogin() {
    storeAuth().setErrorLoggedOutShown(false)
    if (validUsername.value === false || validPassword.value === false) {
      useNotification().notifyError({
        message: $t('message.login.invalidCredentials'),
      })
      return
    }
    isLoading.value = true

    try {
      const User = createUserFormData()
      const { data, error } = await useApiPOST<TResult>('/auth/login', User)
      if (error) {
        notifyError({
          message: error?.response?.data?.message || $t('message.error.general'),
        })
        return
      }
      if (data.value == undefined) {
        notifyError({
          message: $t('message.error.emptyResponse', { details: 'Login' }),
        })
        return
      }
      if (data.value.result !== 'Login success') {
        notifyError({ message: $t('message.login.failed') })
        return
      }
      handleSuccessfulLogin()
    } catch (error) {
      notifyError({ message: error || $t('message.error.general') })
    } finally {
      isLoading.value = false
    }
  }

  function handleSuccessfulLogin() {
    storeAuth().setErrorLoggedOutShown(false)
    notifySuccess({ message: $t('message.page.redirect') })
    storeAuth().setSession()
    const route = useRoute()
    const router = useRouter()
    if (route.name === 'login') {
      const redirectPath = route.query?.redirect?.toString() || config.public.BASE_PAGE
      router.push(redirectPath)
    } else {
      router.back()
    }
  }
</script>
