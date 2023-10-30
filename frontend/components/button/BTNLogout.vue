<template>
  <b-button
    ref="btn-logout"
    v-bind="props"
    data-testid="ButtonBTNLogout"
    :title="$t('button.logout')"
    size="sm"
    block
    variant="outline-primary"
    @click="doLogout"
  >
    <IconIIcon :icon="icon.logout" />
    {{ $t('button.logout') }}
  </b-button>
</template>

<script lang="ts" setup>
import { useAPI } from '../../composables/useApiFetch' // actually autoimported
import { useAuthStore } from '../../store/authsstore' // actually autoimported
import { useIcons } from '../../composables/mixins/useIcons'
import { useNotification } from '../../composables/mixins/useNotification'
import { useRoute, useRouter } from 'nuxt/app' // actually autoimported
const icon = useIcons()
const notificationSuccess = useNotification().success
const notificationError = useNotification().error

const authStore = useAuthStore() // autho imported
const props = defineProps({
  abortClick: { type: Boolean, default: false}
})

async function doLogout () {
  if (props.abortClick) { return }

  // await this.callLogout()
  const { data, error } = await useAPI('/auth/logout').post().json()
  if (error.value) {
    console.log("error", error.value)
    notificationError(error.value, 'error'); return
  }
  notificationSuccess('ok')

  // TODO wsDisconnect()
  authStore.logout()
  authStore.clearSession()
  // authStore.setExpiresInterval(undefined)

  if (useRoute().name !== 'login') {
    await useRouter().push({ path: '/login' })
  }
  // TODO clearAllSelection()
}
</script>
