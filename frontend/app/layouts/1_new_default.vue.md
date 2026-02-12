<template>
  <!-- right alligned with border-->
  <!--:items="menuItems"-->
  <div
    v-if="authStore.isAuth"
    class="flex justify-between items-center border-b border-gray-300 mb-2 p-1"
    :style="{ width: 'calc(100vw - 1rem)' }"
  >
    <img
      v-if="useColorMode().value === 'light'"
      src="~assets/images/opsi.png"
      alt="opsiconfd Logo"
      class="inline h-12"
    />
    <img v-else src="~assets/images/opsi_dark.png" alt="opsiconfd Logo" class="inline h-12" />
    <UButton
      v-if="authStore.isAuth && !isLoginPage"
      class="inline"
      @click="authStore.logout()"
      icon="i-lucide-log-out"
    >
      {{ $t('button.logout') }}
    </UButton>
  </div>
  <div class="p-2.5">
    <u-alert
      v-if="useLocalStore().globalError"
      type="error"
      :title="$t('error')"
      :description="useLocalStore().globalError"
    />
    <UApp :toaster="toaster">
      <slot />
    </UApp>
  </div>
</template>

<script setup lang="ts">
  import type { NavigationMenuItem } from '@nuxt/ui'
  const toaster = { duration: 5000 }
  const authStore = useAuthStore()
  const route = useRoute()
  const router = useRouter()

  // if not logged in and not on login page, redirect to login
  if (!authStore.isAuth && route.name !== 'login') {
    router.push({ name: 'login' })
  }

  if (authStore.isAuth && route.name !== 'login') {
    // get user configuration after login
    const { data, error } = await apiFetch<any>(baseUrl() + '/user/configuration')
    authStore.config = data.value?.configuration || {}
  }

  const isLoginPage = computed(() => route.name === 'login')

  const menuItems = ref<NavigationMenuItem[]>([
    {
      label: $t('button.logout'),
      icon: 'i-lucide-log-out',
      disabled: true,
      visible: authStore.isAuth && !isLoginPage.value,
      action: () => authStore.logout(),
      class: 'ml-auto',
    },
  ])
</script>
