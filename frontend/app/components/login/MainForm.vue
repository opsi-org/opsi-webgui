<!--
  This file is part of opsi-webgui application.
  opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
  Copyright (c) uib GmbH <info@uib.de> 2026
  All rights reserved.
  License: AGPL-3.0

  LoginForm - Authentication form with login inputs and session management.
-->
<template>
  <CoreAppCard class="shadow-lg bg-(--color-background)">
    <h1 class="sr-only">{{ $t('auth.login') }}</h1>
    <div class="text-center mb-6">
      <CoreAppImage :src="isDark ? '~/assets/images/opsi-webgui-dark.svg' : '~/assets/images/opsi-webgui-light.svg'"
        alt="opsi-WebGUI Logo" image-class="mx-auto mb-2 h-50" />
    </div>
    <CoreAppForm @submit="handleLogin" class="space-y-5">
      <CoreAppAlertInline v-if="errorMessage" color="error" variant="soft" closable @close="errorMessage = ''">
        <template #title>{{ errorMessage }}</template>
      </CoreAppAlertInline>

      <div class="flex items-center gap-2 p-3 rounded-lg bg-(--color-surface) border">
        <CoreAppIcon :name="icons.serverStack" class="w-5 h-5 text-opsi-blue" />
        <div class="flex-1 min-w-0">
          <span class="text-xs text-(--color-text-muted) block">{{ $t('servers.config') }}</span>
          <span v-if="configServerName" class="font-medium text-(--color-text) truncate block">{{
            configServerName
          }}</span>
          <span v-else class="font-medium block italic">{{ $t('common.loading') }}</span>
        </div>
      </div>

      <CoreAppInput v-model="cred.username" :placeholder="String($t('auth.username'))"
        :aria-label="String($t('auth.username'))" :icon="icons.user" autocomplete="username" required class="w-full" />
      <CoreAppPasswordInput v-model="cred.password" :placeholder="String($t('auth.password'))"
        :aria-label="String($t('auth.password'))" :icon="icons.key" autocomplete="current-password" required
        class="w-full" />
      <div class="space-y-3 pt-2">
        <CoreAppButton type="submit" block :disabled="!cred.username || !cred.password" color="primary"
          :loading="loading">
          {{ $t('auth.login') }}</CoreAppButton>
        <div v-if="showSaml" class="relative my-4">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-(--color-border)" />
          </div>
          <div class="relative flex justify-center text-sm"><span
              class="px-2 bg-(--color-background) text-(--color-text-muted)">{{
                $t('common.or') }}</span></div>
        </div>
        <CoreAppButton v-if="showSaml" type="button" block size="lg" variant="outline" color="primary"
          @click="samlLogin">
          {{ $t('auth.loginSaml') }}</CoreAppButton>
      </div>
    </CoreAppForm>
  </CoreAppCard>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/userStore'

const icons = useIcons()
const { t: $t } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()
const userStore = useUserStore()
const colorMode = useColorMode()
const { getConfigServer, callLogin, getUserSettings } = useApiHelpers()
const { fetchPostLoginData } = useCachedData()

const isDark = computed(() => colorMode.preference === 'dark')

const cred = reactive({ username: '', password: '' })
const loading = ref(false)
const showSaml = ref(true)
const errorMessage = ref('')
const configServerName = ref('')

function getDefaultPage(): string {
  return getDefaultPageFromCookie(config.public.BASE_PAGE as string || '/clients')
}

onMounted(async () => {
  errorMessage.value = ''
  try {
    const result = await getConfigServer()
    if (result.data) {
      configServerName.value = typeof result.data === 'string' ? result.data : (result.data as { result?: string })?.result || ''
    }
    if (result.error) {
      errorMessage.value = ` ${result.error.message || ''}`
    }
  } catch {
  }

  const samlSession = route.query.session as string
  if (samlSession) {
    try {
      const settings = await getUserSettings()
      if (settings.data?.username) {
        userStore.login(settings.data.username)
        await fetchPostLoginData()
        await navigateTo(getDefaultPage())
      } else {
        errorMessage.value = String($t('auth.loginFailed'))
      }
    } catch {
      errorMessage.value = String($t('auth.loginFailed'))
    }
  }
})

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''
  userStore.setErrorLoggedOutShown(false)

  try {
    const result = await callLogin(cred.username, cred.password)

    if (result.data?.result === 'Login success') {
      userStore.login(cred.username)
      await fetchPostLoginData()
      const redirectRaw = route.query.redirect?.toString()
      if (redirectRaw) {
        await navigateTo(redirectRaw, { replace: true })
      } else {
        await navigateTo(getDefaultPage())
      }
    } else {
      errorMessage.value = $t('auth.loginFailed')
    }
  } catch (e: unknown) {
    const error = e as { statusCode?: number, message?: string }
    if (error.statusCode === 401) {
      errorMessage.value = $t('auth.invalid')
    } else {
      errorMessage.value = error.message || $t('auth.loginFailed')
    }
  } finally {
    loading.value = false
  }
}

const samlLogin = () => {
  const currentUrl = window.location.origin + (config.public.OWN_PATH || '/addons/webgui/app') + '/login?session=saml'
  window.location.href = '/auth/saml/login?redirect=' + encodeURIComponent(currentUrl)
}
</script>
