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
        <img v-if="isDark" src="~/assets/images/opsi_logo_bee_light.svg" alt="OPSI Bee" class="h-14 mx-auto mb-3" />
        <img v-else src="~/assets/images/opsi_logo_bee_dark.svg" alt="OPSI Bee" class="h-14 mx-auto mb-3" />
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">opsi-WebGUI</h1>
      </div>
      <form @submit.prevent="handleLogin" class="space-y-5">
        <UFormGroup :label="String($t('username'))">
          <UInput v-model="cred.username" :placeholder="String($t('username'))" size="lg" :icon="icons.user"
            autocomplete="username" required class="w-full" />
        </UFormGroup>
        <UFormGroup :label="String($t('password'))">
          <UInput v-model="cred.password" :placeholder="String($t('password'))" type="password" size="lg"
            :icon="icons.key" autocomplete="current-password" required class="w-full" />
        </UFormGroup>
        <div class="space-y-3 pt-2">
          <UButton type="submit" block size="lg" :disabled="!cred.username || !cred.password" color="primary"
            :loading="loading">{{ $t('login') }}</UButton>
          <div v-if="showSaml" class="relative my-4">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300 dark:border-gray-700" />
            </div>
            <div class="relative flex justify-center text-sm"><span
                class="px-2 bg-white dark:bg-gray-800 text-gray-500">{{ $t('or') }}</span></div>
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
const userStore = useUserStore()
const colorMode = useColorMode()

const isDark = computed(() => colorMode.value === 'dark')

const cred = reactive({ username: '', password: '' })
const loading = ref(false)
const showSaml = ref(true)

const handleLogin = async () => {
  loading.value = true
  try {
    await new Promise(r => setTimeout(r, 500))
    userStore.login(cred.username)
    await navigateTo('/clients')
  } finally { loading.value = false }
}

const samlLogin = () => { window.location.href = '/api/auth/saml' }
</script>
