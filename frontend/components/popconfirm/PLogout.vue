<template>
  <el-popconfirm
    :title="$t('message.confirm.logout')"
    :confirm-button-text="$t('button.confirm')"
    :cancel-button-text="$t('label.cancel')"
    @confirm="doLogout"
    data-testid="BTNLogout"
  >
    <template #reference>
      <!-- bg-opsi-blue h-full max-h-full min-h-full border-0 rounded-none -->
      <el-button :class="{
        'min-h-full': true,
        [btnClass]: true
      }"
      style="border: none">
        <IconIIcon :icon="icon.logout" />
        <p v-if="isMobile" class="pt-3 ml-1">{{ $t('button.logout') }}</p>
      </el-button>
    </template>
  </el-popconfirm>
</template>

<script setup lang="ts">
import { useIcons } from '@/composables/mixins/useIcons'
import { useNotification } from '../../composables/mixins/useComponent'
import { useMBus } from '~/composables/mixins/useMessagebus';
import type { T_Logout } from '~/types/APItypes';
const isMobile = ref(useMQ().isMobile.value)
watch(() => useMQ().isMobile, () => {
  isMobile.value = useMQ().isMobile.value
})
const icon = useIcons()
const $t = useI18n().t
const { notifyError } = useNotification()

const authStore = storeAuth() // autho imported
const props = defineProps({
  abortClick: { type: Boolean, default: false},
  isMenuItem: { type: Boolean, default: false},
  btnClass: { type: String, default: 'min-w-14 w-14'}
})

async function doLogout () {
  if (props.abortClick) { return }

  const { data, error } = await useApiPOST<T_Logout>('/auth/logout')
  if (error?.response.data.message === 'Unauthorized' /* xxx */ || error?.response.data.message === 'Method Not Allowed' /*405*/) {
    // pass, cause already logged out
  } else if (error) {
    notifyError({ message: error?.response?.data?.message })
    return
  }

  console.log('Logged out')
  useMBus(undefined, false, $t).wsDisconnect()
  authStore.logout()
  authStore.clearSession()

  if (useRoute().name !== 'login') {
    console.log('Redirecting to login page')
    reloadNuxtApp()
  }
  // TODO clearAllSelection()
}
</script>
