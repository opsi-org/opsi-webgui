Login page - allows users to log in with username/password or SAML SSO.
<template>
  <div>
    <UCard class="shadow-lg">
      <div class="text-center mb-6">
        <img v-if="isDark" src="~/assets/images/opsi_webgui_with_text_light.svg" alt="opsi-WebGUI Logo"
          class="mx-auto mb-2 h-50" />
        <img v-else src="~/assets/images/opsi_webgui_with_text_dark.svg" alt="opsi-WebGUI Logo"
          class="mx-auto mb-2 h-50" />
      </div>
      <form @submit.prevent="handleLogin" class="space-y-5">
        <SharedAlertInline v-if="errorMessage" color="error" variant="soft" closable @close="errorMessage = ''">
          <template #title>{{ errorMessage }}</template>
        </SharedAlertInline>

        <div v-if="configServerName"
          class="flex items-center gap-2 p-3 rounded-lg bg-(--color-surface) dark:bg-(--color-surface) border border-(--color-border) dark:border-(--color-border)">
          <UIcon :name="icons.serverStack" class="w-5 h-5 text-opsi-blue" />
          <div class="flex-1 min-w-0">
            <span class="text-xs text-(--color-text-muted) dark:text-(--color-text-muted) block">{{ $t('configServer')
              }}</span>
            <span class="font-medium text-(--color-text) dark:text-(--color-text) truncate block">{{
              configServerName
              }}</span>
          </div>
        </div>

        <UInput v-model="cred.username" :placeholder="String($t('username'))" :icon="icons.user" autocomplete="username"
          required class="w-full" />
        <SharedPasswordInput v-model="cred.password" :placeholder="String($t('password'))" :icon="icons.key"
          autocomplete="current-password" required class="w-full" />
        <div class="space-y-3 pt-2">
          <UButton type="submit" block :disabled="!cred.username || !cred.password" color="primary" :loading="loading">
            {{
              $t('login') }}</UButton>
          <div v-if="showSaml" class="relative my-4">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-(--color-border) dark:border-(--color-border)" />
            </div>
            <div class="relative flex justify-center text-sm"><span
                class="px-2 bg-white dark:bg-(--color-surface) text-(--color-text-muted) dark:text-(--color-text-muted)">{{
                  $t('or') }}</span></div>
          </div>
          <UButton v-if="showSaml" type="button" block size="lg" variant="soft" color="primary" @click="samlLogin">{{
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
const { getConfigServer, callLogin, getUserSettings } = useApiHelpers()
const { fetchPostLoginData } = useCachedData()

const isDark = computed(() => colorMode.preference === 'dark')

const cred = reactive({ username: '', password: '' })
const loading = ref(false)
const showSaml = ref(true)
const errorMessage = ref('')
const configServerName = ref('')

function getDefaultPage(): string {
  const match = document.cookie.match(/(?:^|; )opsi-webgui-default-page=([^;]*)/)
  const stored = match?.[1] ? decodeURIComponent(match[1]) : null
  const validPages = ['/dashboard', '/clients', '/products', '/servers', '/admin/terminal', '/admin/maintenance', '/admin/diagnostics']
  if (stored && validPages.includes(stored)) return stored
  return config.public.BASE_PAGE as string || '/clients'
}

onMounted(async () => {
  try {
    const result = await getConfigServer()
    if (result.data) {
      configServerName.value = typeof result.data === 'string' ? result.data : (result.data as any)?.result || ''
    }
  } catch {

  }

  const samlSession = route.query.session as string
  if (samlSession) {
    try {
      // After SAML redirect, the session cookie is set by opsiconfd.
      // Use the addon's own auth endpoint to verify and get the username.
      const settings = await getUserSettings()
      if (settings.data?.username) {
        userStore.login(settings.data.username)
        await fetchPostLoginData()
        await navigateTo(getDefaultPage())
      } else {
        errorMessage.value = String($t('message.login.failed'))
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
    const result = await callLogin(cred.username, cred.password)

    if (result.data?.result === 'Login success') {
      userStore.login(cred.username)
      await fetchPostLoginData()
      const redirectPath = route.query.redirect?.toString() || getDefaultPage()
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
  const currentUrl = window.location.origin + (config.public.OWN_PATH || '/addons/webgui/app') + '/login?session=saml'
  window.location.href = '/auth/saml/login?redirect=' + encodeURIComponent(currentUrl)
}
</script>
