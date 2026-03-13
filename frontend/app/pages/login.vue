<!--
This file is part of opsi-webgui application.
opsi-webgui is part of the desktop management solution opsi http://www.opsi.org
Copyright (c) uib GmbH <info@uib.de> 2025
All rights reserved.
License: AGPL-3.0
-->
<template>
  <div class="w-full max-w-md p-4">
    <UCard class="shadow-lg">
      <div class="text-center mb-6">
        <img v-if="isDark" src="~/assets/images/opsi_webgui_with_text_light.svg" alt="OPSI Bee"
          class="mx-auto mb-2 h-50" />
        <img v-else src="~/assets/images/opsi_webgui_with_text_dark.svg" alt="OPSI Bee" class="mx-auto mb-2 h-50" />
      </div>
      <form @submit.prevent="handleLogin" class="space-y-5">
        <UAlert v-if="errorMessage" color="error" variant="soft" :close-button="{ icon: 'i-heroicons-x-mark' }"
          @close="errorMessage = ''">
          <template #title>{{ errorMessage }}</template>
        </UAlert>

        <!-- Config Server Info -->
        <div v-if="configServerName"
          class="flex items-center gap-2 p-3 rounded-lg bg-(--color-surface) dark:bg-(--color-surface) border border-(--color-border) dark:border-(--color-border)">
          <UIcon :name="icons.serverStack" class="w-5 h-5 text-opsi-blue" />
          <div class="flex-1 min-w-0">
            <span class="text-xs text-(--color-text-muted) dark:text-(--color-text-muted) block">{{ $t('configServer')
              ||
              'Config Server' }}</span>
            <span class="text-sm font-medium text-(--color-text) dark:text-(--color-text) truncate block">{{
              configServerName
              }}</span>
          </div>
          <UIcon :name="icons.check" class="w-4 h-4 text-green-500" />
        </div>

        <UFormField :label="String($t('username'))">
          <UInput v-model="cred.username" :placeholder="String($t('username'))" size="lg" :icon="icons.user"
            autocomplete="username" required class="w-full" />
        </UFormField>
        <UFormField :label="String($t('password'))">
          <UInput v-model="cred.password" :placeholder="String($t('password'))" type="password" size="lg"
            :icon="icons.key" autocomplete="current-password" required class="w-full" />
        </UFormField>
        <div class="space-y-3 pt-2">
          <UButton type="submit" block size="lg" :disabled="!cred.username || !cred.password" color="primary"
            :loading="loading">{{ $t('login') }}</UButton>
          <div v-if="showSaml" class="relative my-4">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-(--color-border) dark:border-(--color-border)" />
            </div>
            <div class="relative flex justify-center text-sm"><span
                class="px-2 bg-white dark:bg-(--color-surface) text-(--color-text-muted) dark:text-(--color-text-muted)">{{
                  $t('or') }}</span></div>
          </div>
          <UButton v-if="showSaml" type="button" block size="lg" variant="outline" color="primary" @click="samlLogin">{{
            $t('loginWithSAML') }}</UButton>
        </div>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from '~/stores/userStore'

definePageMeta({ layout: 'auth' })

const icons = useIcons()
const { t: $t } = useI18n()
const route = useRoute()
const config = useRuntimeConfig()
const userStore = useUserStore()
const colorMode = useColorMode()
const { $customFetch } = useNuxtApp() as unknown as { $customFetch: typeof $fetch }

const isDark = computed(() => colorMode.preference === 'dark')

const cred = reactive({ username: '', password: '' })
const loading = ref(false)
const showSaml = ref(true)
const errorMessage = ref('')
const configServerName = ref('')

// Fetch config server name on mount
onMounted(async () => {
  try {
    const result = await $customFetch<string>('/user/opsiserver')
    if (result) {
      configServerName.value = typeof result === 'string' ? result : (result as any)?.result || ''
    }
  } catch {
    // Not critical - ignore if not reachable pre-login
  }

  // Handle SAML callback (token in URL after SAML redirect)
  const samlSession = route.query.session as string
  if (samlSession) {
    // SAML login returned - the session cookie should already be set by the backend
    try {
      const authResult = await $customFetch<{ result: string; username?: string }>('/auth/session')
      if (authResult && (authResult as any).username) {
        userStore.login((authResult as any).username)
        const redirectPath = route.query.redirect?.toString() || config.public.BASE_PAGE || '/clients'
        await navigateTo(redirectPath)
      }
    } catch {
      errorMessage.value = String($t('message.login.failed'))
    }
  }
})

const handleLogin = async () => {
  loading.value = true
  errorMessage.value = ''
  userStore.setErrorLoggedOutShown(false)

  try {
    // Create FormData as expected by the backend
    const formData = new FormData()
    formData.append('username', cred.username)
    formData.append('password', cred.password)

    const result = await $customFetch<{ result: string }>('/auth/login', {
      method: 'POST',
      body: formData,
    })

    if (result.result === 'Login success') {
      userStore.login(cred.username)
      // Navigate to redirect path or base page
      const redirectPath = route.query.redirect?.toString() || config.public.BASE_PAGE || '/clients'
      await navigateTo(redirectPath)
    } else {
      errorMessage.value = $t('message.login.failed')
    }
  } catch (e: unknown) {
    const error = e as { statusCode?: number, message?: string }
    if (error.statusCode === 401) {
      errorMessage.value = $t('message.login.invalidCredentials')
    } else {
      errorMessage.value = error.message || $t('message.login.failed')
    }
  } finally {
    loading.value = false
  }
}

const samlLogin = () => {
  // Redirect to SAML login endpoint - backend handles the SAML flow
  const currentUrl = window.location.origin + (config.public.OWN_PATH || '/addons/webgui/app') + '/login'
  window.location.href = (config.public.API_PATH || '/addons/webgui/api') + '/auth/saml?redirect=' + encodeURIComponent(currentUrl)
}
</script>
