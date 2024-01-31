<template>
  <el-popconfirm
    :title="$t('message.confirm.logout')"
    :confirm-button-text="$t('button.confirm')"
    :cancel-button-text="$t('label.cancel')"
    id="ButtonBTNLogout-ConfirmID"
    ref="ButtonBTNLogout-ConfirmRef"
    @confirm="doLogout"
    data-testid="BTNLogout"
  >
    <template #reference>
      <el-button
        class="h-full max-h-full min-h-full border-0 rounded-none"
        style="--el-border-radius-base: 0px"
      >
        <IconIIcon :icon="icon.logout" />
        <p v-if="isMobile" class="pt-3 ml-1">{{ $t('button.logout') }}</p>
      </el-button>
    </template>
  </el-popconfirm>
</template>

<script setup lang="ts">
import { useIcons } from '@/composables/mixins/useIcons'
import { useNotification } from '../../composables/mixins/useComponent'
import type { T_Logout } from '~/types/APItypes';
const isMobile = ref(useMQ().isMobile.value)
watch(() => useMQ().isMobile, () => {
  isMobile.value = useMQ().isMobile.value
})
const icon = useIcons()
const notificationError = useNotification().error

const authStore = storeAuth() // autho imported
const props = defineProps({
  abortClick: { type: Boolean, default: false},
  isMenuItem: { type: Boolean, default: false}
})

async function doLogout () {
  if (props.abortClick) { return }

  const { data, error } = await useApiPOST<T_Logout>('/auth/logout')
  if (error?.response.data.message === 'Unauthorized') {

  } else if (error) {
    console.log("error", error.response.data.message)
    notificationError(error)
    return
  }

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
