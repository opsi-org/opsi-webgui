<template>
  <div data-testid="BTNLogout">

  <!-- <el-menu-item
    v-if="props.isMenuItem" type="text"
    @click="doLogout"
  >
    <IconIIcon :icon="icon.logout" />
  </el-menu-item>
  <b-button
    v-else
    ref="btn-logout"
    v-bind="props"
    data-testid="ButtonBTNLogout"
    :title="$t('button.logout')"
    size="sm"
    class="inline-flex"
    style="display: inline-flex;"
    block
    variant="outline-primary"
    @click="doLogout"
  >
    <IconIIcon :icon="icon.logout" />
    {{ $t('button.logout') }}
  </b-button> -->
  <el-popconfirm
    :title="$t('button.logout.confirm')"
    :confirm-button-text="$t('button.logout.confirm')"
    :cancel-button-text="$t('button.logout.cancel')"
    id="ButtonBTNLogout-ConfirmID"
    ref="ButtonBTNLogout-ConfirmRef"
    @confirm="doLogout"
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
  </div>
</template>

<script setup lang="ts">
import { useIcons } from '@/composables/mixins/useIcons'
import { useNotification } from '../../composables/mixins/useComponent'
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

  const { data, error } = await useApiPOST('/auth/logout')
  if (error?.response?.data?.message === 'Unauthorized') {

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
